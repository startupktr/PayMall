import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationState } from '@react-navigation/native';
import { navigationRef } from '@/navigation/navigationRef';

import HomeStack from './HomeStack';
import CartStack from './CartStack';
import OrderStack from './OrderStack';
import AccountStack from './AccountStack';

import ScannerScreen from '@/screens/Scan/ScannerScreen';
import { MainTabParamList } from '@/types/index';
import { useCart } from '@/contexts/CartContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const insets = useSafeAreaInsets();
  const { count } = useCart();
  /* ================================
     GET ACTIVE NESTED ROUTE NAME
  ================================= */

  const routeName = useNavigationState((state) => {
    if (!state || typeof state.index !== 'number') return undefined;

    const tab = state.routes[state.index];

    if (!tab) return undefined;

    // If inside nested stack
    if (tab.state && typeof tab.state.index === 'number') {
      const stack = tab.state.routes[tab.state.index];
      return stack?.name;
    }

    return tab.name;
  });

  /* ================================
     ANDROID BACK CONFIRM EXIT
  ================================= */

  useEffect(() => {
  const onBackPress = () => {
    const canGoBack = navigationRef.current?.canGoBack?.();

    // If cannot go back → we are at root → show exit dialog
    if (!canGoBack) {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true }
      );
      return true;
    }

    return false; // let navigation handle normally
  };

  const sub = BackHandler.addEventListener(
    'hardwareBackPress',
    onBackPress
  );

  return () => sub.remove();
}, []);

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,

        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',

        tabBarStyle: {
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
        },

        tabBarIcon: ({ color, focused, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = 'home';
              break;
            case 'OrderTab':
              iconName = 'receipt';
              break;
            case 'Scan':
              iconName = 'scan';
              break;
            case 'CartTab':
              iconName = 'cart';
              break;
            case 'AccountTab':
              iconName = 'person';
              break;
            default:
              iconName = 'ellipse';
          }

          return (
            <View style={styles.iconWrapper}>
              {focused && <View style={styles.activeLine} />}
              <Ionicons
                name={iconName}
                size={size ?? 22}
                color={color}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home' }}
      />

      <Tab.Screen
        name="OrderTab"
        component={OrderStack}
        options={{ title: 'Orders' }}
      />

      <Tab.Screen
        name="Scan"
        component={ScannerScreen}
        options={{ title: 'Scan' }}
      />

      <Tab.Screen
        name="CartTab"
        component={CartStack}
        options={{
          title: 'Cart',
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '700',
          },
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={AccountStack}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
  },
  activeLine: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
});
