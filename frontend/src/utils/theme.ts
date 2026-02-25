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
import { Roboto, Space_Mono } from "next/font/google";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  fallback: ["system-ui, sans-serif"],
});

const spaceMonoFont = Space_Mono({
  weight: "400",
  subsets: ["latin"],
  fallback: ["system-ui, sans-serif"],
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
  black: "#000",
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
    fontFamily: roboto.style.fontFamily,
    fontWeight: "700",
  },
  fontFamily: roboto.style.fontFamily,
  fontFamilyMonospace: spaceMonoFont.style.fontFamily,
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),

    // Headings sizes
    h1: rem(36),
    h2: rem(32),
    h3: rem(24),
    h4: rem(20),
    h5: rem(18),
    h6: rem(16),
  },

  // Colors
  primaryColor: "cyan",
  primaryShade: {
    light: 7,
    dark: 9,
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
  components: {},
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
