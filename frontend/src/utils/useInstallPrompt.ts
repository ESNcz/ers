"use client";

import { useSyncExternalStore } from "react";

/** Not part of the TS DOM lib yet, Chromium only */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Safari has no install API, the app is installed manually from the browser UI
 * `ios` - iOS/iPadOS "Add to Home Screen", `macos` - Safari 17+ "Add to Dock"
 */
export type ManualInstallPlatform = "ios" | "macos";

interface InstallState {
  /** Browser offered native install prompt (Chromium) */
  canPrompt: boolean;
  manualInstall: ManualInstallPlatform | null;
  /** Running as installed app */
  isInstalled: boolean;
}

const serverState: InstallState = { canPrompt: false, manualInstall: null, isInstalled: false };

const detectManualInstall = (): ManualInstallPlatform | null => {
  const { userAgent } = navigator;
  // iPadOS reports itself as Mac, distinguish it by touch support
  if (/iPad|iPhone|iPod/.test(userAgent) || (userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)) {
    return "ios";
  }

  // Desktop Safari only - Chromium and Firefox UAs contain "Safari" as well. "Add to Dock" exists since Safari 17
  const safariVersion = /Version\/(\d+).*Safari/.exec(userAgent)?.[1];
  const isSafari = !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/.test(userAgent);
  if (userAgent.includes("Macintosh") && isSafari && Number(safariVersion) >= 17) return "macos";

  return null;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let state = serverState;
const listeners = new Set<() => void>();

const update = (partial: Partial<InstallState>) => {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
};

// Registered on module load - `beforeinstallprompt` can fire before any component mounts
if (typeof window !== "undefined") {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  state = { canPrompt: false, manualInstall: detectManualInstall(), isInstalled: isStandalone };

  window.addEventListener("beforeinstallprompt", (event) => {
    // Keep the event to show our own install UI instead of the browser mini-infobar
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    update({ canPrompt: true });
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    update({ canPrompt: false, isInstalled: true });
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Show native install prompt
 * @returns true, if the user installed the app
 */
const promptInstall = async () => {
  if (!deferredPrompt) return false;

  const prompt = deferredPrompt;
  // The event can be used only once
  deferredPrompt = null;
  update({ canPrompt: false });

  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome === "accepted";
};

/**
 * PWA install state
 * `isAvailable` - app can be installed, either with native prompt or manually in Safari
 */
export const useInstallPrompt = () => {
  const { canPrompt, manualInstall, isInstalled } = useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  );

  return {
    canPrompt,
    manualInstall,
    isInstalled,
    isAvailable: !isInstalled && (canPrompt || manualInstall !== null),
    promptInstall,
  };
};
