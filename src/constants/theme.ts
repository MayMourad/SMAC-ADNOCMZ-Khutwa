/**
 * Khutwa design system — "Oasis at dusk"
 * ======================================
 *
 * Warm, rooted, distinctly of the UAE landscape. Sand and bone backgrounds,
 * Ghaf-green as the primary, a warm gold for the "bloom" / together moments.
 *
 * Everything visual pulls from here: colours, type scale, spacing, radii,
 * shadows. Screens and components must not hard-code hex values or font sizes.
 *
 * Type scale follows Apple's typography guidance — tracking is size-specific
 * (tighten large text, leave body near 0) and leading is looser on body,
 * tighter on headings.
 */

import '@/global.css';

import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------

export const Colors = {
  light: {
    // grounds
    background: '#F7F3EC', // warm bone
    backgroundAlt: '#EFE8DA', // deeper sand, for insets / pressed
    surface: '#FFFFFF',
    surfaceElevated: '#FDFBF6',

    // ink
    text: '#241C12', // deep bark
    textSecondary: '#6B5E4C',
    textMuted: '#9C8E79',

    // brand
    primary: '#3E6B4F', // ghaf green
    primaryDeep: '#2C4E3A',
    onPrimary: '#F7F3EC',
    accent: '#DC9E43', // bloom gold
    accentSoft: '#F3DCB0',
    onAccent: '#241C12',
    sky: '#7C9DAD', // muted sky — heritage / third dimension

    // lines + status
    border: '#E5DCCB',
    success: '#3E6B4F',
    danger: '#B4462F',
    overlay: 'rgba(24,18,10,0.38)',

    // back-compat aliases (used by the Expo starter template components)
    backgroundElement: '#FDFBF6',
    backgroundSelected: '#EFE8DA',
  },
  dark: {
    background: '#141210',
    backgroundAlt: '#1D1915',
    surface: '#221E19',
    surfaceElevated: '#2B251E',

    text: '#EFE7DA',
    textSecondary: '#B7AA92',
    textMuted: '#847760',

    primary: '#6FAE85',
    primaryDeep: '#4E8A66',
    onPrimary: '#12100E',
    accent: '#EBB65F',
    accentSoft: '#3E3320',
    onAccent: '#12100E',
    sky: '#8FB3C4',

    border: '#332C24',
    success: '#6FAE85',
    danger: '#E0765C',
    overlay: 'rgba(0,0,0,0.55)',

    backgroundElement: '#2B251E',
    backgroundSelected: '#332C24',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Colour for each Khutwa Score dimension. */
export const DimensionColors = {
  root: 'primary', // health / movement
  bloom: 'accent', // bonding / together
  heritage: 'sky', // culture / place
} as const;

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** Font family keys — the strings match what `useFonts()` registers in _layout. */
export const Fonts = {
  sans: 'Rubik_400Regular',
  sansMedium: 'Rubik_500Medium',
  sansSemiBold: 'Rubik_600SemiBold',
  sansBold: 'Rubik_700Bold',
  /** Latin only — Arabic falls back to sans (see ThemedText). */
  serif: 'Fraunces_400Regular',
  serifMedium: 'Fraunces_500Medium',
  serifSemiBold: 'Fraunces_600SemiBold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }) as string,
} as const;

export const FONT_ASSETS = {
  Rubik_400Regular: require('@expo-google-fonts/rubik/400Regular/Rubik_400Regular.ttf'),
  Rubik_500Medium: require('@expo-google-fonts/rubik/500Medium/Rubik_500Medium.ttf'),
  Rubik_600SemiBold: require('@expo-google-fonts/rubik/600SemiBold/Rubik_600SemiBold.ttf'),
  Rubik_700Bold: require('@expo-google-fonts/rubik/700Bold/Rubik_700Bold.ttf'),
  Fraunces_400Regular: require('@expo-google-fonts/fraunces/400Regular/Fraunces_400Regular.ttf'),
  Fraunces_500Medium: require('@expo-google-fonts/fraunces/500Medium/Fraunces_500Medium.ttf'),
  Fraunces_600SemiBold: require('@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf'),
};

export type TypeVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'bodySerif'
  | 'callout'
  | 'small'
  | 'label'
  | 'mono';

export const Type: Record<
  TypeVariant,
  { fontFamily: string; fontSize: number; lineHeight: number; letterSpacing: number }
> = {
  display: { fontFamily: Fonts.serifSemiBold, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  title: { fontFamily: Fonts.serifSemiBold, fontSize: 27, lineHeight: 33, letterSpacing: -0.4 },
  heading: { fontFamily: Fonts.sansBold, fontSize: 19, lineHeight: 25, letterSpacing: -0.1 },
  subtitle: { fontFamily: Fonts.sansMedium, fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  body: { fontFamily: Fonts.sans, fontSize: 15, lineHeight: 23, letterSpacing: 0 },
  bodySerif: { fontFamily: Fonts.serif, fontSize: 17, lineHeight: 28, letterSpacing: 0 },
  callout: { fontFamily: Fonts.sansMedium, fontSize: 14, lineHeight: 19, letterSpacing: 0 },
  small: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  label: { fontFamily: Fonts.sansSemiBold, fontSize: 11, lineHeight: 14, letterSpacing: 0.7 },
  mono: { fontFamily: Fonts.mono, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
};

// ---------------------------------------------------------------------------
// Space, radius, shadow
// ---------------------------------------------------------------------------

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#3B2A15',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#3B2A15',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  lg: {
    shadowColor: '#3B2A15',
    shadowOpacity: 0.14,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 14,
  },
  /** Warm glow used behind the tree when the family is together. */
  bloom: {
    shadowColor: '#DC9E43',
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
} as const;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/** Height reserved for the custom tab bar so scroll content clears it. */
export const TabBarHeight = 64;
export const BottomTabInset = Platform.select({ ios: 88, android: 84, default: 76 }) ?? 76;
export const MaxContentWidth = 520;
