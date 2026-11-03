"use client";

import { getPushPublicKey, subscribePush, unsubscribePush } from "@/utils/api";
import { useSyncExternalStore } from "react";

const SERVICE_WORKER_URL = "/sw.js";

/** Web Push API is available - on iOS/iPadOS only inside the app installed to the Home Screen */
export const isPushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const registerServiceWorker = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  // `updateViaCache: "none"` - check for a new worker on every load, bypassing the HTTP cache
  return navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: "/", updateViaCache: "none" });
};

/** VAPID key is base64url, `pushManager.subscribe` needs raw bytes */
const urlBase64ToUint8Array = (base64Url: string) => {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
};

const isSameKey = (subscription: PushSubscription, key: Uint8Array) => {
  const current = subscription.options.applicationServerKey;
  if (!current) return false;
  const currentBytes = new Uint8Array(current);
  return currentBytes.length === key.length && currentBytes.every((byte, index) => byte === key[index]);
};

const toDto = (subscription: PushSubscription) => {
  const { endpoint, keys } = subscription.toJSON();
  if (!endpoint || !keys?.p256dh || !keys?.auth) throw new Error("Invalid push subscription");
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
};

export const getPushSubscription = async () => {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL);
  return (await registration?.pushManager.getSubscription()) ?? null;
};

/**
 * Ask for permission and subscribe this browser for the current user.
 * Must be called from a click handler - browsers block the permission prompt otherwise.
 * @returns permission state after the prompt
 */
export const enablePushNotifications = async (): Promise<NotificationPermission> => {
  // First await in the click handler, Safari drops the user gesture after other async work
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;

  const { publicKey } = await getPushPublicKey();
  if (!publicKey) throw new Error("Push notifications are not configured on the server");
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  const registration = (await registerServiceWorker()) ?? (await navigator.serviceWorker.ready);
  let subscription = await registration.pushManager.getSubscription();

  // Server keys were rotated - the old subscription can't receive anything anymore
  if (subscription && !isSameKey(subscription, applicationServerKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }

  subscription ??= await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  await subscribePush(toDto(subscription));

  return permission;
};

/**
 * Stop notifications in this browser. The browser subscription is removed even when the API call fails,
 * the server drops it on the next push (410 Gone).
 */
export const disablePushNotifications = async () => {
  const subscription = await getPushSubscription();
  if (!subscription) return;

  try {
    await unsubscribePush({ endpoint: subscription.endpoint });
  } finally {
    await subscription.unsubscribe();
  }
};

/**
 * Re-send an existing browser subscription, so it belongs to the user who is logged in now
 */
export const syncPushSubscription = async () => {
  if (!isPushSupported() || Notification.permission !== "granted") return;
  const subscription = await getPushSubscription();
  if (subscription) await subscribePush(toDto(subscription));
};

const subscribeNoop = () => () => {};
const getBrowserPermission = () => (isPushSupported() ? Notification.permission : "default");

/**
 * Push support and permission of this browser, server snapshots keep hydration consistent.
 * Permission is read once - the browser fires no event when it changes.
 */
export const usePushSupport = () => {
  const isSupported = useSyncExternalStore(subscribeNoop, isPushSupported, () => false);
  const browserPermission = useSyncExternalStore(subscribeNoop, getBrowserPermission, () => "default" as const);
  return { isSupported, browserPermission };
};
