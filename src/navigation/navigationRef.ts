import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "@/types/index";

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

/* ===============================
   CURRENT ROUTE HELPERS
================================ */

export function getCurrentRouteName():
  | keyof RootStackParamList
  | undefined {
  if (!navigationRef.isReady()) return undefined;

  return navigationRef.getCurrentRoute()
    ?.name as keyof RootStackParamList | undefined;
}

export function getCurrentRouteParams():
  | RootStackParamList[keyof RootStackParamList]
  | undefined {
  if (!navigationRef.isReady()) return undefined;

  return navigationRef.getCurrentRoute()?.params as
    | RootStackParamList[keyof RootStackParamList]
    | undefined;
}

/* ===============================
   SAFE NAVIGATE (TYPED)
================================ */

export function safeNavigate<RouteName extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[RouteName]
    ? [screen: RouteName] | [screen: RouteName, params: RootStackParamList[RouteName]]
    : [screen: RouteName, params: RootStackParamList[RouteName]]
) {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate(...(args as any));
}

/* ===============================
   WAIT FOR NAV READY
================================ */

export async function waitForNavigationReady(timeoutMs = 2000) {
  const start = Date.now();

  while (!navigationRef.isReady()) {
    if (Date.now() - start > timeoutMs) break;
    await new Promise<void>((resolve) => setTimeout(resolve, 50));
  }
}
