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
        src: "/icons/mrkvanek.svg",
        type: "image/png",
        sizes: "256x256",
      },
      {
        src: "/icons/mrkvanek-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        src: "/icons/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
      {
        src: "/icons/favicon.ico",
        type: "image/png",
        sizes: "48x48",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile-1.png",
        sizes: "540x720",
        type: "image/png",
        form_factor: "narrow",
        platform: "android",
        label: "Mobile Application",
      },
      {
        src: "/screenshots/desktop-1.png",
        sizes: "1920x958",
        type: "image/png",
        form_factor: "wide",
        label: "Desktop Application",
      },
    ],
  };
}
