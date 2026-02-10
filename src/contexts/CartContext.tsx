import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/lib/axios";
import { useMall } from "@/contexts/MallContext";
import { useAuth } from "./AuthContext";

/* ================= TYPES ================= */

export type CartItem = {
  id: number;
  quantity: number;
  total_price: string;
  product: {
    id: number;
    name: string;
    price: string;
    image?: string | null;
  };
};

export type Cart = {
  id: number;
  mall: string | number;
  items: CartItem[];

  total_amount: string;
  taxable_subtotal: string;
  gst_total: string;
  cgst: string;
  sgst: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: any;
};

type MergeResult = {
  cart: Cart;
  had_existing_items: boolean;
  merged_count: number;
};

type CartContextType = {
  cart: Cart | null;
  count: number;
  isGuest: boolean;

  fetchCart: () => Promise<void>;
  addToCart: (
    product: { id: number; name: string; price: string; image?: string | null },
    qty?: number
  ) => Promise<void>;
  updateItem: (cartItemId: number, qty: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCartIntoServer: () => Promise<MergeResult | null>;
};

const CartContext = createContext<CartContextType | null>(null);

/* ================= HELPERS ================= */

const toNumber = (value: any) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
};

const guestKey = (mallId: string | number) =>
  `guest_cart_${String(mallId)}`;

const round2 = (x: number) => Math.round(x * 100) / 100;

const calculateGuestTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, it) => {
    const price = toNumber(it.product.price);
    return sum + price * it.quantity;
  }, 0);

  const payable = round2(total).toFixed(2);

  return {
    total_amount: payable,
    taxable_subtotal: payable,
    gst_total: "0.00",
    cgst: "0.00",
    sgst: "0.00",
  };
};

/* ================= PROVIDER ================= */

export const CartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedMall } = useMall();
  const mallId = selectedMall?.id;

  const { isLoggedIn } = useAuth();
  const isGuest = !isLoggedIn;

  const [cart, setCart] = useState<Cart | null>(null);

  /* ================= CART COUNT ================= */

  const count = useMemo(
    () => cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
    [cart]
  );

  /* ================= FETCH CART ================= */

  const fetchCart = useCallback(async () => {
    if (!mallId) {
      setCart(null);
      return;
    }

    try {
      if (isGuest) {
        const local = await getGuestCart();
        setCart(local);
        return;
      }

      const res = await api.get("cart/", {
        params: { mall_id: mallId },
        _silentAuth: true,
      });

      const envelope = res.data as ApiEnvelope<Cart>;
      setCart(envelope.success ? envelope.data : null);
    } catch {
      setCart(null);
    }
  }, [mallId, isGuest]);

  /* ================= AUTH MODE ================= */

  useEffect(() => {
    if (!mallId) return;

    const syncCart = async () => {
      if (isLoggedIn) {
        await mergeGuestCartIntoServer();
      }

      await fetchCart();
    };

    syncCart();

  }, [mallId, isLoggedIn, fetchCart]);

  /* ================= GUEST STORAGE ================= */

  const getGuestCart = async (): Promise<Cart | null> => {
    if (!mallId) return null;
    const raw = await AsyncStorage.getItem(guestKey(mallId));
    return raw ? JSON.parse(raw) : null;
  };

  const saveGuestCart = async (c: Cart | null) => {
    if (!mallId) return;

    if (!c || !c.items.length) {
      await AsyncStorage.removeItem(guestKey(mallId));
    } else {
      await AsyncStorage.setItem(
        guestKey(mallId),
        JSON.stringify(c)
      );
    }
  };

  /* ================= ADD TO CART ================= */

  const addToCart = async (
    product: CartItem["product"],
    qty = 1
  ) => {
    if (!mallId) return;

    if (isGuest) {
      const existing =
        (await getGuestCart()) ||
        ({
          id: 0,
          mall: mallId,
          items: [],
          ...calculateGuestTotals([]),
        } as Cart);

      const items = [...existing.items];
      const idx = items.findIndex(
        (x) => x.product.id === product.id
      );

      if (idx >= 0) {
        items[idx].quantity += qty;
        items[idx].total_price = (
          toNumber(product.price) * items[idx].quantity
        ).toFixed(2);
      } else {
        items.push({
          id: product.id,
          quantity: qty,
          total_price: (
            toNumber(product.price) * qty
          ).toFixed(2),
          product,
        });
      }

      const updated: Cart = {
        id: 0,
        mall: mallId,
        items,
        ...calculateGuestTotals(items),
      };

      setCart(updated);
      await saveGuestCart(updated);
      return;
    }

    const res = await api.post("cart/add/", {
      product_id: product.id,
      quantity: qty,
    });

    setCart(res.data.data);
  };

  /* ================= UPDATE ================= */

  const updateItem = async (id: number, qty: number) => {
    if (!mallId) return;

    if (isGuest) {
      const c = await getGuestCart();
      if (!c) return;

      const items =
        qty <= 0
          ? c.items.filter((x) => x.id !== id)
          : c.items.map((x) =>
            x.id === id
              ? {
                ...x,
                quantity: qty,
                total_price: (
                  toNumber(x.product.price) * qty
                ).toFixed(2),
              }
              : x
          );

      if (!items.length) {
        setCart(null);
        await saveGuestCart(null);
        return;
      }

      const updated = {
        ...c,
        items,
        ...calculateGuestTotals(items),
      };

      setCart(updated);
      await saveGuestCart(updated);
      return;
    }

    const res = await api.patch("cart/item/update/", {
      cart_item_id: id,
      quantity: qty,
    });

    setCart(res.data.data);
  };

  const removeItem = (id: number) => updateItem(id, 0);

  /* ================= CLEAR ================= */

  const clearCart = async () => {
    if (!mallId) return;

    if (isGuest) {
      setCart(null);
      await saveGuestCart(null);
      return;
    }

    await api.delete("cart/clear/", {
      params: { mall_id: mallId },
    });

    setCart(null);
  };

  /* ================= MERGE ================= */

  const mergeGuestCartIntoServer = async (): Promise<MergeResult | null> => {
    if (!mallId) return null;

    const local = await getGuestCart();
    if (!local?.items?.length) return null;

    const payload = {
      mall_id: mallId,
      items: local.items.map((x) => ({
        product_id: x.product.id,
        quantity: x.quantity,
      })),
    };

    const res = await api.post("cart/merge-guest/", payload);

    const result = res.data.data;

    await AsyncStorage.removeItem(guestKey(mallId));
    setCart(result.cart);

    return result;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        isGuest,
        fetchCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        mergeGuestCartIntoServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx)
    throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
