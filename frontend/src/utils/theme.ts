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

// Body — variable font, all weights available (400/500/600/700)
const geist = Geist({
  subsets: ["latin", "latin-ext"],
  fallback: ["system-ui", "sans-serif"],
});

// Headings — slightly rounder geometric sans with more character
const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  fallback: ["ui-monospace", "monospace"],
});

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
  focusRing: "auto",
  cursorType: "pointer",
  autoContrast: true,
  luminanceThreshold: 0.35,
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
  // Shade 7 (#00aeef) is the brand cyan, but too light for white text on buttons.
  primaryShade: {
    light: 8,
    dark: 8,
  },
  colors: {
    primaryCyan: colorsTuple("#00aeef"),
    primaryDarkBlue: colorsTuple("#2e3192"),
    primaryMagenta: colorsTuple("#ec008c"),
    primaryGreen: colorsTuple("#7ac143"),
    primaryOrange: colorsTuple("#f47b20"),
    cyan: [
      "#e1fbff",
      "#ccf3ff",
      "#9ce4ff",
      "#68d5fe",
      "#41c8fd",
      "#2cc0fd",
      "#1abcfe",
      "#00aeef", // Primary 7
      "#0093cc",
      "#007fb4",
    ],
    darkBlue: [
      "#efefff",
      "#dbdcf4",
      "#b4b5e5",
      "#8a8cd6",
      "#6869ca",
      "#5254c3",
      "#4648c1",
      "#2e3192", // Primary 7
      "#262c88",
      "#1e2373",
    ],
    magenta: [
      "#ffe8fa",
      "#ffcfed",
      "#ff9cd7",
      "#fe65c0",
      "#fd39ad",
      "#fd1fa1",
      "#fe109b",
      "#ec008c", // Primary 7
      "#cb0078",
      "#b20068",
    ],
    green: [
      "#f1fce8",
      "#e4f4d8",
      "#cae7b3",
      "#add98b",
      "#94cd69",
      "#85c653",
      "#7fbc46",
      "#7ac143", // Primary 7
      "#5c982e",
      "#4c8321",
    ],
    orange: [
      "#fff2e1",
      "#ffe3cd",
      "#fcc69e",
      "#f8a86b",
      "#f68d41",
      "#f58237",
      "#d97f28",
      "#f47b20", // Primary 7
      "#dc6414",
      "#c8550a",
    ],
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
