// ================================================
// 現場チャットの通知係(chat.html が登録する)
// アプリを閉じていても、GASから届いた通知を出す
// 通知を出すだけで、ほかのページの動きには何もしない
// ================================================
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (e) { /* 読めなくても通知は出す */ }
  const data = payload.data || {};
  const n = payload.notification || {};
  const title = n.title || data.title || '現場チャット';
  const body = n.body || data.body || '新しいメッセージがあります';
  const isCall = data.kind === 'call';
  event.waitUntil(self.registration.showNotification(title, {
    body: body,
    icon: 'chat-icon.png',
    // 着信は別の枠で、押すまで消えないようにして、長めに振動させる
    tag: isCall ? 'genba-call' : 'genba-chat',
    renotify: true,
    requireInteraction: isCall,
    vibrate: isCall ? [600, 300, 600, 300, 600, 300, 600] : undefined,
    data: { url: data.url || 'chat.html' }
  }));
});

// 通知をタップしたら、開いているチャットに切り替える(なければ開く)。着信ならその着信を開かせる
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || 'chat.html', self.registration.scope).href;
  const callId = new URL(url).searchParams.get('call');
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.split('?')[0] === url.split('?')[0] && 'focus' in c) {
          if (callId) c.postMessage({ type: 'call', id: callId });
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
