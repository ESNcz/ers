"use client";

import { registerServiceWorker, syncPushSubscription } from "@/utils/pushNotifications";
import { useOptionalCurrentUser } from "@components/providers/CurrentUserProvider";
import { useEffect } from "react";

/**
 * Registers `public/sw.js` and hands an existing push subscription over to the logged-in user
 */
const ServiceWorker = () => {
  const { currentUser } = useOptionalCurrentUser();
  const userId = currentUser?.id;

  useEffect(() => {
    registerServiceWorker().catch((error) => console.error("[SW] Registration failed:", error));
  }, []);

  useEffect(() => {
    if (!userId) return;
    syncPushSubscription().catch((error) => console.error("[SW] Push subscription sync failed:", error));
  }, [userId]);

  return null;
};

export default ServiceWorker;
