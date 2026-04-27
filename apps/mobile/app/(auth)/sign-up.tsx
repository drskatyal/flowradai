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
import { useAppStore } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAppStore((s) => s.setAuth);

  async function handleSignUp() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setAuth(
      {
        id: 'u1',
        firstName,
        lastName,
        email,
        specialityId: '',
        specialityName: '',
        availableCredits: 50,
        totalCredits: 50,
        status: 'onboarding',
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
    router.replace('/(onboarding)/welcome');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <LinearGradient colors={['#060A14', '#0A1020', '#060A14']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Ionicons name="radio-outline" size={30} color={colors.primaryLight} />
          </View>
          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.subheading}>Start reporting smarter today</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <Input
                label="First name"
                placeholder="Sarah"
                value={firstName}
                onChangeText={setFirstName}
                containerStyle={{ flex: 1 }}
              />
              <Input
                label="Last name"
                placeholder="Mitchell"
                value={lastName}
                onChangeText={setLastName}
                containerStyle={{ flex: 1 }}
              />
            </View>
            <Input
              label="Email"
              icon="mail-outline"
              placeholder="sarah@hospital.nhs.uk"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Password"
              icon="lock-closed-outline"
              placeholder="Min. 8 characters"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <View style={styles.terms}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
              <Text style={styles.termsText}>
                By continuing you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <Button
              label="Create Account"
              onPress={handleSignUp}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing[6] },
  back: { marginBottom: spacing[6], alignSelf: 'flex-start' },
  header: { alignItems: 'center', marginBottom: spacing[6] },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  heading: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 4,
  },
  subheading: { fontSize: typography.sm, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[6],
    marginBottom: spacing[5],
  },
  form: { gap: spacing[4] },
  nameRow: { flexDirection: 'row', gap: spacing[3] },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    backgroundColor: colors.surfaceAlt,
    padding: spacing[3],
    borderRadius: radius.md,
  },
  termsText: { fontSize: typography.xs, color: colors.textMuted, flex: 1, lineHeight: 18 },
  termsLink: { color: colors.primaryLight },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: typography.sm, color: colors.textMuted },
  footerLink: { fontSize: typography.sm, color: colors.primaryLight, fontWeight: typography.semibold },
});
