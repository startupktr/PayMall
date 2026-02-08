import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import ScreenWrapper from "@/components/ScreenWrapper";
import { useTheme } from "@/contexts/ThemeContext";
import api from "@/lib/axios";
import { Button } from "@/components/Button";

/* ================================
   TYPES
================================ */

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  total_price: string;
};

type OrderDetail = {
  id: number;
  order_number: string;
  status: string;
  subtotal: string;
  tax: string;
  total: string;
  created_at: string;
  items: OrderItem[];
};

/* ================================
   STATUS META
================================ */

const getStatusMeta = (status: string, colors: any) => {
  switch (status) {
    case "PAYMENT_PENDING":
      return {
        label: "Payment Pending",
        color: colors.warning,
        bg: colors.warning + "20",
      };
    case "PAID":
      return {
        label: "Paid",
        color: colors.success,
        bg: colors.success + "20",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        color: colors.error,
        bg: colors.error + "20",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        color: colors.textTertiary,
        bg: colors.borderLight,
      };
    default:
      return {
        label: "Order Created",
        color: colors.info,
        bg: colors.info + "20",
      };
  }
};

/* ================================
   SCREEN
================================ */

export default function OrderDetailsScreen({
  route,
  navigation,
}: any) {
  const { orderId } = route.params;
  const { theme } = useTheme();
  const colors = theme.colors;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(async () => {
    const res = await api.get(`orders/${orderId}/`);

    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Unable to fetch order");
    }

    setOrder(res.data.data);
  }, [orderId]);

  useEffect(() => {
    (async () => {
      try {
        await fetchOrder();
      } catch (e: any) {
        Alert.alert("Error", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchOrder]);

  const statusMeta = useMemo(() => {
    if (!order) return getStatusMeta("CREATED", colors);
    return getStatusMeta(order.status, colors);
  }, [order, colors]);

  if (loading || !order) {
    return (
      <ScreenWrapper scroll={false}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false}>
      <View style={styles.screenContainer}>
        
        {/* 🔥 STICKY HEADER */}
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 4 }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text
            style={[styles.headerTitle, { color: colors.text }]}
          >
            Order Details
          </Text>
        </View>

        {/* 🔥 SCROLLABLE CONTENT */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchOrder}
            />
          }
        >
          <View style={styles.innerContent}>
            <Text
              style={[styles.orderNo, { color: colors.text }]}
            >
              {order.order_number}
            </Text>

            <View
              style={[
                styles.statusChip,
                {
                  backgroundColor: statusMeta.bg,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: statusMeta.color,
                  fontWeight: "900",
                }}
              >
                {statusMeta.label}
              </Text>
            </View>

            {/* ITEMS */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                Items
              </Text>

              {(order.items || []).map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text
                    style={[
                      styles.itemName,
                      { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {item.quantity} × {item.product_name}
                  </Text>

                  <Text
                    style={[
                      styles.itemPrice,
                      { color: colors.text },
                    ]}
                  >
                    ₹{item.total_price}
                  </Text>
                </View>
              ))}
            </View>

            {/* BILL */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                Bill Summary
              </Text>

              <MemoRow
                label="Taxable Value"
                value={order.subtotal}
                colors={colors}
              />
              <MemoRow
                label="GST"
                value={order.tax}
                colors={colors}
              />
              <MemoRow
                label="Total Payable"
                value={order.total}
                bold
                colors={colors}
              />
            </View>

            {order.status === "PAID" && (
              <Button
                title="Download Invoice"
                onPress={() =>
                  api.get(`orders/${orderId}/invoice/`, {
                    responseType: "blob",
                  })
                }
              />
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

/* ================================
   ROW
================================ */

const MemoRow = memo(function Row({
  label,
  value,
  bold,
  colors,
}: any) {
  return (
    <View style={styles.rowBetween}>
      <Text
        style={[
          styles.rowText,
          { color: colors.textSecondary },
          bold && { fontWeight: "900", color: colors.text },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.rowText,
          { color: colors.text },
          bold && { fontWeight: "900" },
        ]}
      >
        ₹{value}
      </Text>
    </View>
  );
});

/* ================================
   STYLES
================================ */

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderBottomWidth: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  innerContent: {
    padding: 20,
    paddingBottom: 140,
  },

  orderNo: {
    fontSize: 22,
    fontWeight: "900",
  },

  statusChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
  },

  card: {
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
    marginBottom: 18,
    borderWidth: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  itemName: {
    fontSize: 14,
    flex: 1,
    paddingRight: 10,
  },

  itemPrice: {
    fontSize: 14,
    fontWeight: "800",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },

  rowText: {
    fontSize: 14,
  },
});
