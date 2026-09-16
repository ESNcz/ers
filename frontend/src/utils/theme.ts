import {
  CSSVariablesResolver,
  DEFAULT_THEME,
  DefaultMantineColor,
  MantineColorsTuple,
  MantineSize,
  MantineThemeOverride,
  colorsTuple,
  createTheme,
  mergeMantineTheme,
  rem,
} from "@mantine/core";
import { Geist, Geist_Mono, Outfit } from "next/font/google";

// Body: variable font, all weights available (400/500/600/700)
const geist = Geist({
  subsets: ["latin", "latin-ext"],
  fallback: ["system-ui", "sans-serif"],
});

// Headings: slightly rounder geometric sans with more character
const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  fallback: ["ui-monospace", "monospace"],
});

// ESN brand colours, single source of truth for all palettes below
const brandColors = {
  cyan: "#00aeef",
  darkBlue: "#2e3192",
  magenta: "#ec008c",
  green: "#7ac143",
  orange: "#f47b20",
} as const;

const mixHex = (from: string, to: string, amount: number) => {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [a, b] = [parse(from), parse(to)];
  return `#${a
    .map((channel, i) =>
      Math.round(channel + (b[i] - channel) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

/**
 * Builds a 10-shade Mantine palette around a brand colour.
 * Shades 0-6 are tints (mixed with white), 7 is the exact brand colour, 8-9 are darker (mixed with black).
 * Shade 9 keeps at least 4.5:1 contrast with white for every brand colour, links use it (see globals.css).
 */
const brandShades = (base: string): MantineColorsTuple => [
  mixHex(base, "#ffffff", 0.92),
  mixHex(base, "#ffffff", 0.82),
  mixHex(base, "#ffffff", 0.64),
  mixHex(base, "#ffffff", 0.46),
  mixHex(base, "#ffffff", 0.3),
  mixHex(base, "#ffffff", 0.18),
  mixHex(base, "#ffffff", 0.08),
  base,
  mixHex(base, "#000000", 0.18),
  mixHex(base, "#000000", 0.34),
];

type ExtendedCustomColors = DefaultMantineColor;
export type ExtendedCustomFontSized = MantineSize;

declare module "@mantine/core" {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
    fontSizes: Record<ExtendedCustomFontSized, MantineColorsTuple>;
  }
}

// Default ==> https://mantine.dev/theming/default-theme/
const themeOverride = createTheme({
  // General
  white: "#fff",
  black: "#12141c",
  defaultRadius: "md",
  // Tighter than Mantine defaults (xs 2, sm 4, md 8, lg 16); xl kept for pills/avatars
  radius: {
    xs: "0.125rem", // 2px
    sm: "0.1875rem", // 3px
    md: "0.3125rem", // 5px
    lg: "0.5rem", // 8px
    xl: "2rem", // 32px
  },
  focusRing: "auto",
  cursorType: "pointer",
  autoContrast: true,
  breakpoints: {
    base: "0rem", // 0px
    xs: "36em", // 576px
    sm: "48em", // 768px
    md: "62em", // 992px
    lg: "75em", // 1200px
    xl: "88em", // 1408px
  },

  // Fonts
  headings: {
    fontFamily: outfit.style.fontFamily,
    fontWeight: "600",
    textWrap: "balance",
    sizes: {
      h1: { fontSize: rem(36), lineHeight: "1.1" },
      h2: { fontSize: rem(28), lineHeight: "1.15" },
      h3: { fontSize: rem(22), lineHeight: "1.25" },
      h4: { fontSize: rem(19), lineHeight: "1.3" },
      h5: { fontSize: rem(17), lineHeight: "1.4" },
      h6: { fontSize: rem(15), lineHeight: "1.4" },
    },
  },
  fontFamily: geist.style.fontFamily,
  fontFamilyMonospace: geistMono.style.fontFamily,
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
  },

  // Shadows tinted with brand dark blue instead of neutral black
  shadows: {
    xs: "0 1px 2px rgba(30, 35, 115, 0.06)",
    sm: "0 1px 3px rgba(30, 35, 115, 0.08), 0 1px 2px rgba(30, 35, 115, 0.04)",
    md: "0 4px 12px -2px rgba(30, 35, 115, 0.10), 0 2px 4px -2px rgba(30, 35, 115, 0.06)",
    lg: "0 12px 28px -6px rgba(30, 35, 115, 0.14), 0 4px 8px -4px rgba(30, 35, 115, 0.06)",
    xl: "0 24px 48px -12px rgba(30, 35, 115, 0.20)",
  },

  // Colors
  primaryColor: "cyan",
  // Brand colour sits at shade 7 of every palette. Text on filled components (white or black)
  // is picked automatically by `autoContrast` based on the luminance of that shade.
  primaryShade: {
    light: 7,
    dark: 7,
  },
  colors: {
    primaryCyan: colorsTuple(brandColors.cyan),
    primaryDarkBlue: colorsTuple(brandColors.darkBlue),
    primaryMagenta: colorsTuple(brandColors.magenta),
    primaryGreen: colorsTuple(brandColors.green),
    primaryOrange: colorsTuple(brandColors.orange),
    cyan: brandShades(brandColors.cyan),
    darkBlue: brandShades(brandColors.darkBlue),
    magenta: brandShades(brandColors.magenta),
    green: brandShades(brandColors.green),
    orange: brandShades(brandColors.orange),
  },
  other: {},

  // Components
  components: {
    Title: {
      styles: {
        root: { letterSpacing: "-0.015em" },
      },
    },
    Button: {
      defaultProps: { fw: 600 },
      styles: {
        root: {
          transition: "background-color 200ms ease, transform 120ms ease, box-shadow 200ms ease",
        },
      },
    },
    Card: {
      defaultProps: { radius: "lg" },
    },
    Paper: {
      defaultProps: { radius: "lg" },
    },
    Modal: {
      defaultProps: { radius: "lg", overlayProps: { backgroundOpacity: 0.45, blur: 3 } },
    },
    Menu: {
      defaultProps: { radius: "md", shadow: "lg" },
    },
    Notification: {
      defaultProps: { radius: "md" },
    },
    Skeleton: {
      defaultProps: { radius: "md" },
    },
  },
} as MantineThemeOverride);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CONTAINER_SIZES: Record<string, string> = {
  xs: rem(320),
  sm: rem(640),
  md: rem(960),
  lg: rem(1280),
  xl: rem(1440),
};

export const resolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {},
  dark: {},
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
