import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { launchImageLibrary } from "react-native-image-picker";

import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import api from "@/lib/axios";
import { navigationRef } from "@/navigation/navigationRef";

const ProfileScreen = () => {
  const { user, refreshMe } = useAuth();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.data.full_name ?? "");
      setPhone(user.data.phone_number ?? "");
      setEmail(user.data.email ?? "");
      setAvatar(user.data.profile_image);
    }
  }, [user]);

  /* ------------------ Validation ------------------ */

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validatePhone = (value: string) =>
    /^[6-9]\d{9}$/.test(value);

  /* ------------------ Image Picker ------------------ */

  const handleImagePick = async () => {
    launchImageLibrary({ mediaType: "photo" }, (res) => {
      if (res.assets?.[0]?.uri) {
        setAvatar(res.assets[0].uri);
      }
    });
  };

  /* ------------------ Save ------------------ */

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter your full name");
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert("Validation Error", "Enter a valid 10-digit mobile number");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Validation Error", "Enter a valid email address");
      return;
    }

    try {
      setSaving(true);

      await api.patch("accounts/profile/update/", {
        full_name: name,
        phone_number: phone,
        email,
        gender,
        dob,
      });

      await refreshMe();

      Alert.alert("Success", "Profile updated successfully");
    } catch (e) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper scroll>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >

        {/* ---------- Avatar Section ---------- */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                avatar ||
                "https://i.pravatar.cc/150?img=12",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={[
              styles.cameraBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleImagePick}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ---------- Profile Card ---------- */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <ProfileInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            theme={theme}
          />

          <ProfileInput
            label="Mobile Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit mobile number"
            keyboardType="number-pad"
            rightText="Verify"
            theme={theme}
          />

          <ProfileInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            rightText="Verify"
            theme={theme}
          />

          {/* ---------- DOB ---------- */}
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary },
              ]}
            >
              Date of Birth
            </Text>
            <View
              style={[
                styles.input,
                { backgroundColor: theme.colors.inputBackground },
              ]}
            >
              <Text
                style={{
                  color: dob
                    ? theme.colors.text
                    : theme.colors.placeholder,
                }}
              >
                {dob ? dob.toDateString() : "Select date"}
              </Text>
            </View>
          </TouchableOpacity>

          <ProfileInput
            label="Gender (optional)"
            value={gender}
            onChangeText={setGender}
            placeholder="Male / Female / Other"
            theme={theme}
          />
        </View>

        {/* ---------- Save Button ---------- */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            maximumDate={new Date()}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setDob(date);
            }}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

/* ------------------ Reusable Input ------------------ */

const ProfileInput = ({
  label,
  rightText,
  theme,
  ...props
}: any) => (
  <View style={styles.inputWrapper}>
    <View style={styles.row}>
      <Text
        style={[
          styles.label,
          { color: theme.colors.text },
        ]}
      >
        {label}
      </Text>
      {rightText && (
        <Text
          style={[
            styles.verify,
            { color: theme.colors.primary },
          ]}
        >
          {rightText}
        </Text>
      )}
    </View>

    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.colors.inputBackground,
          color: theme.colors.text,
        },
      ]}
      placeholderTextColor={theme.colors.placeholder}
      {...props}
    />
  </View>
);

export default ProfileScreen;

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 4,
    right: 130 / 2 - 8,
    padding: 8,
    borderRadius: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  verify: {
    fontSize: 13,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 24,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
