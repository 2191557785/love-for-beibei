// Service Worker for PWA
const CACHE_NAME = 'beibei-love-v1.0.0';
const urlsToCache = [
  '/mobile.html',
  '/mobile-styles.css',
  '/mobile-app.js',
  '/assets/FirstMeet.jpg',
  '/assets/Beautiful2.jpg',
  '/assets/SeaBeautiful.jpg',
  '/assets/Qingdao.jpg',
  '/assets/QingdaoSheep.jpg',
  '/assets/XianDatangHert.jpg',
  '/assets/XianDatangHug.jpg',
  '/assets/陈柯宇 - 直到遇见了你,我只喜欢你.mp3',
  '/background_photo/05c667d4c3901466caa43d86605c8896.jpg',
  '/background_photo/17c04ded88e2bdad483a73e20aba29a0.jpg',
  '/background_photo/18a325bd95025a47cb9bfaa4da42c04c.jpg',
  '/background_photo/19d1b3a49ea6e3b6ddbb336d4f586099.jpg',
  '/background_photo/19e3b947af4dec061f2a6dbeb798d1d8.jpg',
  '/background_photo/1c410e6c22c855c560b8cc585e6d3aa7.jpg',
  '/background_photo/2032a170a05dbaa8514ead827f59916a.jpg',
  '/background_photo/f05790ae21818af5fa438e1ae075438a.jpg',
  '/background_photo/f13c89252e1cd363fd0d4e1ba16d085e.jpg',
  '/background_photo/f5b1f76c2785e49e0fb690f174de0d4f.jpg',
  '/background_photo/fb72cad14fd7f2752d586861da276a9c.jpg',
  '/background_photo/fb97b82439a458a0319b3248e3d5e1ba.jpg',
  '/background_photo/fbe3ac859ba2ae672f2cdf4e55cf384d.jpg',
  '/background_photo/fd489655f1843ff5d4538e64d4d69e95.jpg'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('正在缓存APP资源...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('APP资源缓存完成！');
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('清理旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker 已激活');
      return self.clients.claim();
    })
  );
});

// 拦截网络请求 - 缓存优先策略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，直接返回缓存
        if (response) {
          return response;
        }
        
        // 否则发起网络请求
        return fetch(event.request).then(response => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 克隆响应，因为响应流只能使用一次
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // 网络失败时的后备方案
        if (event.request.destination === 'document') {
          return caches.match('/mobile.html');
        }
      })
  );
});

// 处理推送通知
self.addEventListener('push', event => {
  const options = {
    body: '贝贝，想你了 💕',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '打开APP',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('给贝贝的爱', options)
  );
});

// 处理通知点击
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/mobile.html')
    );
  }
});
