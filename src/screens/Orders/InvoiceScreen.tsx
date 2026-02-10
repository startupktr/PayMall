import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import ScreenWrapper from "@/components/ScreenWrapper";
import { Button } from "@/components/Button";
import { useTheme } from "@/contexts/ThemeContext";
import api from "@/lib/axios";
import * as Keychain from "react-native-keychain";

export default function InvoiceScreen({ route }: any) {
    const { orderId } = route.params;
    const { theme } = useTheme();
    const [order, setOrder] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        api.get(`orders/${orderId}/`).then(res => setOrder(res.data.data));
    }, [orderId]);

    const handleDownload = async () => {
        setDownloading(true);

        try {
            // 1. Get the token exactly like your Axios interceptor does
            const accessCreds = await Keychain.getGenericPassword();

            if (!accessCreds) {
                Alert.alert("Error", "Session expired. Please log in again.");
                return;
            }

            const { fs } = ReactNativeBlobUtil;
            const path = `${fs.dirs.DownloadDir}/Invoice_${order.order_number}.pdf`;

            // 2. Execute the download
            await ReactNativeBlobUtil.config({
                fileCache: true,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    path: path,
                    mime: 'application/pdf',
                    description: 'Downloading PayMall Invoice',
                },
            }).fetch('GET', `https://api.paymall.live/api/orders/${orderId}/invoice/`, {
                // 3. Manually pass the Bearer token retrieved from Keychain
                Authorization: `Bearer ${accessCreds.password}`,
            });

            Alert.alert("Success", "Invoice saved to Downloads folder");
        } catch (e) {
            console.error("Download Error:", e);
            Alert.alert("Error", "Download failed. Please check your internet connection.");
        } finally {
            setDownloading(false);
        }
    };


    if (!order) return null;

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.invoicePaper}>
                {/* Receipt Header */}
                <View style={styles.billHeader}>
                    <Text style={styles.brand}>PayMall</Text>
                    <Text style={styles.title}>TAX INVOICE</Text>
                </View>

                <View style={styles.metaSection}>
                    <Text>Order: {order.order_number}</Text>
                    <Text>Date: {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}</Text>
                </View>

                {/* Simple Item List */}
                <View style={styles.divider} />
                {order.items.map((item: any) => (
                    <View key={item.id} style={styles.itemRow}>
                        <Text style={{ flex: 1 }}>{item.quantity} x {item.product_name}</Text>
                        <Text>₹{item.total_price}</Text>
                    </View>
                ))}
                <View style={styles.divider} />

                {/* Totals */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₹{order.total}</Text>
                </View>

                <Button
                    title={downloading ? "Downloading..." : "Download PDF Version"}
                    onPress={handleDownload}
                    disabled={downloading}
                    style={{ marginTop: 40 }}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    invoicePaper: { padding: 20, backgroundColor: '#fff', margin: 16, borderRadius: 8, elevation: 3 },
    billHeader: { alignItems: 'center', marginBottom: 20 },
    brand: { fontSize: 24, fontWeight: 'bold', color: '#2563EB' },
    title: { fontSize: 14, color: '#64748B', letterSpacing: 2 },
    metaSection: { marginBottom: 20 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 15, borderStyle: 'dashed', borderRadius: 1 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#2563EB' }
});
