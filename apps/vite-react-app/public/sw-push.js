// Push Notification Service Worker
const CACHE_NAME = 'hris-push-v1';
const NOTIFICATION_ICON = '/android-chrome-192x192.png';
const NOTIFICATION_BADGE = '/favicon-32x32.png';

self.addEventListener('install', (event) => {
  console.log('Push SW: Install event');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Push SW: Activate event');
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', (event) => {
  const timestamp = new Date().toISOString();
  console.log('Push SW: Push event received at:', timestamp);
  console.log('Push SW: Event data:', event.data);
  console.log('Push SW: Event type:', typeof event.data);
  
  // Store push event for debugging
  try {
    const pushEvent = {
      timestamp,
      hasData: !!event.data,
      dataType: typeof event.data
    };
    
    if (event.data) {
      try {
        pushEvent.jsonData = event.data.json();
      } catch (e) {
        pushEvent.textData = event.data.text();
      }
    }
    
    // Store in IndexedDB or localStorage for debugging
    console.log('Push SW: Stored push event:', pushEvent);
  } catch (e) {
    console.error('Push SW: Error storing push event:', e);
  }
  
  let notificationData = {
    title: 'HRIS Notification',
    body: 'You have a new notification',
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    tag: `hris-notification-${Date.now()}`, 
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Parse push payload if available
  if (event.data) {
    console.log('Push SW: Raw data:', event.data);
    try {
      const payload = event.data.json();
      console.log('Push SW: Parsed payload:', JSON.stringify(payload, null, 2));
      
      // Check if payload has required fields
      if (!payload.title && !payload.body) {
        console.warn('Push SW: Payload missing title and body, using defaults');
      }
      
      notificationData = {
        ...notificationData,
        ...payload,
        icon: payload.icon || NOTIFICATION_ICON,
        badge: payload.badge || NOTIFICATION_BADGE,
        tag: payload.tag || `hris-notification-${Date.now()}`, 
        data: {
          ...notificationData.data,
          ...payload.data
        }
      };
      console.log('Push SW: Final notification data:', JSON.stringify(notificationData, null, 2));
    } catch (error) {
      console.error('Push SW: Error parsing push payload:', error);
      console.log('Push SW: Trying as text data');
      const textData = event.data.text();
      console.log('Push SW: Text data:', textData);
      notificationData.body = textData || notificationData.body;
    }
  } else {
    console.log('Push SW: No event data, using default notification');
  }

  console.log('Push SW: About to show notification with title:', notificationData.title);
  
  const showNotification = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction || false,
      silent: notificationData.silent || false,
      vibrate: notificationData.vibrate || [200, 100, 200],
      actions: notificationData.actions || [
        {
          action: 'open',
          title: 'Buka App',
          icon: '/favicon-16x16.png'
        },
        {
          action: 'close',
          title: 'Tutup',
          icon: '/favicon-16x16.png'
        }
      ]
    }
  ).then(() => {
    console.log('Push SW: Notification shown successfully');
  }).catch((error) => {
    console.error('Push SW: Error showing notification:', error);
  });

  event.waitUntil(showNotification);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Push SW: Notification click event');
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (action === 'close') {
    return;
  }

  // Default action or 'open' action
  // Use action_url from notification data if available, otherwise default to dashboard
  const urlToOpen = data.action_url || data.url || '/dashboard';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if there's any HRIS window open to navigate to the URL
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            // Navigate to the specific action URL
            const baseUrl = new URL(client.url).origin;
            const fullUrl = urlToOpen.startsWith('/') ? baseUrl + urlToOpen : urlToOpen;
            return client.navigate(fullUrl);
          }
        }
        
        // No suitable window found, open a new one
        if (self.clients.openWindow) {
          const baseUrl = self.location.origin;
          const fullUrl = urlToOpen.startsWith('/') ? baseUrl + urlToOpen : urlToOpen;
          return self.clients.openWindow(fullUrl);
        }
      })
      .catch((error) => {
        console.error('Push SW: Error handling notification click:', error);
      })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Push SW: Notification close event');
  
  const notification = event.notification;
  const data = notification.data || {};
  
  // Track notification dismissal if needed
  if (data.trackDismissal) {
    // Send analytics or tracking data
    console.log('Push SW: Notification dismissed', data);
  }
});

// Handle background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Push SW: Background sync event', event.tag);
  
  if (event.tag === 'background-notification-sync') {
    event.waitUntil(
      // Sync any pending notifications when back online
      syncPendingNotifications()
    );
  }
});

async function syncPendingNotifications() {
  try {
    // Implementation for syncing pending notifications
    // This would typically involve checking with your backend
    console.log('Push SW: Syncing pending notifications');
  } catch (error) {
    console.error('Push SW: Error syncing notifications:', error);
  }
}

// Handle message events from main thread
self.addEventListener('message', (event) => {
  console.log('Push SW: Message received', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      default:
        console.log('Push SW: Unknown message type', event.data.type);
    }
  }
});