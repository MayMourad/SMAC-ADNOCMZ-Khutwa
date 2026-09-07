/**
 * ThemedText
 * ==========
 *
 * The only Text component screens use. Applies:
 *  - a type-scale variant (`type`) from constants/theme.Type
 *  - a themed colour (`color`), default = primary ink
 *  - RTL: for Arabic it sets writingDirection + right alignment, and swaps any
 *    serif variant to the sans family (Fraunces has no Arabic glyphs)
 *
 * A few legacy `type` names + the `themeColor` prop are still accepted so the
 * Expo starter's leftover helper components keep compiling; new code should use
 * the variants in `TypeVariant` and the `color` prop.
 */

import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, Type, type ThemeColor, type TypeVariant } from '@/constants/theme';
import { useLang } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';

type LegacyType = 'default' | 'smallBold' | 'link' | 'linkPrimary' | 'code';
const LEGACY_TYPE: Record<LegacyType, TypeVariant> = {
  default: 'body',
  smallBold: 'callout',
  link: 'callout',
  linkPrimary: 'callout',
  code: 'mono',
};

export type ThemedTextProps = TextProps & {
  type?: TypeVariant | LegacyType;
  color?: ThemeColor;
  /** @deprecated use `color` */
  themeColor?: ThemeColor;
  /** Force left alignment even in Arabic (e.g. codes, numbers). */
  ltr?: boolean;
  /** UPPERCASE + wider tracking — pairs with the `label` type. */
  uppercase?: boolean;
};

const SERIF_TO_SANS: Record<string, string> = {
  [Fonts.serif]: Fonts.sans,
  [Fonts.serifMedium]: Fonts.sansMedium,
  [Fonts.serifSemiBold]: Fonts.sansSemiBold,
};

export function ThemedText({
  style,
  type = 'body',
  color,
  themeColor,
  ltr = false,
  uppercase = false,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const { isRTL } = useLang();

  const resolvedType: TypeVariant =
    type in LEGACY_TYPE ? LEGACY_TYPE[type as LegacyType] : (type as TypeVariant);
  const variant = Type[resolvedType];

  let fontFamily = variant.fontFamily;
  if (isRTL && SERIF_TO_SANS[fontFamily]) fontFamily = SERIF_TO_SANS[fontFamily];

  const rtlText = isRTL && !ltr;

  return (
    <Text
      style={[
        {
          color: theme[color ?? themeColor ?? 'text'],
          fontFamily,
          fontSize: variant.fontSize,
          lineHeight: variant.lineHeight,
          letterSpacing: uppercase ? variant.letterSpacing + 0.5 : variant.letterSpacing,
        },
        rtlText && styles.rtl,
        uppercase && styles.uppercase,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
  uppercase: { textTransform: 'uppercase' },
});
