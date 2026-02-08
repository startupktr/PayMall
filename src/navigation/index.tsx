// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useTheme } from '@/contexts/ThemeContext';
// import { RootStackParamList } from '@/types/index';
// import { SplashScreen } from '@/screens/SplashScreen';
// import { OnboardingScreen } from '@/screens/OnboardingScreen';
// import { LoginScreen } from '@/screens/LoginScreen';
// import { SignupScreen } from '@/screens/SignupScreen';
// import { MainNavigator } from './MainNavigator';

// const Stack = createNativeStackNavigator<RootStackParamList>();

// export const RootNavigator: React.FC = () => {
//   const { theme } = useTheme();

//   return (
//     <NavigationContainer
//     //   theme={{
//     //     dark: theme.isDark,
//     //     colors: {
//     //       primary: theme.colors.primary,
//     //       background: theme.colors.background,
//     //       card: theme.colors.card,
//     //       text: theme.colors.text,
//     //       border: theme.colors.border,
//     //       notification: theme.colors.error,
//     //     },
//     //   }}
//     >
//       <Stack.Navigator
//         initialRouteName="Splash"
//         screenOptions={{
//           headerShown: false,
//           animation: 'slide_from_right',
//         }}
//       >
//         <Stack.Screen name="Splash" component={SplashScreen} />
//         <Stack.Screen name="Onboarding" component={OnboardingScreen} />
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="Signup" component={SignupScreen} />
//         <Stack.Screen name="Main" component={MainNavigator} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };
