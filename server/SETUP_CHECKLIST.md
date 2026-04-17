# SubDub API - Setup & Verification Checklist

Quick reference checklist for setting up and verifying all external service integrations.

## Pre-Setup Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed and configured
- [ ] Text editor/IDE ready
- [ ] Accounts created for all required services:
  - [ ] Clerk (https://clerk.com)
  - [ ] MongoDB Atlas or self-hosted MongoDB (https://mongodb.com)
  - [ ] Upstash Console (https://upstash.com)
  - [ ] Gmail account (https://gmail.com)
  - [ ] ArcJet (optional) (https://arcjet.com)

---

## Part 1: Local Setup

### 1.1 Clone Repository
```bash
git clone <repository-url>
cd reccurly-api-main
```
- [ ] Repository cloned successfully
- [ ] cd into project directory

### 1.2 Install Dependencies
```bash
npm install
```
- [ ] All dependencies installed
- [ ] No errors in npm output
- [ ] `node_modules` folder created

### 1.3 Create Environment File
```bash
cp .env.development.local.example .env.development.local
```
- [ ] `.env.development.local` created
- [ ] Edit the file with your actual credentials (below)

---

## Part 2: Clerk Setup

### 2.1 Create Clerk Application
1. Go to https://dashboard.clerk.com
2. Sign up/log in
3. Click "Create Application"
4. Choose authentication method (email, password, etc.)

**Actions:**
- [ ] Clerk account created
- [ ] New application created  
- [ ] Application name entered

### 2.2 Get Clerk Credentials

#### CLERK_PUBLISHABLE_KEY & CLERK_SECRET_KEY
1. In Clerk Dashboard → Select your app
2. Go to "Credentials" tab
3. Copy "Publishable Key" and "Secret Key"

```bash
# .env.development.local
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

- [ ] CLERK_PUBLISHABLE_KEY copied to .env
- [ ] CLERK_SECRET_KEY copied to .env

#### CLERK_JWT_KEY (Optional but Recommended)
1. In Clerk Dashboard → Settings → API Keys
2. Look for "JWT Verification Key"
3. Copy the key

```bash
# .env.development.local
CLERK_JWT_KEY=your_jwt_key_here
```

- [ ] CLERK_JWT_KEY copied to .env (or marked as N/A if not needed)

#### CLERK_WEBHOOK_SIGNING_SECRET
1. In Clerk Dashboard → Webhooks
2. Click "Create Endpoint"
3. Endpoint URL: `http://localhost:5500/api/v1/webhooks/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Click "Create"
6. Copy the "Signing Secret"

```bash
# .env.development.local
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

- [ ] Webhook endpoint created in Clerk
- [ ] CLERK_WEBHOOK_SIGNING_SECRET copied to .env
- [ ] All event types selected (user.created, user.updated, user.deleted)

#### CLERK_AUTHORIZED_PARTIES (Optional)
1. For local development: `http://localhost:3000,http://localhost:5500`
2. For production: Add your actual frontend domains

```bash
# .env.development.local
CLERK_AUTHORIZED_PARTIES=http://localhost:3000,http://localhost:5500
```

- [ ] CLERK_AUTHORIZED_PARTIES set
- [ ] Includes your frontend URL

---

## Part 3: MongoDB Setup

### 3.1 MongoDB Atlas Setup (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/log in
3. Click "Create a Team"
4. Click "Create a Project"
5. Click "Create a Cluster" → Select Free tier (M0)

**Cluster Creation:**
- [ ] MongoDB Atlas account created
- [ ] Team created
- [ ] Project created
- [ ] Cluster created (M0 free tier)

### 3.2 Create Database User

1. In Cluster → Security → Database Access
2. Click "Add New Database User"
3. Username: `subdub_user` (or preferred name)
4. Password: Generate strong password
5. Grant role: "Read and Write to any database"
6. Click "Add User"

```bash
Database User: subdub_user
Password: (save securely)
```

- [ ] Database user created
- [ ] Username saved: _______________
- [ ] Password saved securely: _______________

### 3.3 Get Connection String

1. In Cluster → Connect button
2. Select "Drivers" → Select Node.js
3. Copy the connection string

The string looks like:
```
mongodb+srv://subdub_user:<password>@cluster0.abcd123.mongodb.net/?retryWrites=true&w=majority
```

**Important:** Replace `<password>` with actual database user password

4. URL-encode special characters in password if needed

```bash
# .env.development.local
DB_URI=mongodb+srv://subdub_user:password@cluster0.abcd123.mongodb.net/subdub
```

- [ ] Connection string copied
- [ ] Password replaced in connection string
- [ ] Database name `subdub` added (or created)
- [ ] DB_URI set in .env

### 3.4 Allow IP Access

1. In Cluster → Security → Network Access
2. Click "Allow Access from Anywhere" (for development)
3. **For production:** Add specific IPs only

- [ ] IP whitelist configured
- [ ] Current IP added or access from anywhere allowed

---

## Part 4: Gmail Setup

### 4.1 Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Follow Google's verification process

- [ ] Gmail account selected
- [ ] 2-Factor Authentication enabled

### 4.2 Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or other)
3. Google generates 16-character password (with spaces)
4. Copy the exact password

```
xxxx xxxx xxxx xxxx
```

```bash
# .env.development.local
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

- [ ] App password generated
- [ ] EMAIL_PASSWORD copied to .env (with spaces)

### 4.3 Verify Sender Email

The sender email is hardcoded in `config/nodemailer.js`:
```javascript
export const accountMail = "sujata@jsmastery.pro";
```

If using a different email:
1. Edit [config/nodemailer.js](config/nodemailer.js)
2. Change `accountMail` to your Gmail address
3. Update GMAIL credentials

- [ ] Sender email verified or updated
- [ ] Nodemailer config updated if needed

---

## Part 5: Upstash QStash Setup

### 5.1 Create Upstash Account & Project

1. Go to https://upstash.com
2. Sign up/log in
3. Create a new project (name: "subdub" recommended)

- [ ] Upstash account created
- [ ] Project created

### 5.2 Get QStash Credentials

#### QSTASH_URL
Usually this value:
```
https://qstash.upstash.io
```

```bash
# .env.development.local
QSTASH_URL=https://qstash.upstash.io
```

- [ ] QSTASH_URL set

#### QSTASH_TOKEN
1. In Upstash Console → QStash
2. Click on your project
3. Go to "REST API" tab
4. Copy the "Token"

```bash
# .env.development.local
QSTASH_TOKEN=eyJhbGc...
```

- [ ] QSTASH_TOKEN copied to .env

#### QSTASH_CURRENT_SIGNING_KEY & QSTASH_NEXT_SIGNING_KEY
1. In QStash → Webhooks section
2. Look for "Signing Keys"
3. Copy "Current Signing Key"
4. Copy "Next Signing Key" if available

```bash
# .env.development.local
QSTASH_CURRENT_SIGNING_KEY=sig_...
QSTASH_NEXT_SIGNING_KEY=sig_...
```

- [ ] QSTASH_CURRENT_SIGNING_KEY copied
- [ ] QSTASH_NEXT_SIGNING_KEY copied (or left empty if N/A)

### 5.3 Create Webhook Endpoint (Optional for Local Dev)

For local testing, you can skip this. For deployment:

1. In QStash → Workflows or Webhooks
2. Create Delivery Group
3. Name: "subdub-reminders"
4. Endpoint: `https://yourdomain.com/api/v1/workflows/subscription/reminder`
5. Method: POST

- [ ] Webhook endpoint created in QStash (for production)
- [ ] Endpoint URL is publicly accessible

---

## Part 6: ArcJet Setup (Optional)

### 6.1 Create ArcJet Account

1. Go to https://arcjet.com
2. Sign up with GitHub/email
3. Create a new project (name: "subdub")

- [ ] ArcJet account created
- [ ] Project created

### 6.2 Get ArcJet API Key

1. In ArcJet Dashboard → [Your Project] → Settings
2. Copy "API Key"

```bash
# .env.development.local
ARCJET_KEY=ajk_...
ARCJET_ENV=LIVE
```

- [ ] ARCJET_KEY copied to .env
- [ ] ARCJET_ENV set to LIVE or STAGING

**Note:** If you don't use ArcJet, leave ARCJET_KEY empty. Protection will be disabled but app will still work.

- [ ] ARCJET configuration (optional, can be done later)

---

## Part 7: Verify All Credentials in .env

Open `.env.development.local` and verify:

```bash
# Core
NODE_ENV=development
PORT=5500
SERVER_URL=http://localhost:5500

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_... ✓
CLERK_SECRET_KEY=sk_test_...      ✓
CLERK_JWT_KEY=...                 ✓
CLERK_WEBHOOK_SIGNING_SECRET=...  ✓
CLERK_AUTHORIZED_PARTIES=...      ✓

# MongoDB
DB_URI=mongodb+srv://...          ✓

# Gmail
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx ✓

# Upstash
QSTASH_URL=https://qstash.upstash.io ✓
QSTASH_TOKEN=eyJhbGc...           ✓
QSTASH_CURRENT_SIGNING_KEY=...    ✓
QSTASH_NEXT_SIGNING_KEY=...       ✓

# ArcJet (Optional)
ARCJET_KEY=ajk_...                (optional)
ARCJET_ENV=LIVE                   (optional)

# CORS
CORS_ORIGINS=http://localhost:... ✓
```

- [ ] All required values are present (not empty)
- [ ] No copy-paste errors (correct keys, not examples)
- [ ] Passwords/sensitive data not committed to version control
- [ ] `.env.development.local` added to `.gitignore`

---

## Part 8: Start Application

### 8.1 Install if Not Done
```bash
npm install
```
- [ ] All dependencies installed

### 8.2 Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
🚀 App listening on the port 5500
___ MongoDB connected ___
```

- [ ] Server starts without errors
- [ ] Port 5500 is available
- [ ] MongoDB connection successful

### 8.3 Keep Server Running
Leave the server running. Open a new terminal for testing.

- [ ] Server is running on `http://localhost:5500`

---

## Part 9: Integration Testing

### 9.1 Health Check
Test basic connectivity:
```bash
curl http://localhost:5500
```

**Expected Response:**
```
Hello World!
```

- [ ] Health check successful
- [ ] Server is responding

### 9.2 MongoDB Test
Would require authentication, skip for now.

### 9.3 Email Configuration Test
Create a test subscription (requires authentication token):
```bash
TOKEN="<your_clerk_session_token>"

curl -X POST http://localhost:5500/api/v1/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestSub",
    "price": 9.99,
    "currency": "USD",
    "frequency": "monthly",
    "category": "Other",
    "startDate": "2026-04-01T00:00:00Z",
    "renewalDate": "2026-05-01T00:00:00Z",
    "paymentMethod": "Credit Card"
  }'
```

- [ ] Subscription created (or auth error if no token)
- [ ] Response includes `workflowRunId` (QStash workflow triggered)

### 9.4 Workflow Test (if You Have a Valid Subscription ID)

Use the provided test script:
```bash
TOKEN="<your_clerk_session_token>"
bash scripts/test-reminder.sh "$TOKEN"
```

- [ ] Script runs without errors
- [ ] Emails sent to subscriber (check inbox/spam)

---

## Part 10: Production Deployment Checklist

Before deploying to production:

### 10.1 Environment Configuration
- [ ] Create `.env.production.local` with production credentials
- [ ] Ensure `SERVER_URL` points to your production domain
- [ ] Set `NODE_ENV=production`
- [ ] Verify all credentials are production credentials (not development)

### 10.2 Clerk Production Settings
- [ ] Create production Clerk application
- [ ] Update webhook URL to production: `https://yourdomain.com/api/v1/webhooks/clerk`
- [ ] Verify authorized parties include production domains

### 10.3 MongoDB Production
- [ ] Use MongoDB cluster with encryption at rest
- [ ] Enable IP whitelist (specific IPs only)
- [ ] Enable backup
- [ ] Use strong database password
- [ ] Create read-only replicas for scaling

### 10.4 Gmail Production
- [ ] Use a dedicated business email account
- [ ] Use app-specific password
- [ ] Configure SPF/DKIM/DMARC for better delivery

### 10.5 Upstash Production
- [ ] Update webhook endpoints to production URLs
- [ ] Set up monitoring for failed deliveries
- [ ] Test rate limiting is appropriate

### 10.6 ArcJet Production
- [ ] Adjust rate limiting thresholds for expected traffic
- [ ] Monitor blocked requests
- [ ] Set up alerts

### 10.7 Security
- [ ] Enable HTTPS/SSL certificate
- [ ] Set `CORS_ORIGINS` to specific production domains only
- [ ] Disable debug logging
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Rotate secrets every 90 days
- [ ] Use secrets manager (AWS Secrets Manager, Azure KV, etc.)

### 10.8 Monitoring
- [ ] Set up application monitoring
- [ ] Set up database monitoring
- [ ] Set up email delivery monitoring
- [ ] Set up workflow monitoring
- [ ] Configure alerts for failures

### 10.9 Backup & Recovery
- [ ] MongoDB backup strategy implemented
- [ ] Disaster recovery plan tested
- [ ] Rollback procedure documented

- [ ] All production checks completed
- [ ] Ready for production deployment

---

## Troubleshooting Reference

### Server Won't Start
- [ ] Check PORT 5500 is not in use
- [ ] Verify all `.env` variables are set
- [ ] Check NODE_ENV is set
- [ ] Run `npm install` again

### MongoDB Connection Error
- [ ] Verify DB_URI is correct
- [ ] Check MongoDB cluster is running
- [ ] Verify IP is whitelisted in MongoDB Atlas
- [ ] Test connection string manually

### Clerk Authentication Failing
- [ ] Verify CLERK_PUBLISHABLE_KEY is correct
- [ ] Verify CLERK_SECRET_KEY is correct
- [ ] Check Clerk dashboard for app configuration
- [ ] Verify webhook is properly configured

### Emails Not Sending
- [ ] Verify EMAIL_PASSWORD is app password, not regular password
- [ ] Check Gmail 2FA is enabled
- [ ] Verify sender email is correct in [config/nodemailer.js](config/nodemailer.js)
- [ ] Check Gmail logs for failed sends

### Workflows Not Triggering
- [ ] Verify QSTASH_TOKEN is correct
- [ ] Check SERVER_URL is publicly accessible (for QStash callbacks)
- [ ] Verify QSTASH_CURRENT_SIGNING_KEY is correct
- [ ] Check QStash console for failed deliveries
- [ ] Verify workflow endpoint is accessible

### Rate Limiting Too Aggressive (429 Errors)
- [ ] Adjust ArcJet settings in [config/arcjet.js](config/arcjet.js)
- [ ] Use ARCJET_BYPASS_TOKEN for testing
- [ ] Disable ArcJet by removing ARCJET_KEY (if not critical)

### CORS Errors
- [ ] Verify frontend URL is in CORS_ORIGINS
- [ ] Check CORS_ORIGINS is not empty string
- [ ] Restart server after changing CORS_ORIGINS

---

## Quick Reference Links

| Service | Dashboard | Docs | Status |
|---------|-----------|------|--------|
| Clerk | https://dashboard.clerk.com | https://clerk.com/docs | Status: https://clerk.statuspage.io |
| MongoDB | https://cloud.mongodb.com | https://docs.mongodb.com | Status: https://status.mongodb.com |
| Upstash | https://console.upstash.com | https://upstash.com/docs | Status: https://status.upstash.com |
| Gmail | https://mail.google.com | https://support.google.com/mail | Status: https://www.google.com/appsstatus |
| ArcJet | https://app.arcjet.com | https://docs.arcjet.com | Status: https://status.arcjet.com |

---

## Contact & Support

- **GitHub Issues:** [report bugs](../../issues)
- **Documentation:** See [INTEGRATIONS_ANALYSIS.md](INTEGRATIONS_ANALYSIS.md)
- **Architecture:** See [ARCHITECTURE_DATAFLOW.md](ARCHITECTURE_DATAFLOW.md)

---

**Last Updated:** April 14, 2026
**Status:** ✅ Complete & Ready for Development
