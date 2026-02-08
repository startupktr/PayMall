import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  centered?: boolean; // ✅ optional vertical center
};

export default function ScreenWrapper({
  children,
  scroll = true,
  centered = false,
}: Props) {
  const { theme } = useTheme();

  const Content = scroll ? KeyboardAwareScrollView : View;

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: theme.colors.background },
      ]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Content
            style={styles.flex}
            contentContainerStyle={[
              scroll && styles.scrollContent,
              centered && styles.centeredContent,
            ]}
            enableOnAndroid
            extraScrollHeight={120}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </Content>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
