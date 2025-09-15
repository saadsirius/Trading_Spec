// Service Worker for Alpaca Auto-Trading App
// Handles push notifications and offline functionality

const CACHE_NAME = 'alpaca-trading-v1';
const urlsToCache = [
  '/',
  '/trading',
  '/onboarding',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Push event
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Alpaca Auto-Trading',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: '/trading',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    tag: 'trading-notification',
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Failed to parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/trading';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('Failed to handle notification click:', error);
      })
  );
});

// Background sync (if supported)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'trading-sync') {
    event.waitUntil(
      // Sync trading data in background
      syncTradingData()
    );
  }
});

// Message event (communication with main thread)
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Helper function for background sync
async function syncTradingData() {
  try {
    // Sync pending orders, positions, etc.
    console.log('Syncing trading data...');
    
    // In a real app, you would:
    // 1. Fetch latest data from API
    // 2. Update local cache
    // 3. Notify main thread of updates
    
    return Promise.resolve();
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error;
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync event:', event.tag);
  
  if (event.tag === 'trading-updates') {
    event.waitUntil(
      syncTradingData()
    );
  }
});

console.log('Service Worker loaded successfully');
