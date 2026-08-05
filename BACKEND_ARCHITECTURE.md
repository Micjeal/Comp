# CommunityConnect • Enterprise Backend & Database Architecture Blueprint

This document defines the complete backend infrastructure, REST API specifications, middleware pipelines, database schemas (PostgreSQL & Apache Cassandra), Redis caching strategies, PWA service worker lifecycle, and Admin Monitoring controls for **CommunityConnect**.

---

## 1. System Architecture Overview

CommunityConnect utilizes a **hybrid polyglot storage microservices architecture**:

- **API Gateway / Server Layer (Node.js/Express with TypeScript)**: Handles HTTP routes, JWT authentication, RBAC authorization, rate limiting, and request validation.
- **PostgreSQL 16 (Relational Core Engine)**: Manages relational data requiring ACID compliance (Users, Campaigns, Groups Metadata, Events, RSVPs, Reports, Audit Logs). Indexed with B-Tree and GIN indexes, powered by automated triggers.
- **Apache Cassandra 4.x (Distributed NoSQL Store)**: Handles high-throughput, low-latency community discussion feeds, post comments, and notification streams across high-volume groups.
- **Redis 7.x (In-Memory Cache & Pub/Sub)**: Accelerates feed rendering, maintains user sessions, counts real-time campaign signatures, and broadcasts WebSockets / Server-Sent Events (SSE).
- **Progressive Web App (PWA) Layer**: Provides offline-first application shell caching (`sw.js`), background payload sync, and push notification handling.

```
                   ┌──────────────────────────────────────┐
                   │    PWA Mobile & Desktop Client       │
                   └──────────────────┬───────────────────┘
                                      │ REST / WebSockets / SSE
                                      ▼
                   ┌──────────────────────────────────────┐
                   │         API Gateway (Express)        │
                   │  - Rate Limiter                      │
                   │  - Auth & RBAC Middleware            │
                   │  - Request Validation (Zod)          │
                   └───────┬──────────────┬───────────────┘
                           │              │
           ┌───────────────┴────┐   ┌─────┴────────────────┐
           ▼                    ▼   ▼                      ▼
┌─────────────────────┐  ┌─────────────┐   ┌────────────────────┐
│   PostgreSQL 16     │  │ Apache      │   │     Redis 7.x      │
│  - Relational Core  │  │ Cassandra   │   │ - Session Store    │
│  - Indexed Tables   │  │ - Posts &   │   │ - Feed Cache       │
│  - Auto Triggers    │  │   Comments  │   │ - Pub/Sub Broker   │
└─────────────────────┘  └─────────────┘   └────────────────────┘
```

---

## 2. API Gateway & Middleware Stack

All incoming requests pass through a strictly ordered pipeline of middleware:

```typescript
// Middleware Execution Order:
// 1. Helmet (Security Headers) -> 2. CORS -> 3. Express Rate Limiter (Redis-backed)
// 4. Body Parser -> 5. JWT Auth Verification -> 6. RBAC Role Enforcer -> 7. Zod Schema Validation
```

### 2.1 Core Middleware Implementation Specifications

1. **Authentication Middleware (`authGuard`)**:
   - Extracts `Authorization: Bearer <token>` from HTTP header.
   - Verifies RSA-256 signed JWT token against public key or Redis session whitelist.
   - Attaches `req.user = { id, email, role }` to request context.

2. **Role-Based Access Control (`rbacGuard(allowedRoles)`)**:
   - Compares `req.user.role` against endpoint requirement (e.g. `['admin', 'moderator']`).
   - Returns `HTTP 403 Forbidden` if role hierarchy is insufficient.

3. **Redis Rate Limiting Middleware (`rateLimiter`)**:
   - Tracks client IP / user ID using Redis sliding window keys: `ratelimit:{userId}:{endpoint}`.
   - Default limits: 100 requests / minute for standard API calls; 5 requests / minute for authentication & creation endpoints.

4. **Validation Middleware (`validateRequest(schema)`)**:
   - Validates `req.body`, `req.query`, and `req.params` against type-safe Zod schemas. Returns `HTTP 422 Unprocessable Entity` with field-level errors if invalid.

---

## 3. Full REST API Specification

### 3.1 Authentication & Profile Service

#### `POST /api/v1/auth/register`
- **Description**: Creates a new user account and returns JWT authentication pair.
- **Request Body**:
```json
{
  "fullName": "Sarah Namubiru",
  "email": "sarah@example.org",
  "password": "SecurePassword123!",
  "role": "leader",
  "location": "Kampala, Uganda"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "user": { "id": "usr_101", "email": "sarah@example.org", "role": "leader" },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "d8f7e9a..."
  }
}
```

#### `GET /api/v1/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: Current user profile metadata and statistics.

---

### 3.2 Campaigns Microservice

#### `GET /api/v1/campaigns`
- **Query Params**: `category=Environment&status=published&page=1&limit=20`
- **Response `200 OK`**: Cached campaign list from Redis / PostgreSQL fallback.

#### `POST /api/v1/campaigns`
- **Headers**: `Authorization: Bearer <token>` (Role: `leader` | `organizer` | `admin`)
- **Request Body**:
```json
{
  "title": "Clean Water Borehole Initiative",
  "summary": "Restoring clean water access for 5,000 residents in Nakivubo",
  "description": "Full details on borehole restoration, logistics and volunteer timeline.",
  "category": "Environment",
  "location": "Nakivubo, Kampala",
  "goalType": "signatures",
  "goalValue": 1000,
  "coverUrl": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"
}
```

#### `POST /api/v1/campaigns/:id/participate`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ "actionType": "signature", "comment": "Fully supported!" }`
- **Response `200 OK`**: Returns updated current signature count (Triggers PostgreSQL count auto-increment & invalidates Redis cache).

---

### 3.3 Community Groups & Discussions Service

#### `GET /api/v1/groups/:id`
- **Response `200 OK`**: Group metadata, member count, and owner information.

#### `POST /api/v1/groups/:id/join`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: Join request approved / pending state.

#### `GET /api/v1/groups/:id/posts`
- **Description**: Reads group discussion timeline from Apache Cassandra.
- **Query Params**: `bucket=2026-08&limit=20`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "postId": "pst_001",
      "groupId": "grp_001",
      "authorName": "David Musoke",
      "body": "Bi-weekly drainage inspection scheduled for Saturday 9 AM.",
      "likeCount": 24,
      "createdAt": "2026-08-04T12:00:00Z"
    }
  ]
}
```

#### `POST /api/v1/groups/:id/posts`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ "body": "We need 3 more volunteers for drainage clearance", "mediaUrl": "..." }`
- **Response `201 Created`**: Writes post to Cassandra and emits Redis Pub/Sub message for real-time WebSocket client updates.

---

### 3.4 Moderation & Admin API Service

#### `GET /api/v1/admin/reports`
- **Headers**: `Authorization: Bearer <token>` (Role: `admin` | `moderator`)
- **Response `200 OK`**: List of pending moderation reports flagged by community members.

#### `POST /api/v1/admin/reports/:id/action`
- **Headers**: `Authorization: Bearer <token>` (Role: `admin`)
- **Request Body**:
```json
{
  "action": "takedown", // "takedown" | "dismiss"
  "moderatorNotes": "Violates Community Policy Section 4 (Harassment)"
}
```

#### `POST /api/v1/admin/verifications/:id/approve`
- **Headers**: `Authorization: Bearer <token>` (Role: `admin`)
- **Description**: Approves civic identity verification and grants blue verified badge to user profile.

---

## 4. PostgreSQL Relational Database Schema & Indexes

PostgreSQL handles core structured entities with strict foreign key constraints, B-Tree indexes, and automated trigger procedures.

```sql
-- Enable UUID extension for high-collision-resistant primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. USERS TABLE
-- -------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  location VARCHAR(150) DEFAULT 'Kampala, Uganda',
  role VARCHAR(30) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'leader', 'organizer', 'moderator', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verified ON users(verified) WHERE verified = TRUE;

-- -------------------------------------------------------------
-- 2. CAMPAIGNS TABLE
-- -------------------------------------------------------------
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  cover_url TEXT NOT NULL,
  location VARCHAR(150) NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  goal_type VARCHAR(30) NOT NULL CHECK (goal_type IN ('signatures', 'volunteers', 'attendance', 'fundraising', 'awareness')),
  goal_value INT NOT NULL CHECK (goal_value > 0),
  current_value INT NOT NULL DEFAULT 0,
  unit_label VARCHAR(30) DEFAULT 'signatures',
  status VARCHAR(30) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'under_review', 'published', 'paused', 'completed', 'rejected')),
  participants_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Composite & Partial Indexes for Rapid Filtering & Search
CREATE INDEX idx_campaigns_category_status ON campaigns(category, status);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX idx_campaigns_published_at ON campaigns(published_at DESC);
CREATE INDEX idx_campaigns_status_published ON campaigns(status) WHERE status = 'published';

-- -------------------------------------------------------------
-- 3. CAMPAIGN PARTICIPANTS TABLE
-- -------------------------------------------------------------
CREATE TABLE campaign_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(30) DEFAULT 'signature',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_campaign_participants_camp_user ON campaign_participants(campaign_id, user_id);

-- -------------------------------------------------------------
-- 4. GROUPS TABLE
-- -------------------------------------------------------------
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  cover_url TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  location VARCHAR(150) NOT NULL,
  member_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_category ON groups(category);
CREATE INDEX idx_groups_owner ON groups(owner_id);

-- -------------------------------------------------------------
-- 5. GROUP MEMBERSHIPS TABLE
-- -------------------------------------------------------------
CREATE TABLE group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_memberships_lookup ON group_memberships(group_id, user_id, status);

-- -------------------------------------------------------------
-- 6. MODERATION REPORTS TABLE
-- -------------------------------------------------------------
CREATE TABLE moderation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(30) NOT NULL CHECK (resource_type IN ('campaign', 'group', 'event', 'post', 'user')),
  resource_id VARCHAR(255) NOT NULL,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'actioned')),
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX idx_moderation_reports_created ON moderation_reports(created_at DESC);

-- -------------------------------------------------------------
-- 7. SYSTEM AUDIT LOGS TABLE
-- -------------------------------------------------------------
CREATE TABLE system_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_resource VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor ON system_audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created ON system_audit_logs(created_at DESC);
```

### 4.1 PostgreSQL Automated Triggers & Functions

```sql
-- Trigger 1: Auto-update campaign statistics on new participant signature
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET current_value = current_value + 1,
      participants_count = participants_count + 1
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_campaign_stats
AFTER INSERT ON campaign_participants
FOR EACH ROW
EXECUTE FUNCTION update_campaign_stats();

-- Trigger 2: Auto-update group member count on membership change
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE groups SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_group_member_count
AFTER INSERT OR DELETE ON group_memberships
FOR EACH ROW
EXECUTE FUNCTION update_group_member_count();
```

---

## 5. Apache Cassandra Distributed Schema (Discussions & Messages)

Cassandra handles high-velocity group timeline posts and comment sub-threads to guarantee write availability and linear scaling.

```cql
-- Create Keyspace with Replication Strategy
CREATE KEYSPACE community_connect WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'us-east-1': 3,
  'eu-west-1': 3
};

USE community_connect;

-- -------------------------------------------------------------
-- 1. GROUP DISCUSSION POSTS TIMELINE TABLE
-- Partitioned by group_id and bucket_year_month to avoid hot partitions
-- -------------------------------------------------------------
CREATE TABLE discussion_posts (
  group_id text,
  bucket_year_month text, -- e.g. '2026-08'
  created_at timestamp,
  post_id timeuuid,
  author_id text,
  author_name text,
  author_avatar text,
  author_role text,
  body text,
  media_url text,
  like_count counter,
  comment_count counter,
  PRIMARY KEY ((group_id, bucket_year_month), created_at, post_id)
) WITH CLUSTERING ORDER BY (created_at DESC, post_id DESC);

-- -------------------------------------------------------------
-- 2. POST COMMENTS SUB-THREAD TABLE
-- -------------------------------------------------------------
CREATE TABLE discussion_comments (
  post_id text,
  created_at timestamp,
  comment_id timeuuid,
  author_id text,
  author_name text,
  author_avatar text,
  body text,
  PRIMARY KEY (post_id, created_at, comment_id)
) WITH CLUSTERING ORDER BY (created_at ASC, comment_id ASC);

-- -------------------------------------------------------------
-- 3. USER NOTIFICATIONS STREAM TABLE
-- Automatic expiration after 30 days via default_time_to_live
-- -------------------------------------------------------------
CREATE TABLE user_notifications (
  user_id text,
  created_at timestamp,
  notification_id timeuuid,
  type text,
  title text,
  message text,
  resource_type text,
  resource_id text,
  read_at timestamp,
  PRIMARY KEY (user_id, created_at, notification_id)
) WITH CLUSTERING ORDER BY (created_at DESC, notification_id DESC)
  AND default_time_to_live = 2592000; -- 30 days TTL
```

---

## 6. Redis Caching & Pub/Sub Messaging Strategy

Redis acts as a high-performance in-memory layer operating in dual mode: Cache & Real-Time Event Broker.

### 6.1 Cache Key Namespace Specifications

| Key Pattern | Data Structure | TTL | Description |
| :--- | :--- | :--- | :--- |
| `feed:campaigns:trending` | JSON String | 300s (5 mins) | Top trending campaigns feed array |
| `group:detail:{groupId}` | Hash | 600s (10 mins) | Group metadata profile cache |
| `user:session:{token}` | Hash | 86400s (24 hrs) | Authenticated user session claims |
| `ratelimit:{ip}:{endpoint}` | String Counter | 60s | Sliding window rate limit counter |
| `campaign:sigs:{campId}` | String Counter | Indefinite | High-velocity atomic signature counter |

### 6.2 Redis Pub/Sub Channels for Real-Time Synchronization

1. `channel:group:{groupId}:discussion`: Broadcasts newly created discussion posts to connected WebSocket listeners in a group.
2. `channel:user:{userId}:notifications`: Delivers push notification events directly to online user sockets.

---

## 7. Progressive Web App (PWA) & Mobile Architecture

CommunityConnect is fully optimized for installation across **iOS, Android, and Desktop platforms**.

### 7.1 Web Application Manifest (`/public/manifest.json`)
- **Display Mode**: `standalone` (hides browser chrome for native app experience).
- **Theme Color**: `#0F1219` (matches dark geometric container canvas).
- **Background Color**: `#0A0C10`.
- **Icons**: 192x192 and 512x512 maskable PNG icons.

### 7.2 Service Worker Strategy (`/public/sw.js`)
- **Pre-Caching**: Cache-First strategy for essential application shell assets (`/`, `/index.html`, `/manifest.json`).
- **Data Caching**: Stale-While-Revalidate strategy for API GET endpoints, serving cached responses instantly while background-fetching updates.
- **Offline Fallback**: Intercepts failed network requests when offline and serves cached app shell seamlessly.
- **Push Notification Listener**: Receives background push events and displays rich native OS notifications.

---

## 8. Admin Monitoring Command Centre

The Admin Command Centre (`/src/views/AdminView.tsx`) provides real-time visibility into platform operations:

1. **System Health & Metrics Overview**: Active campaigns count, community groups count, pending moderation reports, and Redis cache hit ratio (99.4%).
2. **Moderation Queue Management**: Review community reports with details, reporter username, and timestamp. Admin can "Dismiss Flag" or "Take Down Content".
3. **Identity Verification Processing**: Review civic leader applications (ID card, NGO licensing) and grant blue verified badge.
4. **Database & Infrastructure Node Monitor**: Monitor PostgreSQL connection pool status, Cassandra 3-node quorum state, Redis memory allocation, and PWA Service Worker version.
5. **Live System Audit Log Inspector**: Real-time logging of database queries, cache operations, service worker events, and authentication checks.

---

## 9. Deployment & Containerization Setup

### 9.1 Environment Variables Matrix (`.env.example`)
```env
# Server Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your_rsa_256_jwt_secret_key_here

# PostgreSQL Primary Instance
POSTGRES_HOST=postgres.internal
POSTGRES_PORT=5432
POSTGRES_DB=community_connect
POSTGRES_USER=civic_admin
POSTGRES_PASSWORD=secure_postgres_password

# Apache Cassandra Cluster
CASSANDRA_CONTACT_POINTS=cassandra-node1.internal,cassandra-node2.internal
CASSANDRA_KEYSPACE=community_connect
CASSANDRA_LOCAL_DC=us-east-1

# Redis Cache Cluster
REDIS_HOST=redis.internal
REDIS_PORT=6379
REDIS_PASSWORD=secure_redis_password
```

### 9.2 Container Build Command (`package.json`)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 3000 --host 0.0.0.0",
    "lint": "tsc --noEmit"
  }
}
```

---
*Document Version: 1.4 | Approved for Production Architecture*
