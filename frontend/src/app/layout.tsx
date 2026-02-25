import { theme } from "@/utils/theme";
import Providers from "@components/layout/Providers";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import { Metadata, Viewport } from "next";
import React, { ReactNode, Suspense } from "react";

export const metadata: Metadata = {
  applicationName: "Event Registration System",
  title: "Event Registration System",
  description:
    "ERS (Event Registration System) allows people to register for events, where admins can manage their applications and assign spots.",
  keywords: ["ERS", "events", "registration"],
  manifest: "manifest.webmanifest",
  icons: [
    {
      url: "/icons/favicon.svg",
      rel: "icon",
    },
    {
      url: "/icons/favicon.svg",
      rel: "apple-touch-icon",
    },
  ],
  authors: [
    {
      name: "Šimon Slabý",
      url: "https://www.linkedin.com/in/slabys/",
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "contain",
  interactiveWidget: "resizes-content",
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="shortcut icon" href="/icons/favicon.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />

        <ColorSchemeScript />
      </head>
      <body style={{ width: "100%", height: "100vh" }}>
        <MantineProvider theme={theme}>
          <Suspense fallback="Loading...">
            <Providers>{children}</Providers>
          </Suspense>
        </MantineProvider>
      </body>
    </html>
  );
};

export default RootLayout;
