import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
};

export function Input({ label, error, icon, containerStyle, isPassword, ...rest }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, focused && styles.focused, error && styles.errored]}>
        {icon && (
          <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.icon} />
        )}
        <TextInput
          {...rest}
          secureTextEntry={isPassword && !showPw}
          placeholderTextColor={colors.textDisabled}
          style={[styles.input, rest.style]}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={styles.eyeBtn}>
            <Ionicons
              name={showPw ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    height: 52,
  },
  focused: { borderColor: colors.primary },
  errored: { borderColor: colors.error },
  icon: { marginRight: spacing[2] },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.base,
  },
  eyeBtn: { padding: spacing[1] },
  error: {
    fontSize: typography.xs,
    color: colors.errorLight,
    marginLeft: 2,
  },
});
