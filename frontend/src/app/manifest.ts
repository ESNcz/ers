import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/manifest",
    name: "Event Registration System",
    short_name: "ERS",
    description:
      "ERS (Event Registration System) allows people to register for events, where admins can manage their applications and assign spots.",
    theme_color: "#00aeef",
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "/icons/mrkvanek_512.png",
        type: "image/png",
        sizes: "512x512",
      },
      {
        src: "/icons/mrkvanek_192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        src: "/icons/mrkvanek_96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        src: "/icons/mrkvanek.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        src: "/icons/favicon.ico",
        type: "image/x-icon",
        sizes: "48x48",
      },
    ],
    screenshots: [
      ...[
        "Browse upcoming events",
        "Event details and registration",
        "Track your applications",
        "Send and receive sugar cubes",
      ].map((label, index) => ({
        src: `/screenshots/mobile-${index + 1}.webp`,
        sizes: "780x1688",
        type: "image/webp",
        form_factor: "narrow" as const,
        label,
      })),
      ...[
        "Browse upcoming events",
        "Event details and registration",
        "Manage applications and assign spots",
        "Manage organisations",
      ].map((label, index) => ({
        src: `/screenshots/desktop-${index + 1}.webp`,
        sizes: "1920x1200",
        type: "image/webp",
        form_factor: "wide" as const,
        label,
      })),
    ],
  };
}
