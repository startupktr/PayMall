import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Vibration,
  Image,
  Animated,
  Easing,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useMall } from "@/contexts/MallContext";
import { useCart } from "@/contexts/CartContext";
import api from "@/lib/axios";

export default function ScannerScreen() {
  const navigation = useNavigation<any>();
  const { selectedMall } = useMall();
  const { addToCart } = useCart();

  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  const cameraRef = useRef<Camera>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [manualOpen, setManualOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [previewProduct, setPreviewProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState(0.05);

  const laserAnim = useRef(new Animated.Value(0)).current;
  const successFlash = useRef(new Animated.Value(0)).current;

  /* ================= LASER ================= */

  const startLaser = () => {
    laserAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  /* ================= INIT ================= */

  useFocusEffect(
    useCallback(() => {
      initScanner();
      return () => setCameraActive(false);
    }, [selectedMall])
  );

  const initScanner = async () => {
    if (!selectedMall) {
      setInitializing(false);
      Alert.alert(
        "Select a Mall",
        "Please select a nearby mall before scanning",
        [{ text: "OK", onPress: () => navigation.navigate("HomeTab") }]
      );
      return;
    }

    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert("Camera permission required");
        setInitializing(false);
        return;
      }
    }

    setCameraActive(true);
    setInitializing(false);
    startLaser();
  };

  /* ================= SUCCESS FLASH ================= */

  const triggerSuccessFlash = () => {
    Animated.sequence([
      Animated.timing(successFlash, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(successFlash, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ================= SCANNER ================= */

  const codeScanner = useCodeScanner({
    codeTypes: ["ean-13", "ean-8", "upc-a", "upc-e", "code-128"],
    onCodeScanned: (codes) => {
      if (scanned || codes.length === 0) return;

      const value = codes[0].value;
      if (!value) return;

      setScanned(true);
      setZoom(0.2);
      setTorchOn(true);
      setCameraActive(false);

      triggerSuccessFlash();
      Vibration.vibrate(80);

      searchProduct(value);
    },
  });

  /* ================= SEARCH PRODUCT ================= */

  const searchProduct = async (code: string) => {
    try {
      const res = await api.post("products/scan/", {
        barcode: code,
        mall_id: selectedMall?.id,
      });

      setQty(1);
      setPreviewProduct(res.data.data || res.data);
    } catch {
      Alert.alert("Not Found", "Product not found in this mall", [
        { text: "Scan Again", onPress: restartScanner },
      ]);
    }
  };

  /* ================= RESET ================= */

  const restartScanner = () => {
    setPreviewProduct(null);
    setManualOpen(false);
    setBarcode("");
    setQty(1);
    setScanned(false);
    setTorchOn(false);
    setZoom(0.05);
    setCameraActive(true);
    startLaser();
  };

  /* ================= ADD TO CART ================= */

  const handleAddToCart = async () => {
    const product = previewProduct;
    setPreviewProduct(null);

    try {
      await addToCart(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        },
        qty
      );
      restartScanner();
    } catch {
      Alert.alert("Error", "Unable to add product to cart");
      restartScanner();
    }
  };

  /* ================= LOADING ================= */

  if (initializing || !device) {
    return (
      <ScreenWrapper scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 12 }}>Initializing scanner…</Text>
        </View>
      </ScreenWrapper>
    );
  }

  /* ================= RENDER ================= */

  return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Scan in {selectedMall?.name}
        </Text>

        {cameraActive && (
          <View style={styles.cameraContainer}>
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={cameraActive}
              codeScanner={codeScanner}
              torch={torchOn ? "on" : "off"}
              zoom={zoom}
              enableZoomGesture
            />

            {/* Success Flash */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.successOverlay,
                { opacity: successFlash },
              ]}
            />

            {/* Scan Frame */}
            <View style={styles.scanFrame}>
              <Animated.View
                style={[
                  styles.laser,
                  {
                    transform: [
                      {
                        translateY: laserAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 250],
                        }),
                      },
                    ],
                  },
                ]}
              />

              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            <TouchableOpacity
              style={styles.torchBtn}
              onPress={() => setTorchOn((p) => !p)}
            >
              <Ionicons
                name={torchOn ? "flash" : "flash-off"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Manual Entry */}
        <TouchableOpacity
          style={styles.manualBtn}
          onPress={() => {
            setCameraActive(false);
            setManualOpen(true);
          }}
        >
          <Text style={styles.manualText}>
            Enter barcode manually
          </Text>
        </TouchableOpacity>

        {/* Manual Modal */}
        <Modal visible={manualOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Enter Barcode</Text>

              <TextInput
                placeholder="Barcode number"
                keyboardType="numeric"
                value={barcode}
                onChangeText={setBarcode}
                style={styles.input}
              />

              <TouchableOpacity
                style={styles.btn}
                onPress={() => {
                  setManualOpen(false);
                  searchProduct(barcode);
                }}
              >
                <Text style={styles.btnText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={restartScanner}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Product Preview Modal */}
        <Modal visible={!!previewProduct} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.productCard}>
              {previewProduct?.image ? (
                <Image
                  source={{ uri: previewProduct.image }}
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>
                    {previewProduct?.name?.[0]}
                  </Text>
                </View>
              )}

              <Text style={styles.productName}>
                {previewProduct?.name}
              </Text>

              <Text style={styles.productPrice}>
                ₹{Number(previewProduct?.price * qty).toFixed(2)}
              </Text>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Ionicons name="remove" size={22} />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{qty}</Text>

                <TouchableOpacity
                  onPress={() => setQty((q) => q + 1)}
                >
                  <Ionicons name="add" size={22} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddToCart}
              >
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={restartScanner}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  title: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 12,
    paddingTop:50,
  },

  cameraContainer: {
    flex: 1,
    // borderRadius: 24,
    overflow: "hidden",
  },

  scanFrame: {
    position: "absolute",
    width: 260,
    height: 260,
    alignSelf: "center",
    top: "25%",
  },

  laser: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "#22D3EE",
  },

  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#2563EB",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },

  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34,197,94,0.4)",
  },

  manualBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },

  manualText: { color: "#fff", fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 20,
    borderRadius: 16,
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },

  btn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
  },

  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },

  cancel: { marginTop: 14, textAlign: "center", color: "#EF4444" },

  productCard: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
  },

  productImage: {
    width: 140,
    height: 140,
    borderRadius: 18,
    marginBottom: 16,
  },

  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  imagePlaceholderText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#2563EB",
  },

  productName: { fontSize: 18, fontWeight: "700", marginBottom: 8 },

  productPrice: {
    fontSize: 16,
    color: "#16A34A",
    fontWeight: "700",
    marginBottom: 16,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },

  qtyText: { fontSize: 18, fontWeight: "700" },

  addBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },

  addBtnText: { color: "#fff", fontWeight: "700" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  torchBtn: {
    position: "absolute",
    top: 20,
    right: 20,
  },
});
