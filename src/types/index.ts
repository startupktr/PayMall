import { NavigatorScreenParams } from "@react-navigation/native";

export interface Mall {
  id: string;
  name: string;
  address: string;
  distance: number;
  latitude: number;
  longitude: number;
  rating?: number;
  imageUrl?: string;
  openingHours?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  ProductDetails: undefined;
  Profile: undefined;

  Auth:
    | {
        redirectTo?: keyof RootStackParamList | keyof MainTabParamList;
        redirectParams?: object;
      }
    | undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CartTab: { reviewAfterMerge?: boolean } | undefined;
  OrderTab: undefined;
  AccountTab: undefined;
  Scan: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  MallDetails: {
    mallId: number;
  };
  MallProductDetails: { productId: number; mallId?: number };
  Profile: undefined;
};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  Payment: undefined;
  PaymentProcessing: undefined;
  PaymentResult: { status: boolean; orderId?: string };
};

export type OrderStackParamList = {
  Orders: undefined;
  OrderDetails: { orderId: number };
  Invoice: { orderId: number };
};
