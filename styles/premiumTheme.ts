import { Platform } from 'react-native';

export const premiumTheme = {
  colors: {
    background: '#F7F4EF',
    surface: '#FFFFFF',
    surfaceMuted: '#F2F4F7',
    ink: '#0B1B2B',
    inkMuted: '#51606F',
    border: '#E6E1DA',
    accent: '#FF6B5C',
    accentDark: '#E95445',
    accentSoft: '#FFE7E2',
    navy: '#102A43',
    sky: '#E6F0F9',
    mint: '#E6F7F3',
  },
  gradients: {
    hero: ['#0B1B2B', '#1C3556', '#2B4A72'] as [string, string, string],
    soft: ['#F8EDEB', '#E9F1F7'] as [string, string],
    cta: ['#FF6B5C', '#FF8A5C'] as [string, string],
  },
  typography: {
    display: Platform.select({ ios: 'Avenir Next', android: 'sans-serif-medium' }),
    body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif' }),
  },
  radii: {
    card: 20,
    button: 18,
    input: 16,
    pill: 999,
  },
  shadows: {
    card: {
      shadowColor: '#0B1B2B',
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
    },
    lift: {
      shadowColor: '#0B1B2B',
      shadowOpacity: 0.16,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
  },
};
