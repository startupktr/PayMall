import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrdersScreen from "@/screens/Orders/OrdersScreen";
import RequireAuth from "@/components/RequireAuth";
import OrderDetailsScreen from "@/screens/Orders/OrderDetailsScreen";
import { OrderStackParamList } from "@/types/index";
import InvoiceScreen from "@/screens/Orders/InvoiceScreen";
const Stack = createNativeStackNavigator<OrderStackParamList>();

export default function CartStack() {
    return (
        <RequireAuth>
            <Stack.Navigator
                id="OrderStack"
                screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Orders" component={OrdersScreen} />
                <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
                <Stack.Screen name="Invoice" component={InvoiceScreen} />
            </Stack.Navigator>
        </RequireAuth>
    );
}
