import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAppStore, MOCK_REPORTS } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAppStore((s) => s.setAuth);

  async function handleSignIn() {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // Mock successful auth
    setAuth(
      {
        id: 'u1',
        firstName: 'Dr. Sarah',
        lastName: 'Mitchell',
        email,
        specialityId: '1',
        specialityName: 'Chest Radiology',
        availableCredits: 142,
        totalCredits: 200,
        status: 'active',
        settings: {
          autoTemplate: true,
          actionMode: false,
          defaultTranscriptionModel: 'voxtral',
          isErrorCheck: true,
          isReportGuideline: true,
          voiceCommandsEnabled: true,
        },
      },
      'mock-jwt-token',
    );
    router.replace('/(app)');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <LinearGradient colors={['#060A14', '#0A1020', '#060A14']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Ionicons name="radio-outline" size={34} color={colors.primaryLight} />
          </View>
          <Text style={styles.logoText}>FLOWRAD<Text style={styles.logoAI}>AI</Text></Text>
          <Text style={styles.tagline}>AI-Powered Radiology Reporting</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to your account</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.errorLight} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              label="Email"
              icon="mail-outline"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Password"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* SSO */}
          <View style={styles.ssoRow}>
            {(['logo-google', 'logo-apple', 'logo-microsoft'] as const).map((icon, i) => (
              <TouchableOpacity key={i} style={styles.ssoBtn} activeOpacity={0.7}>
                <Ionicons name={icon as any} size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={styles.footerLink}>Sign up free</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing[6] },
  logoArea: { alignItems: 'center', marginBottom: spacing[8] },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  logoText: {
    fontSize: typography['3xl'],
    fontWeight: typography.extrabold,
    color: colors.text,
    letterSpacing: 3,
  },
  logoAI: { color: colors.primaryLight },
  tagline: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing[1],
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[6],
    marginBottom: spacing[5],
  },
  heading: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 4,
  },
  subheading: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginBottom: spacing[5],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.errorSoft,
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  errorText: { fontSize: typography.sm, color: colors.errorLight, flex: 1 },
  form: { gap: spacing[4] },
  forgotRow: { alignSelf: 'flex-end', marginTop: -spacing[2] },
  forgotText: { fontSize: typography.sm, color: colors.primaryLight },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[5],
    gap: spacing[3],
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: typography.xs, color: colors.textMuted },
  ssoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[4],
  },
  ssoBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: typography.sm, color: colors.textMuted },
  footerLink: { fontSize: typography.sm, color: colors.primaryLight, fontWeight: typography.semibold },
});
