import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CartScreen from "@/screens/Cart/CartScreen";
import CheckoutScreen from "@/screens/Cart/CheckoutScreen";
import PaymentScreen from "@/screens/Cart/PaymentScreen";
import PaymentResultScreen from "@/screens/Cart/PaymentResultScreen";
import PaymentProcessingScreen from "@/screens/Cart/PaymentProcessingScreen";
import { CartStackParamList } from "@/types/index";

const Stack = createNativeStackNavigator<CartStackParamList>();

export default function CartStack() {
    return (
        <Stack.Navigator
            id="CartStack"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} />
            <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
        </Stack.Navigator>
    );
}
