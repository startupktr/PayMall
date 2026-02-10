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

import ScreenWrapper from '@/components/ScreenWrapper';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthHeader } from '@/components/AuthHeader';
import { useAuth } from '@/contexts/AuthContext';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { login } = useAuth();

  // 🔒 SAME STATE AS YOUR CODE
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  // 🔒 SAME VALIDATION — UNCHANGED
  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

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
    }
    // else if (password.length < 6) {
    //   newErrors.password = 'Password must be at least 6 characters';
    //   valid = false;
    // }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
    } catch {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <View style={[styles.container, { padding: theme.spacing.lg }]}>
          <AuthHeader
            title="Welcome to PayMall"
            subtitle="Shop smarter around you"
          />

          {/* 🔒 FORM — UNCHANGED */}
          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            error={errors.password}
            containerStyle={{ marginBottom: theme.spacing.sm }}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ color: theme.colors.primary }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            }
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={
              [styles.forgotPasswordText,
              {
                color: theme.colors.primary,
                fontSize: theme.fontSize.sm,
                fontWeight: theme.fontWeight.medium,
              },]} >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={{ marginTop: theme.spacing.md }}
          />

          <View style={styles.signupRow}>
            <Text style={{ color: theme.colors.textSecondary }}>
              Don’t have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: theme.fontWeight.semibold,
                }}
              >
                {' '}Register
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.replace("Main")}>
            <Text style={styles.skip} >
              Skip for now →
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {},
  skip: {
    marginTop: 15,
    textAlign: "center",
    color: "#64748B",
  },
});
