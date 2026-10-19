"use client";

import { browserThemeColor } from "@/utils/theme";
import { useComputedColorScheme } from "@mantine/core";
import { useEffect } from "react";

/** Keeps `<meta name="theme-color">` in sync with the in-app colour scheme, not only the OS one */
const ThemeColorSync = () => {
  const colorScheme = useComputedColorScheme("light");

  useEffect(() => {
    const color = browserThemeColor[colorScheme];
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", color));
  }, [colorScheme]);

  return null;
};

export default ThemeColorSync;
