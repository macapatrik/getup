// Service worker GetCrush – jen push upozornění, žádná offline cache.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const url = data.url || "/matches";

  event.waitUntil(
    (async () => {
      // Když má člověk tu stránku zrovna otevřenou v popředí, upozornění neukazujeme (vidí ji).
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const reading = windows.some(
        (client) => client.focused && client.visibilityState === "visible" && new URL(client.url).pathname === url,
      );
      if (reading) return;

      await self.registration.showNotification(data.title || "GetCrush", {
        body: data.body || "",
        icon: data.icon || "/pwa-icon/192",
        tag: data.tag,
        data: { url },
      });
    })(),
  );
});

// Klepnutí na upozornění otevře stránku matche (nebo přepne už otevřenou aplikaci).
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
