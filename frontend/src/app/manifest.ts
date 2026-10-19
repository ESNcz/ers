import routes from "@/utils/routes";
import { browserThemeColor } from "@/utils/theme";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/manifest",
    name: "Event Registration System",
    short_name: "ERS",
    lang: "en",
    dir: "ltr",
    categories: ["events", "productivity"],
    description:
      "ERS (Event Registration System) allows people to register for events, where admins can manage their applications and assign spots.",
    theme_color: browserThemeColor.light,
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    start_url: "/",
    // Reuse an open app window for opened links instead of spawning a new one
    launch_handler: { client_mode: "navigate-existing" },
    icons: [
      {
        src: "/icons/mrkvanek_512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
      {
        src: "/icons/mrkvanek_192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "any",
      },
      {
        src: "/icons/mrkvanek_96x96.png",
        type: "image/png",
        sizes: "96x96",
        purpose: "any",
      },
      {
        src: "/icons/mrkvanek.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      // Artwork padded into the centre safe zone so Android adaptive icon masks do not crop it
      {
        src: "/icons/mrkvanek_maskable_512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
      {
        src: "/icons/mrkvanek_maskable_192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Sent applications",
        url: routes.SENT_APPLICATIONS,
        icons: [{ src: "/icons/mrkvanek_96x96.png", type: "image/png", sizes: "96x96" }],
      },
      {
        name: "My organisation",
        url: routes.MY_ORGANISATION,
        icons: [{ src: "/icons/mrkvanek_96x96.png", type: "image/png", sizes: "96x96" }],
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
