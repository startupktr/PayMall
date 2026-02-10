import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { SafeContainer } from '@/components/SafeContainer';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AuthHeader } from '@/components/AuthHeader';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    let valid = true;

    const newErrors = {
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
    };

    const cleanedMobile = mobile.replace(/\D/g, "");

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile is required';
      valid = false;
    } else if (cleanedMobile.length < 10) {
      newErrors.mobile = 'Enter a valid mobile number';
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  /* ================= SIGNUP ================= */

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const cleanedMobile = mobile.replace(/\D/g, '');
    
    try {
      await register(
        cleanedMobile,
        email.trim(),
        password,
        confirmPassword
      );

    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error?.message || 'Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.goBack();
  };

  /* ================= UI ================= */

  return (
    <SafeContainer>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
      >
        <View style={[styles.container, { padding: theme.spacing.lg }]}>

          {/* ✅ REUSABLE HEADER */}
          <AuthHeader
            title="Create Account"
            subtitle="Sign up to get started"
          />

          {/* ================= FORM ================= */}
          <View style={styles.form}>
            <Input
              // label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email)
                  setErrors({ ...errors, email: '' });
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              containerStyle={{
                marginBottom: theme.spacing.md,
              }}
            />

            <Input
              // label="Mobile"
              value={mobile}
              onChangeText={(text) => {
                setMobile(text);
                if (errors.mobile)
                  setErrors({ ...errors, mobile: '' });
              }}
              placeholder="Enter your mobile"
              autoCapitalize="none"
              keyboardType='numeric'
              error={errors.mobile}
              containerStyle={{
                marginBottom: theme.spacing.md,
              }}
            />

            <Input
              // label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password)
                  setErrors({ ...errors, password: '' });
              }}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.password}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontSize: theme.fontSize.sm,
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              }
              containerStyle={{
                marginBottom: theme.spacing.md,
              }}
            />

            <Input
              // label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword)
                  setErrors({
                    ...errors,
                    confirmPassword: '',
                  });
              }}
              placeholder="Confirm your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.confirmPassword}
              containerStyle={{
                marginBottom: theme.spacing.md,
              }}
            />

            <Button
              title="Sign Up"
              onPress={handleSignup}
              loading={loading}
              fullWidth
            />
          </View>

          {/* ================= LOGIN LINK ================= */}
          <View
            style={[
              styles.loginContainer,
              { marginTop: theme.spacing.lg },
            ]}
          >
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSize.sm,
              }}
            >
              Already have an account?{' '}
            </Text>

            <TouchableOpacity onPress={handleLogin}>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontSize: theme.fontSize.sm,
                  fontWeight: theme.fontWeight.semibold,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeContainer>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
  },

  form: {},

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
