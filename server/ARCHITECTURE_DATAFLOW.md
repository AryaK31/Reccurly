# SubDub API - Integration Data Flow & Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUBDUB API SYSTEM ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────┘

                            CLIENT APPLICATION
                                     │
                                     │ (Session Token)
                                     ▼
                    ┌────────────────────────────────┐
                    │      EXPRESS.JS SERVER          │
                    │      (Port 5500)                │
                    └────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │  AUTHENTICATION      │  │  REQUEST PROTECTION  │
        │  (Clerk Middleware)  │  │  (ArcJet Middleware) │
        └──────────────────────┘  └──────────────────────┘
                    │                    │
                    └─────────┬──────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │   CORE ROUTES        │  │  WEBHOOK ROUTES      │
        │  - User Management   │  │  - Clerk Events      │
        │  - Subscriptions     │  │                      │
        │  - Workflows         │  │                      │
        └──────────────────────┘  └──────────────────────┘
                    │                    │
                    │                    ▼
                    │          ┌──────────────────────┐
                    │          │   CLERK API          │
                    │          │  (Webhook Events)    │
                    │          └──────────────────────┘
                    │
                    └──────────────┬──────────────────────┐
                                   │                      │
                    ┌──────────────┴─────────┐            │
                    │                        │            │
                    ▼                        ▼            ▼
        ┌──────────────────────┐ ┌──────────────────┐  ┌──────────────────┐
        │   MONGODB            │ │  UPSTASH QSTASH  │  │  NODEMAILER      │
        │   (Persistence)      │ │  (Workflows)     │  │  via GMAIL       │
        │  - Users             │ │  - Scheduling    │  │  (Email Delivery)│
        │  - Subscriptions     │ │  - Reminders     │  │                  │
        └──────────────────────┘ └──────────────────┘  └──────────────────┘
```

---

## User Authentication Flow

```
┌──────────────┐
│   CLIENT     │
│ (Frontend)   │
└──────┬───────┘
       │
       │ 1. User clicks "Sign Up/Sign In"
       ▼
┌──────────────────────────────────────────────────────────┐
│ CLERK AUTHENTICATION (clerk.com)                         │
│ - User fills credentials                                 │
│ - Clerk handles authentication                           │
│ - Session token is issued                                │
└──────────────────────────────────────────────────────────┘
       │
       │ 2. Frontend stores session token
       │    Sends: Authorization: Bearer <clerk_session_token>
       ▼
┌──────────────────────────────────────────────────────────┐
│ EXPRESS SERVER (/api/v1/users/me)                        │
│ 1. clerkMiddleware validates token                       │
│ 2. getAuth(req) extracts userId                          │
│ 3. Lookup user in MongoDB by clerkId                     │
└──────────────────────────────────────────────────────────┘
       │
       ├─ If user exists in DB
       │  └─ Return User from MongoDB
       │
       └─ If user does NOT exist in DB
          ├─ Call Clerk API (clerkClient.users.getUser)
          ├─ Normalize user data
          └─ Create user in MongoDB
              ▼
          ┌──────────────────────┐
          │  MongoDB             │
          │  (New user record)   │
          └──────────────────────┘

WEBHOOK SYNC (Alternative path):
Clerk sends user.created/user.updated events
                ▼
POST /api/v1/webhooks/clerk
                ▼
Verify webhook signature with CLERK_WEBHOOK_SIGNING_SECRET
                ▼
Sync/Create/Update user in MongoDB
```

---

## Subscription & Reminder Workflow

```
┌──────────────────────────────────────────────────────────┐
│ 1. SUBSCRIPTION CREATION                                 │
│    Client: POST /api/v1/subscriptions                    │
│    Auth: Bearer <clerk_session_token>                    │
│    Body: { name, price, currency, frequency, ... }      │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ SERVER PROCESSING                                        │
│ - Validate subscription data                             │
│ - Calculate renewal date (auto)                          │
│ - Save subscription to MongoDB                           │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ 2. TRIGGER UPSTASH WORKFLOW                              │
│    workflowClient.trigger({                              │
│      url: /api/v1/workflows/subscription/reminder        │
│      body: { subscriptionId: "..." }                     │
│    })                                                     │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ UPSTASH QSTASH (Scheduled Execution)                     │
│ - Stores workflow with payload                           │
│ - Calls POST /api/v1/workflows/subscription/reminder     │
│   (Will retry if needed, respects payload)               │
└──────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ 3. WORKFLOW EXECUTION (sendReminders function)           │
│    Scheduled by QStash                                   │
└──────────────────────────────────────────────────────────┘
       │
       ├─ context.run("get subscription")
       │   └─ Fetch from MongoDB with user data
       │
       ├─ Validate subscription is active
       │
       ├─ Check renewal_date > today
       │
       └─ Loop through reminders (7, 5, 2, 1, 0 days):
          │
          ├─ context.sleepUntil(reminderDate)
          │   └─ QStash pauses workflow until that date
          │
          └─ context.run("send email")
              │
              ▼
          ┌────────────────────────────────────┐
          │ 4. SEND REMINDER EMAIL             │
          │    sendReminderEmail()             │
          └────────────────────────────────────┘
              │
              ├─ Select email template for reminder type
              │  (7 days, 5 days, 2 days, 1 day, final day)
              │
              ├─ Generate email subject and HTML body
              │
              ├─ Populate with subscription data:
              │  - User name
              │  - Subscription name
              │  - Renewal date
              │  - Price and currency
              │  - Payment method
              │
              └─ Send via Nodemailer + Gmail
                 │
                 ▼
             ┌────────────────────────────────────┐
             │ GMAIL SMTP DELIVERY                │
             │ (sujata@jsmastery.pro sends email) │
             └────────────────────────────────────┘

Timeline Example (Subscription renewal = April 30, 2026):
┌──────────────────────────────────────────────────────────┐
│ April 23 @ 10:00 AM  → Email: "7 days before"            │
│ April 25 @ 10:00 AM  → Email: "5 days before"            │
│ April 28 @ 10:00 AM  → Email: "2 days before"            │
│ April 29 @ 10:00 AM  → Email: "1 day before"             │
│ April 30 @ 10:00 AM  → Email: "Final day reminder"       │
│ (Workflow stops after final day)                         │
└──────────────────────────────────────────────────────────┘
```

---

## Security & Request Protection Flow

```
┌──────────────────────────────────┐
│   INCOMING HTTP REQUEST           │
│   (From any client)               │
└──────────────┬────────────────────┘
               │
               ▼
        ┌──────────────────────────────────────────┐
        │  ARCJET MIDDLEWARE (Security Check)      │
        │  config/arcjet.js initialization         │
        └──────────────────────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
   SHIELD           TOKEN BUCKET
   (DDoS)           (Rate Limit)
      │                 │
      ├─ Blocks OWASP   ├─ IP-based
      │  Top 10 attacks │  Rate limiting
      │                 │
      │                 ├─ Capacity: 10 tokens
      │                 ├─ Refill rate: 5 tokens
      │                 └─ Interval: 10 seconds
      │
      └────────┬────────┘
               │
               ▼
        ┌──────────────────┐
        │  BOT DETECTION   │
        └──────────────────┘
               │
      ┌────────┴────────────────┐
      │                         │
   ALLOW              ┌─────────┴────────┐
   ↓                  │                  │
   Search             BLOCK              CONTINUE
   Engines            │
                      ├─ Regular bots
                      │  (if not /api/*)
                      │
                      └─ Suspicious bots

Response Status Codes:
┌────────────────────────────────────┐
│ 429 → Rate limit exceeded          │
│ 403 → Bot detected / Forbidden     │
│ 403 → DDoS/Attack blocked          │
│ 200 → Request allowed (proceed)    │
└────────────────────────────────────┘

Bypass Token (Testing Only):
Header: x-arcjet-bypass: <ARCJET_BYPASS_TOKEN>
└─ Skips security checks (for testing)
```

---

## Data Models & Relationships

```
┌────────────────────────────────────────────────────────┐
│  MONGODB COLLECTIONS                                   │
└────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│ USERS COLLECTION        │
├─────────────────────────┤
│ _id (ObjectId)          │
│ clerkId (String)        │ ◄── Link to Clerk account
│ name (String)           │
│ email (String)          │ ◄── Gmail sends to this
│ imageUrl (String)       │
│ authProvider (String)   │ ◄── "clerk" or "local"
│ createdAt (Date)        │
│ updatedAt (Date)        │
└─────────────────────────┘
         ▲
         │ Referenced by
         │
┌─────────────────────────┐
│ SUBSCRIPTIONS           │ ◄── Reminder workflows created for each
├─────────────────────────┤
│ _id (ObjectId)          │
│ name (String)           │ ◄── Shown in emails
│ price (Number)          │ ◄── Shown in emails
│ currency (String)       │ ◄── Shown in emails
│ frequency (String)      │ ◄── monthly/quarterly/yearly
│ category (String)       │
│ color (Hex)             │
│ startDate (Date)        │
│ renewalDate (Date)      │ ◄── Used for workflow scheduling
│ paymentMethod (String)  │ ◄── Shown in emails
│ status (String)         │ ◄── active/cancelled/expired
│ user (ObjectId)         │ ◄── References USERS._id
│ createdAt (Date)        │
│ updatedAt (Date)        │
└─────────────────────────┘

RELATIONSHIP:
┌──────────┐
│  USERS   │  1
├──────────┤   |
│ _id      ├───┼───┬─ Many SUBSCRIPTIONS
│          │   |   │
└──────────┘   M   │
               |   │
            ┌──────┴─────┐
            │            │
   ┌────────▼──────┐  ┌──────────────────┐
   │ SUBSCRIPTIONS │  │ UPSTASH WORKFLOWS │
   │               │  │ (Not persisted    │
   │ user: _id ────┼──┤ in MongoDB)       │
   │               │  │ Stored in QStash  │
   └───────────────┘  │ (External)        │
                      └──────────────────┘
```

---

## Environment Variables Dependency Graph

```
                    ┌─────────────────┐
                    │  .env File      │
                    │  Variables      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┬──────────────┐
        │                    │                    │              │
    Authentication       Database           Workflows        Email
        │                    │                    │              │
        ▼                    ▼                    ▼              ▼
┌───────────────────┐ ┌─────────────┐ ┌──────────────────┐ ┌──────────┐
│ CLERK VARIABLES   │ │ DB_URI      │ │ QSTASH VARIABLES │ │ EMAIL_   │
├───────────────────┤ └─────────────┘ ├──────────────────┤ │PASSWORD  │
│ -PUBLISHABLE_KEY  │      │          │ -URL             │ └──────────┘
│ -SECRET_KEY       │      ├────────► │ -TOKEN           │
│ -JWT_KEY          │      │          │ -CURRENT_KEY     │
│ -WEBHOOK_SECRET   │    MongoDB     │ -NEXT_KEY        │
│ -AUTHORIZED_      │                 └──────────────────┘
│  PARTIES          │                        │
└───────────────────┘                    QStash
         │
      Clerk ────┬──────────────────────┐
                │                      │
            Identity           Webhooks
         Management         (user.created,
                           user.updated,
                           user.deleted)
                                │
                                ▼
                          ┌──────────────┐
                          │ Sync to      │
                          │ MongoDB      │
                          └──────────────┘

Core Variables:
┌─────────────────────────┐
│ NODE_ENV                │ ─► Determines which .env file to load
│ PORT                    │ ─► Server port
│ SERVER_URL              │ ─► Required for QStash callbacks
│ VERCEL                  │ ─► If set, skip app.listen()
└─────────────────────────┘

Security Variables:
┌─────────────────────────┐
│ ARCJET_KEY              │ ─► DDoS protection
│ ARCJET_ENV              │ ─► LIVE or STAGING
│ CORS_ORIGINS            │ ─► Allowed origins
└─────────────────────────┘
```

---

## Error Handling & Logging Flow

```
REQUEST
   │
   ▼
ALL ROUTES & CONTROLLERS
   │
   ├─ ✓ Success
   │   └─ Return response
   │
   └─ ✗ Error
      │
      ├─ Clerk errors
      │  └─ 401 Not Authorized
      │
      ├─ MongoDB errors
      │  └─ validateError
      │  └─ CastError (bad ObjectId)
      │  └─ Duplicate key
      │
      ├─ Application errors
      │  └─ 404 Not Found
      │  └─ Custom statusCode
      │
      └─ Unexpected errors
         └─ 500 Internal Server Error
            │
            ▼
      ERROR MIDDLEWARE
      (error.middleware.js)
         │
         ├─ Log to console
         │
         ├─ Transform errors:
         │  ├─ CastError → 404
         │  ├─ Validation → 400
         │  └─ Duplicate → 400
         │
         ▼
      Response {
        success: false,
        message: error.message,
        error: JSON.stringify(error)
      }
```

---

## Production Deployment Considerations

### Vercel Deployment

```javascript
// In app.js:
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    // Vercel provides the server
    // Local development listens here
  });
}
```

When deploying to Vercel:
1. Set `VERCEL=true` environment variable
2. Express app is exported as `default export`
3. Vercel wraps it in serverless function
4. All services must be externally accessible

### Environment-Specific Setup

```
Development:     .env.development.local  (localhost, testing)
Staging:         .env.staging.local      (production-like)
Production:      .env.production.local   (real users, real services)
```

Each should have appropriate credentials and URLs.

---

## Integration Health Checks

```
ENDPOINT: GET /
Response: "Hello World!" (plain text)
Purpose: Basic health check, no auth required

For Full Integration Check (not in code, use REST client):
┌────────────────────────────────────────────────────────┐
│ 1. Check Clerk Auth                                     │
│    GET /api/v1/users/me                                │
│    Authorization: Bearer <clerk_session_token>         │
│    Expected: 200 with user data                         │
│                                                         │
│ 2. Check MongoDB                                        │
│    (Above request pulls from DB)                        │
│                                                         │
│ 3. Check Clerk Webhooks                                │
│    POST /api/v1/webhooks/clerk (manually trigger)      │
│    Expected: 200 Success                               │
│                                                         │
│ 4. Check Email Sending                                 │
│    Create subscription (triggers workflow)             │
│    POST /api/v1/subscriptions                          │
│    Expected: 201 with workflowRunId                    │
│                                                         │
│ 5. Check ArcJet                                         │
│    Monitor request headers for rate limiting           │
│    Expected: No 429 on normal traffic                  │
└────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

```
┌─────────────────────────────────────────────────┐
│ MONGODB CONNECTION OPTIMIZATION                 │
├─────────────────────────────────────────────────┤
│ - Connection caching (reuse already open conn) │
│ - Promise-based connection management          │
│ - 5 second timeout for DB selection            │
│ - Index on: clerkId, email (users)             │
│ - Index on: user (subscriptions)                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ UPSTASH WORKFLOW OPTIMIZATION                   │
├─────────────────────────────────────────────────┤
│ - No retries for subscription reminders         │
│ - Precise "sleepUntil" scheduling              │
│ - Workflow state stored in QStash (scalable)   │
│ - Multiple emails in one workflow               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ EMAIL DELIVERY OPTIMIZATION                     │
├─────────────────────────────────────────────────┤
│ - Async email sending (non-blocking)            │
│ - Scheduled by QStash (not immediate)           │
│ - One email per reminder round                  │
│ - HTML templates (better delivery rates)        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SECURITY OPTIMIZATION (ArcJet)                  │
├─────────────────────────────────────────────────┤
│ - IP-based rate limiting (not per user)         │
│ - Token bucket (efficient rate limiting)        │
│ - Bot detection (allow search engines)          │
│ - Graceful degradation (if ArcJet fails)        │
└─────────────────────────────────────────────────┘
```

---

## Dependency Chain

```
EXPRESS CORE
   │
   ├─ CLERK (Authentication)
   │   ├─ clerkMiddleware (@clerk/express)
   │   ├─ clerkClient (@clerk/backend)
   │   └─ verifyWebhook (@clerk/express/webhooks)
   │
   ├─ MONGODB (Database)
   │   ├─ mongoose (ODM)
   │   └─ User/Subscription Models
   │
   ├─ UPSTASH (Workflows)
   │   ├─ WorkflowClient (@upstash/workflow)
   │   └─ serve() middleware
   │
   ├─ EMAIL (Notifications)
   │   ├─ nodemailer (SMTP client)
   │   ├─ Gmail SMTP
   │   └─ Email templates
   │
   ├─ ARCJET (Security)
   │   ├─ arcjet (@arcjet/node)
   │   ├─ shield (DDoS)
   │   ├─ detectBot (Bot detection)
   │   └─ tokenBucket (Rate limiting)
   │
   ├─ SUPPORTING LIBRARIES
   │   ├─ cors (CORS)
   │   ├─ cookie-parser (Cookies)
   │   ├─ dotenv (Env vars)
   │   ├─ dayjs (Date handling)
   │   ├─ morgan (Logging)
   │   └─ debug (Debug logging)
   │
   └─ DEVELOPMENT TOOLS
       ├─ nodemon (Auto-reload)
       └─ eslint (Code quality)
```

---

This architecture provides:
- ✅ **Scalability**: Async operations, external service providers
- ✅ **Security**: Multiple layers (Clerk auth, ArcJet protection, webhook verification)
- ✅ **Reliability**: Error handling, database transactions, workflow persistence
- ✅ **Maintainability**: Clean separation of concerns, modular configuration
- ✅ **Observability**: Logging, error tracking, health endpoints
