import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/Account/ProfileScreen";
import AppSettingsScreen from "@/screens/Account/AppSettingsScreen";
import OffersCouponsScreen from "@/screens/Account/OffersCouponsScreen";
import PaymentMethodsScreen from "@/screens/Account/PaymentMethodsScreen";
import PrivacySettingsScreen from "@/screens/Account/PrivacySettingsScreen";
import ReferralsScreen from "@/screens/Account/ReferralsScreen";
import SupportHelpScreen from "@/screens/Account/SupportHelpScreen";
import AccountHomeScreen from "@/screens/Account/AccountHomeScreen";
import RequireAuth from "@/components/RequireAuth";

const Stack = createNativeStackNavigator();

export default function CartStack() {
    return (
        <RequireAuth>
            <Stack.Navigator
                id="AccountStack"
                screenOptions={{ headerShown: false }}>
                <Stack.Screen name="AccountHome" component={AccountHomeScreen} />
                <Stack.Screen name="Support" component={SupportHelpScreen} />
                <Stack.Screen name="Referral" component={ReferralsScreen} />
                <Stack.Screen name="Privacy" component={PrivacySettingsScreen} />
                <Stack.Screen name="PaymentMethod" component={PaymentMethodsScreen} />
                <Stack.Screen name="Coupons" component={OffersCouponsScreen} />
                <Stack.Screen name="Setting" component={AppSettingsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </RequireAuth>
    );
}
