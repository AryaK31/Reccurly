# SubDub API - External Integrations & Services Analysis

**Project:** SubDub (Subscription Management & Reminder System)  
**Framework:** Node.js/Express.js  
**Database:** MongoDB  
**Analysis Date:** April 14, 2026

---

## Table of Contents
1. [Overview](#overview)
2. [External Services Summary](#external-services-summary)
3. [Detailed Integration Analysis](#detailed-integration-analysis)
4. [Environment Variables Required](#environment-variables-required)
5. [Files Implementation Map](#files-implementation-map)
6. [Setup Instructions](#setup-instructions)

---

## Overview

SubDub is a subscription management API that integrates with multiple external services to provide:
- User authentication and management via Clerk
- Email reminder notifications via Gmail/Nodemailer
- Scheduled workflow tasks via Upstash QStash
- DDoS/Bot protection via ArcJet
- Database persistence via MongoDB

The application uses environment-specific configuration (`.env.{NODE_ENV}.local`) to manage credentials.

---

## External Services Summary

| Service | Purpose | Required/Optional | API Provided By |
|---------|---------|------------------|-----------------|
| **Clerk** | User authentication & management | **REQUIRED** | clerk.com |
| **MongoDB** | Database persistence | **REQUIRED** | Any MongoDB host (Atlas, self-hosted) |
| **Upstash QStash** | Scheduled workflow tasks & email reminders | **REQUIRED** | upstash.com |
| **Gmail (via Nodemailer)** | Email delivery for reminders | **REQUIRED** | gmail.com / Nodemailer |
| **ArcJet** | DDoS protection, rate limiting, bot detection | **OPTIONAL** | arcjet.com |

---

## Detailed Integration Analysis

### 1. **Clerk - Authentication & User Management** 🔐

**What it's used for:**
- User identity and authentication
- Session token verification
- User lifecycle management (create, update, delete)
- Webhook-based user synchronization
- JWT token verification

**Required/Optional:** **REQUIRED**

**Credentials/API Keys Needed:**
```
CLERK_PUBLISHABLE_KEY      - Public key for frontend initialization
CLERK_SECRET_KEY           - Secret key for backend API calls
CLERK_JWT_KEY              - JWT verification key (optional but recommended)
CLERK_WEBHOOK_SIGNING_SECRET - Secret for webhook signature verification
CLERK_AUTHORIZED_PARTIES   - Comma-separated list of allowed origins/apps
```

**Key Features Used:**
- Session token-based authentication
- Webhook handling for user sync events (user.created, user.updated, user.deleted)
- JWT signature verification
- CORS-aware authorized parties configuration

**Implementation Files:**
- [config/env.js](config/env.js#L8-L12) - Environment variable exports
- [app.js](app.js#L7-L8,#L31-L39) - Clerk middleware setup and CORS configuration
- [middlewares/auth.middleware.js](middlewares/auth.middleware.js) - Session validation and user lookup
- [controllers/webhook.controller.js](controllers/webhook.controller.js) - Webhook event handling
- [utils/clerk-user.js](utils/clerk-user.js) - User sync & normalization logic
- [routes/webhook.route.js](routes/webhook.route.js) - Webhook endpoint

**User Flow:**
1. Frontend authenticates with Clerk
2. Frontend sends Clerk session token in Authorization header
3. Backend validates token using `getAuth()` from `@clerk/express`
4. Backend syncs user to MongoDB on first login (or via webhook)
5. Clerk webhooks notify backend of user updates/deletions

**Get Credentials From:**
- Clerk Dashboard: https://dashboard.clerk.com
- Copy keys from the Credentials or API Keys section

---

### 2. **MongoDB - Database Persistence** 💾

**What it's used for:**
- Persistent storage of user profiles
- Subscription records and management
- Relational queries and data validation

**Required/Optional:** **REQUIRED**

**Credentials/API Keys Needed:**
```
DB_URI - MongoDB connection string (URI format)
        Example: mongodb+srv://username:password@cluster.mongodb.net/database
```

**Key Features Used:**
- Mongoose ODM for schema validation
- Connection pooling and caching
- Database name: `subdub`
- Automated connection retry on startup
- TTL-based server selection timeout (5 seconds)

**Implementation Files:**
- [config/env.js](config/env.js#L6) - DB_URI export
- [database/mongodb.js](database/mongodb.js) - Connection management with caching
- [models/user.model.js](models/user.model.js) - User schema and validation
- [models/subscription.model.js](models/subscription.model.js) - Subscription schema with auto-renewal calculations

**Database Collections:**
1. **users** - User profiles
   - Fields: clerkId, name, email, authProvider, imageUrl, password (legacy)
   - Indexed: clerkId, email

2. **subscriptions** - Subscription records
   - Fields: name, price, currency, frequency, category, color, startDate, renewalDate, paymentMethod, status, user
   - Indexed: user (for user-based queries)

**Get Credentials From:**
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Or self-hosted MongoDB instance

---

### 3. **Upstash QStash - Workflow Orchestration & Scheduling** ⏰

**What it's used for:**
- Triggering and managing scheduled workflows
- Email reminder scheduling with multiple reminder points
- Durable job execution with retry logic
- Sleep-until-time functionality for precise scheduling

**Required/Optional:** **REQUIRED**

**Credentials/API Keys Needed:**
```
QSTASH_URL                  - Base URL for QStash API
QSTASH_TOKEN                - API token for authentication
QSTASH_CURRENT_SIGNING_KEY  - Current key for webhook signature verification
QSTASH_NEXT_SIGNING_KEY     - Next key for rotating signatures (optional)
```

**Key Features Used:**
- Workflow scheduling with `@upstash/workflow` package
- Sleep-until functionality for precise timing
- Request body payloads with JSON
- Retries (disabled for subscription reminders: `retries: 0`)
- Express integration via serve() wrapper

**Implementation Files:**
- [config/env.js](config/env.js#L16-L19) - QStash environment variables
- [config/upstash.js](config/upstash.js) - WorkflowClient initialization
- [controllers/workflow.controller.js](controllers/workflow.controller.js) - Reminder workflow logic
- [routes/workflow.route.js](routes/workflow.route.js) - Workflow endpoint
- [controllers/subscription.controller.js](controllers/subscription.controller.js#L105-L130) - Workflow trigger on subscription creation

**Workflow Details:**
- **Endpoint:** `POST /api/v1/workflows/subscription/reminder`
- **Payload:** `{ subscriptionId: string }`
- **Reminders Scheduled:**
  - 7 days before renewal
  - 5 days before renewal
  - 2 days before renewal
  - 1 day before renewal
  - Final day (0 days) - last reminder

**Workflow Logic:**
1. Fetch subscription from MongoDB
2. Validate subscription is active
3. Check if renewal date is in the future
4. Sleep until each reminder date
5. Send reminder email when task wakes up
6. Stop after final day reminder

**Get Credentials From:**
- Upstash Console: https://console.upstash.com
- QStash section → Create new endpoint

---

### 4. **Gmail/Nodemailer - Email Delivery** 📧

**What it's used for:**
- Sending subscription renewal reminder emails
- Email templates with HTML formatting
- Status updates and notifications to users

**Required/Optional:** **REQUIRED**

**Credentials/API Keys Needed:**
```
EMAIL_PASSWORD - Gmail app password (must use app-specific password, not account password)
                 Note: Regular Gmail passwords don't work; enable 2FA and create app password
```

**Hardcoded Configuration:**
```
Email Account: sujata@jsmastery.pro
Service: Gmail SMTP
```

**Key Features Used:**
- Nodemailer SMTP transport
- HTML email templates
- Custom email templates for different reminder types
- Async email sending (non-blocking)

**Implementation Files:**
- [config/env.js](config/env.js#L21) - EMAIL_PASSWORD export
- [config/nodemailer.js](config/nodemailer.js) - Transporter configuration
- [utils/send-email.js](utils/send-email.js) - Email sending logic with templates
- [utils/email-template.js](utils/email-template.js) - Email template definitions
- [controllers/workflow.controller.js](controllers/workflow.controller.js) - Email trigger calls

**Email Templates:**
Each reminder has a subject and HTML body:
1. **7 days before:** "📅 Reminder: Your {name} Subscription Renews in 7 Days!"
2. **5 days before:** "⏳ {name} Renews in 5 Days – Stay Subscribed!"
3. **2 days before:** "🚀 2 Days Left! {name} Subscription Renewal"
4. **1 day before:** "⚡ Final Reminder: {name} Renews Tomorrow!"
5. **Final day:** "✅ {name} Renews Today – You're All Set!"

**Email Content:**
- User name, subscription name, renewal date
- Plan details (price, currency, frequency)
- Payment method
- Account settings and support links

**Get Credentials From:**
1. Gmail Account: https://gmail.com
2. Enable 2-Factor Authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use the 16-character app password as EMAIL_PASSWORD

**Note:** The hardcoded email account needs to be changed or made configurable if using a different email provider.

---

### 5. **ArcJet - Security & DDoS Protection** 🛡️

**What it's used for:**
- DDoS attack prevention (Shield)
- Bot detection and blocking
- Rate limiting per IP address
- Web application security

**Required/Optional:** **OPTIONAL** (but recommended)

**Credentials/API Keys Needed:**
```
ARCJET_KEY  - API key for ArcJet service
ARCJET_ENV  - Environment setting (LIVE/STAGING)
```

**Key Features Used:**
- Shield mode: Protects against common web attacks (OWASP Top 10)
- Bot detection: Allows search engine bots, blocks others
- Token bucket rate limiting: 5 requests per 10-second interval, max 10
- IP-based characteristics
- LIVE mode for production protection
- Bypass token support via `x-arcjet-bypass` header (for testing)

**Implementation Files:**
- [config/env.js](config/env.js#L5) - ARCJET_KEY and ARCJET_ENV exports
- [config/arcjet.js](config/arcjet.js) - ArcJet client configuration
- [middlewares/arcjet.middleware.js](middlewares/arcjet.middleware.js) - Middleware for request protection
- [scripts/test-reminder.sh](scripts/test-reminder.sh#L8,#L18-L19) - Testing bypass support

**Rate Limiting Rules:**
- Capacity: 10 tokens
- Refill rate: 5 tokens
- Interval: 10 seconds
- Returns 429 (Too Many Requests) when exceeded

**Bot Detection:**
- Allows: Search engines (CATEGORY:SEARCH_ENGINE)
- Blocks: All other bots except for API requests
- API requests (paths starting with `/api/v1`) bypass bot detection

**Get Credentials From:**
- ArcJet Dashboard: https://app.arcjet.com
- API Keys section

**Note:** If ARCJET_KEY is not provided, the middleware still works but security features are disabled.

---

## Environment Variables Required

### Configuration File Pattern
The application loads environment variables from:
```
.env.{NODE_ENV}.local
```

Example: For development, it loads `.env.development.local`

### Complete Environment Variables List

#### Core Application
```bash
NODE_ENV=development                    # development, staging, production
PORT=5500                               # Server port
SERVER_URL=http://localhost:5500        # Public server URL (for webhook callbacks)
VERCEL=                                 # Set if running on Vercel (skips listen())
```

#### Clerk Authentication
```bash
CLERK_PUBLISHABLE_KEY=pk_test_...       # Public key for frontend
CLERK_SECRET_KEY=sk_test_...            # Secret key for backend
CLERK_JWT_KEY=...                       # JWT verification key (optional)
CLERK_WEBHOOK_SIGNING_SECRET=...        # Webhook signature key
CLERK_AUTHORIZED_PARTIES=localhost:5500,yourapp.com  # Comma-separated CORS origins
```

#### MongoDB Database
```bash
DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
```

#### Email Service
```bash
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx      # Gmail app password (16 chars with spaces)
```

#### Upstash QStash Workflows
```bash
QSTASH_URL=https://qstash.upstash.io    # QStash base URL
QSTASH_TOKEN=...                         # QStash API token
QSTASH_CURRENT_SIGNING_KEY=...           # Current webhook signing key
QSTASH_NEXT_SIGNING_KEY=...              # Next webhook signing key (optional)
```

#### ArcJet Security
```bash
ARCJET_KEY=ajk_...                       # ArcJet API key
ARCJET_ENV=LIVE                          # LIVE or STAGING
```

#### CORS Configuration
```bash
CORS_ORIGINS=http://localhost:3000,https://app.example.com  # Comma-separated allowed origins
```

### Environment Variable Summary Table

| Variable | Sample Value | Required | Service | Used In |
|----------|--------------|----------|---------|---------|
| NODE_ENV | development | Yes | Core | app.js, config/env.js |
| PORT | 5500 | Yes | Core | app.js |
| SERVER_URL | http://localhost:5500 | Yes | Upstash | controllers/subscription.controller.js |
| CLERK_PUBLISHABLE_KEY | pk_test_... | Yes | Clerk | app.js (middleware) |
| CLERK_SECRET_KEY | sk_test_... | Yes | Clerk | utils/clerk-user.js |
| CLERK_JWT_KEY | ... | No | Clerk | app.js (optional) |
| CLERK_WEBHOOK_SIGNING_SECRET | ... | Yes | Clerk | controllers/webhook.controller.js |
| CLERK_AUTHORIZED_PARTIES | localhost:5500 | No | Clerk | app.js (optional) |
| DB_URI | mongodb+srv://... | Yes | MongoDB | database/mongodb.js |
| EMAIL_PASSWORD | xxxx xxxx xxxx xxxx | Yes | Gmail | config/nodemailer.js |
| QSTASH_URL | https://qstash.upstash.io | Yes | Upstash | config/upstash.js |
| QSTASH_TOKEN | ... | Yes | Upstash | config/upstash.js |
| QSTASH_CURRENT_SIGNING_KEY | ... | Yes* | Upstash | (webhook verification) |
| QSTASH_NEXT_SIGNING_KEY | ... | No | Upstash | (future rotation) |
| ARCJET_KEY | ajk_... | No | ArcJet | config/arcjet.js |
| ARCJET_ENV | LIVE | No | ArcJet | config/arcjet.js |
| CORS_ORIGINS | http://localhost:3000 | No | Core | app.js |

---

## Files Implementation Map

### Configuration Files
| File | Purpose | Integrations Used |
|------|---------|-------------------|
| [config/env.js](config/env.js) | Central environment variable exports | All services |
| [config/arcjet.js](config/arcjet.js) | ArcJet security client setup | ArcJet |
| [config/nodemailer.js](config/nodemailer.js) | Email transporter configuration | Gmail/Nodemailer |
| [config/upstash.js](config/upstash.js) | QStash workflow client setup | Upstash QStash |

### Database Files
| File | Purpose | Integration |
|------|---------|-------------|
| [database/mongodb.js](database/mongodb.js) | Connection management with caching | MongoDB |
| [models/user.model.js](models/user.model.js) | User schema and Clerk sync | MongoDB + Clerk |
| [models/subscription.model.js](models/subscription.model.js) | Subscription schema with validation | MongoDB |

### Middleware Files
| File | Purpose | Integrations Used |
|------|---------|-------------------|
| [middlewares/auth.middleware.js](middlewares/auth.middleware.js) | Session validation & user lookup | Clerk, MongoDB |
| [middlewares/arcjet.middleware.js](middlewares/arcjet.middleware.js) | Rate limiting & bot detection | ArcJet |
| [middlewares/error.middleware.js](middlewares/error.middleware.js) | Error handling | None (core) |

### Controller Files
| File | Purpose | Integrations Used |
|------|---------|-------------------|
| [controllers/auth.controller.js](controllers/auth.controller.js) | Auth endpoints (deprecated) | Clerk |
| [controllers/webhook.controller.js](controllers/webhook.controller.js) | Clerk webhook handling | Clerk |
| [controllers/user.controller.js](controllers/user.controller.js) | User profile endpoints | MongoDB, Clerk |
| [controllers/subscription.controller.js](controllers/subscription.controller.js) | Subscription CRUD operations | MongoDB, Upstash QStash |
| [controllers/workflow.controller.js](controllers/workflow.controller.js) | Email reminder workflow execution | Upstash QStash, Nodemailer, MongoDB |

### Route Files
| File | Purpose | Integrations Used |
|------|---------|-------------------|
| [routes/auth.route.js](routes/auth.route.js) | Authentication routes | Clerk |
| [routes/user.route.js](routes/user.route.js) | User endpoints | Clerk (middleware) |
| [routes/subscription.route.js](routes/subscription.route.js) | Subscription CRUD routes | Clerk (middleware), MongoDB, Upstash |
| [routes/webhook.route.js](routes/webhook.route.js) | Clerk webhook endpoint | Clerk |
| [routes/workflow.route.js](routes/workflow.route.js) | QStash workflow endpoint | Upstash QStash, Nodemailer |

### Utility Files
| File | Purpose | Integrations Used |
|------|---------|-------------------|
| [utils/clerk-user.js](utils/clerk-user.js) | User sync & normalization | Clerk, MongoDB |
| [utils/send-email.js](utils/send-email.js) | Email sending logic | Nodemailer |
| [utils/email-template.js](utils/email-template.js) | Email template definitions | Nodemailer |

### Main Application
| File | Purpose | Integrations Used |
|------|---------|-------------------|
| [app.js](app.js) | Express app setup, middleware mounting | All services |

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- An account with each external service

### Step 1: Clone and Install Dependencies
```bash
git clone <repository-url>
cd reccurly-api-main
npm install
```

### Step 2: Create Environment File
Create `.env.development.local` in the project root:

```bash
# Core Application
NODE_ENV=development
PORT=5500
SERVER_URL=http://localhost:5500

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
CLERK_JWT_KEY=YOUR_JWT_KEY_HERE
CLERK_WEBHOOK_SIGNING_SECRET=YOUR_WEBHOOK_SECRET_HERE
CLERK_AUTHORIZED_PARTIES=http://localhost:3000,http://localhost:5500

# MongoDB
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Email (Gmail)
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Upstash QStash
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=YOUR_QSTASH_TOKEN_HERE
QSTASH_CURRENT_SIGNING_KEY=YOUR_SIGNING_KEY_HERE

# ArcJet Security (Optional)
ARCJET_KEY=ajk_YOUR_KEY_HERE
ARCJET_ENV=LIVE

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5500
```

### Step 3: Obtain Credentials

#### Clerk
1. Go to https://dashboard.clerk.com
2. Create a new application
3. Copy CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
4. Generate JWT key in Dashboard → Settings → API Keys
5. Create webhook in Dashboard → Webhooks
6. Copy webhook signing secret

#### MongoDB
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create database user
4. Get connection string (URI)
5. Add your IP to IP whitelist

#### Gmail
1. Enable 2-Factor Authentication on Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" (or other)
4. Generate app password
5. Copy 16-character password with spaces

#### Upstash QStash
1. Go to https://console.upstash.com
2. Create QStash project
3. Copy API Token
4. Go to Webhooks/Endpoints
5. Create endpoint for POST `/api/v1/workflows/subscription/reminder`
6. Copy signing keys

#### ArcJet (Optional)
1. Go to https://app.arcjet.com
2. Create project
3. Copy API Key

### Step 4: Run the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Test reminder workflow
bash scripts/test-reminder.sh <clerk_session_token>
```

### Step 5: Verify Integrations
- Health check: `GET http://localhost:5500/`
- Current user: `GET http://localhost:5500/api/v1/users/me` (requires auth)
- Create subscription: `POST http://localhost:5500/api/v1/subscriptions/` (triggers workflow)

---

## Dependency Summary

### Production Dependencies
```json
{
  "@arcjet/node": "^1.0.0-beta.2",              // Security/DDoS protection
  "@clerk/backend": "^3.2.0",                    // Clerk backend SDK
  "@clerk/express": "^2.0.4",                    // Clerk Express middleware
  "@upstash/workflow": "^0.2.7",                 // QStash workflow orchestration
  "cookie-parser": "~1.4.7",                     // Cookie parsing
  "cors": "^2.8.6",                              // CORS middleware
  "dayjs": "^1.11.13",                           // Date/time manipulation
  "debug": "~4.4.0",                             // Debug logging
  "dotenv": "^16.4.7",                           // Environment variable loading
  "express": "~4.21.2",                          // Web framework
  "mongoose": "^8.10.0",                         // MongoDB ODM
  "morgan": "~1.10.0",                           // HTTP request logger
  "nodemailer": "^6.10.0"                        // Email delivery
}
```

---

## Summary Table

| Integration | Type | Criticality | Auth Method | Setup Difficulty |
|-------------|------|-------------|---|---|
| **Clerk** | Authentication | REQUIRED | API Keys + Webhooks | Medium |
| **MongoDB** | Database | REQUIRED | Connection URI | Easy |
| **Upstash QStash** | Workflow/Scheduling | REQUIRED | API Token + Signing Keys | Medium |
| **Gmail/Nodemailer** | Email | REQUIRED | App Password | Easy |
| **ArcJet** | Security | OPTIONAL | API Key | Easy |

---

## Troubleshooting

### Common Issues

**1. MongoDB Connection Fails**
- Verify DB_URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

**2. Clerk Webhook Not Triggering**
- Verify CLERK_WEBHOOK_SIGNING_SECRET is correct
- Check webhook URL in Clerk dashboard is accessible
- Verify request payload format matches webhook handler

**3. Emails Not Sending**
- Verify EMAIL_PASSWORD is app password, not account password
- Check Gmail 2FA is enabled
- Verify email account is correctly configured in [config/nodemailer.js](config/nodemailer.js)

**4. QStash Workflow Not Triggering**
- Verify SERVER_URL is publicly accessible
- Check QSTASH_TOKEN is correct
- Verify workflow endpoint is reachable: `POST /api/v1/workflows/subscription/reminder`
- Check QStash console for failed deliveries

**5. ArcJet Rate Limiting Too Aggressive**
- Adjust tokenBucket capacity/refillRate in [config/arcjet.js](config/arcjet.js)
- Use bypass token for testing: `x-arcjet-bypass: {ARCJET_BYPASS_TOKEN}`
- Disable shield mode temporarily for debugging

---

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use environment-specific configs** - Different keys for dev/staging/production
3. **Rotate secrets regularly** - Especially webhook signing secrets
4. **Use strong, unique passwords** - Especially for MongoDB and Gmail
5. **Enable webhook signature verification** - Already implemented in [controllers/webhook.controller.js](controllers/webhook.controller.js)
6. **Keep dependencies updated** - Run `npm audit` regularly
7. **Use HTTPS in production** - Required for webhook callbacks
8. **Validate all user inputs** - Already in place in models

---

## References

- [Clerk Documentation](https://clerk.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Upstash QStash Documentation](https://upstash.com/docs/qstash/overview)
- [Nodemailer Documentation](https://nodemailer.com/smtp/gmail/)
- [ArcJet Documentation](https://docs.arcjet.com)
- [Express.js Documentation](https://expressjs.com)
