/* AISU staff: lets the dashboard show system notifications (needed on Android, and on iPhone once the
   page is added to the Home Screen). Nothing is cached: the dashboard always loads fresh. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = all.find(c => new URL(c.url).pathname.startsWith('/staff'));
    if(open) return open.focus();
    return self.clients.openWindow('./');
  })());
});
