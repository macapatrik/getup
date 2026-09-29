// Service worker GetTogether – jen push upozornění, žádná offline cache.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "GetTogether", {
      body: data.body || "",
      icon: data.icon || "/pwa-icon/192",
      tag: data.tag,
      data: { url: data.url || "/matches" },
    }),
  );
});

// Klepnutí na upozornění otevře chat (nebo přepne už otevřenou aplikaci).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/matches", self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin !== self.location.origin) continue;
        try {
          const target = (await client.navigate(url)) || client;
          await target.focus();
          return;
        } catch {
          // okno nejde převzít – otevřeme nové
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
