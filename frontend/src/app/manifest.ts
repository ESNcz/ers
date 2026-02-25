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
        src: "/icons/favicon-72x72.png",
        type: "image/png",
        sizes: "72x72",
      },
      {
        src: "/icons/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        src: "/icons/favicon-128x128.png",
        type: "image/png",
        sizes: "128x128",
      },
      {
        src: "/icons/favicon-144x144.png",
        type: "image/png",
        sizes: "144x144",
      },
      {
        src: "/icons/favicon-152x152.png",
        type: "image/png",
        sizes: "152x152",
      },
      {
        src: "/icons/favicon-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        src: "/icons/favicon-384x384.png",
        type: "image/png",
        sizes: "384x384",
      },
      {
        src: "/icons/favicon-512x512.png",
        type: "image/png",
        sizes: "512x512",
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
