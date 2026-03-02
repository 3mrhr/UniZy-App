/**
 * UniZy Integration Configuration
 * 
 * This file contains configuration stubs for external service integrations.
 * Activate each integration by setting the corresponding environment variables.
 * 
 * PHASE 5 INTEGRATIONS:
 * - 5.1 WebSockets/SSE (Real-time)
 * - 5.2 Push Notifications (FCM)
 * - 5.3 Cloud Storage (S3/Cloudinary)
 * - 5.4 Redis Caching
 */

// ============================================================
// 5.1 REAL-TIME LAYER (WebSocket / Server-Sent Events)
// ============================================================
// 
// Recommended: Socket.IO or Pusher
// 
// ENV VARS:
//   PUSHER_APP_ID=
//   PUSHER_KEY=
//   PUSHER_SECRET=
//   PUSHER_CLUSTER=eu
//
// OR for self-hosted WebSockets:
//   WS_PORT=3001
//
// Channels:
//   - order:{orderId}        → live status updates (student + driver)
//   - admin:dispatch         → dispatch updates for admin dashboard
//   - chat:{orderId}         → student ↔ driver chat
//

export const realtimeConfig = {
    provider: process.env.REALTIME_PROVIDER || 'none', // 'pusher', 'socket.io', 'none'
    pusher: {
        appId: process.env.PUSHER_APP_ID || '',
        key: process.env.PUSHER_KEY || '',
        secret: process.env.PUSHER_SECRET || '',
        cluster: process.env.PUSHER_CLUSTER || 'eu',
    },
};

// ============================================================
// 5.2 PUSH NOTIFICATIONS (FCM / APNs)
// ============================================================
//
// ENV VARS:
//   FIREBASE_PROJECT_ID=
//   FIREBASE_CLIENT_EMAIL=
//   FIREBASE_PRIVATE_KEY=
//
// Notification categories (user can opt in/out):
//   - ORDER_UPDATES
//   - PROMOTIONS
//   - SYSTEM_ALERTS
//   - CHAT_MESSAGES
//

export const pushConfig = {
    provider: process.env.PUSH_PROVIDER || 'none', // 'fcm', 'none'
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    },
    categories: ['ORDER_UPDATES', 'PROMOTIONS', 'SYSTEM_ALERTS', 'CHAT_MESSAGES'],
};

// ============================================================
// 5.3 CLOUD STORAGE (S3 / Cloudinary)
// ============================================================
//
// ENV VARS:
//   STORAGE_PROVIDER=cloudinary
//   CLOUDINARY_CLOUD_NAME=
//   CLOUDINARY_API_KEY=
//   CLOUDINARY_API_SECRET=
//
// OR for S3:
//   AWS_ACCESS_KEY_ID=
//   AWS_SECRET_ACCESS_KEY=
//   AWS_REGION=eu-west-1
//   AWS_S3_BUCKET=unizy-uploads
//

export const storageConfig = {
    provider: process.env.STORAGE_PROVIDER || 'local', // 'cloudinary', 's3', 'local'
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'eu-west-1',
        bucket: process.env.AWS_S3_BUCKET || 'unizy-uploads',
    },
    maxFileSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

// ============================================================
// 5.4 REDIS CACHING
// ============================================================
//
// ENV VARS:
//   REDIS_URL=redis://localhost:6379
//
// Cached endpoints:
//   - GET /pricing-rules (TTL: 5 min)
//   - GET /active-zones (TTL: 5 min)
//   - GET /dashboard-stats (TTL: 1 min)
//

export const cacheConfig = {
    provider: process.env.CACHE_PROVIDER || 'none', // 'redis', 'none'
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    ttl: {
        pricingRules: 300, // 5 minutes
        activeZones: 300,
        dashboardStats: 60, // 1 minute
    },
};
