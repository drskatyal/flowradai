export const colors = {
  // Backgrounds
  bg: '#060A14',
  bgSecondary: '#0A1220',
  surface: '#0E1826',
  surfaceAlt: '#132033',
  surfaceHover: '#1A2E48',

  // Borders — rgba for depth
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.04)',
  borderStrong: 'rgba(255,255,255,0.14)',

  // Brand blue
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryLight: '#60A5FA',
  primarySoft: 'rgba(37, 99, 235, 0.12)',
  primaryGlow: 'rgba(59, 130, 246, 0.30)',

  // Semantic
  success: '#059669',
  successLight: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.10)',
  warning: '#D97706',
  warningLight: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.10)',
  error: '#DC2626',
  errorLight: '#F87171',
  errorSoft: 'rgba(248, 113, 113, 0.10)',

  // Recording
  mic: '#EF4444',
  micDark: '#7F1D1D',
  micGlow: 'rgba(239, 68, 68, 0.40)',

  // Text hierarchy
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#4E6587',
  textDisabled: '#2D3F55',

  // Overlays
  overlay: 'rgba(4, 8, 18, 0.88)',
  overlayLight: 'rgba(4, 8, 18, 0.5)',

  white: '#FFFFFF',
};

export const typography = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,

  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,

  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const spacing = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16,
  5: 20, 6: 24, 7: 28, 8: 32,
  10: 40, 12: 48, 16: 64, 20: 80,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 10,
  }),
};
