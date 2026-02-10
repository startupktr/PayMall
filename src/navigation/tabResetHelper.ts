import { NavigationProp, ParamListBase } from "@react-navigation/native";

export const createTabResetListener =
  (routeName: string) =>
  ({
    navigation,
    route,
  }: {
    navigation: NavigationProp<ParamListBase>;
    route: any;
  }) => ({
    tabPress: () => {
      const state = navigation.getState();

      const tab = state.routes.find((r) => r.name === routeName);

      // If tab is already focused AND inside nested stack
      if (tab?.state && (tab.state as any).index > 0) {
        navigation.navigate(routeName, {
          screen: (tab.state as any).routes[0].name,
        });
      }
    },
  });
