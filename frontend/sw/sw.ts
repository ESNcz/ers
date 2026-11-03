// Service worker - Web Push only, no caching.
// Compiled to `public/sw.js` by `pnpm build:sw` (part of `dev` and `build`), served with the headers in next.config.ts.
// Kept a classic script (no import/export) - module service workers are not supported in every browser.

/** Sent by the API `PushService` */
interface PushPayload {
  title?: string;
  body?: string;
  /** App path opened on notification click */
  url?: string;
  tag?: string;
}

/** `self` is typed as WorkerGlobalScope, in a service worker it is ServiceWorkerGlobalScope */
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("install", () => {
  // Activate a new version right away, there are no caches that could get out of sync
  void sw.skipWaiting();
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener("push", (event) => {
  let payload: PushPayload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : undefined };
  }

  const title = payload.title || "Event Registration System";
  // `renotify` is missing in the TS lib
  const options: NotificationOptions & { renotify?: boolean } = {
    body: payload.body,
    tag: payload.tag,
    renotify: Boolean(payload.tag),
    icon: "/icons/mrkvanek_192.png",
    badge: "/icons/mrkvanek_192.png",
    data: { url: payload.url || "/" },
  };

  // iOS revokes the subscription when a push does not show a notification - always show one
  event.waitUntil(sw.registration.showNotification(title, options));
});

sw.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = new URL(event.notification.data?.url || "/", sw.location.origin).href;

  // Reuse an open app window, open a new one otherwise
  event.waitUntil(
    sw.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windows) => {
      const appWindow = windows.find((client) => new URL(client.url).origin === sw.location.origin);
      if (appWindow) {
        try {
          await appWindow.focus();
          // Rejects for windows not controlled by this worker
          return await appWindow.navigate(url);
        } catch {
          // Fall through to a new window
        }
      }
      return sw.clients.openWindow(url);
    }),
  );
});

sw.addEventListener("pushsubscriptionchange", (event) => {
  // Browser rotated the subscription - send the new one to the API, the auth cookie is sent along (same origin)
  const { newSubscription, oldSubscription } = event;
  if (!newSubscription && !oldSubscription) return;

  const subscribe = newSubscription
    ? Promise.resolve(newSubscription)
    : sw.registration.pushManager.subscribe(oldSubscription?.options);

  event.waitUntil(
    subscribe.then((subscription) =>
      fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(subscription.toJSON()),
      }),
    ),
  );
});
