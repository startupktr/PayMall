import React from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  centered?: boolean;
};

export default function ScreenWrapper({
  children,
  scroll = true,
  centered = false,
}: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const Content = scroll ? KeyboardAwareScrollView : View;

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: theme.colors.background },
      ]}
      edges={["top"]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Content
          style={styles.flex}
          contentContainerStyle={[
            scroll && styles.scrollContent,
            centered && styles.centeredContent,
            {
              paddingBottom: insets.bottom + 20, // 👈 controlled padding
            },
          ]}
          enableOnAndroid
          extraScrollHeight={40} // 👈 reduce from 120
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </Content>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },

  scrollContent: {
    flexGrow: 1,
  },

  centeredContent: {
    justifyContent: "center",
  },
});
