# Auth0 Setup Guide

This guide will help you configure Auth0 authentication for the Black Lemon Dashboard.

## Prerequisites

1. An Auth0 account (sign up at https://auth0.com)
2. Node.js and npm installed
3. MySQL database running (via Docker or locally)

## Step 1: Create Auth0 Application

1. Go to https://manage.auth0.com
2. Navigate to **Applications** > **Applications**
3. Click **Create Application**
4. Choose **Regular Web Application**
5. Note down your:
   - Domain
   - Client ID
   - Client Secret

## Step 2: Configure Auth0 Application Settings

In your Auth0 application settings:

### Allowed Callback URLs

```
http://localhost:3000/api/auth/callback
https://yourdomain.com/api/auth/callback
```

### Allowed Logout URLs

```
http://localhost:3000
https://yourdomain.com
```

## Step 3: Create Environment Variables

Create a `.env.local` file in the root of your project:

```bash
# Auth0 Configuration
AUTH0_SECRET=LONG_RANDOM_VALUE_HERE
AUTH0_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN.auth0.com
AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET=YOUR_AUTH0_CLIENT_SECRET

# Database Configuration
DATABASE_URL=mysql://root:Password123@localhost:3306/dashboard
```

**Note**:

- `AUTH0_SECRET`: A long random string for session encryption
- `AUTH0_BASE_URL`: Your application's base URL (e.g., `http://localhost:3000` for development)
- `AUTH0_DOMAIN`: Your Auth0 domain (e.g., `yourapp.us.auth0.com`)
- Alternatively, you can use `AUTH0_ISSUER_BASE_URL=https://yourapp.us.auth0.com` instead of `AUTH0_DOMAIN`

### Generate AUTH0_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -hex 32
```

## Step 4: Configure Auth0 Actions (Email Domain Restriction)

To enforce the @obsidianagency.com email domain restriction:

1. Go to **Actions** > **Flows** in Auth0 Dashboard
2. Select **Login**
3. Click **Custom** > **Build Custom**
4. Name it "Email Domain Restriction"
5. Add this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const allowedDomain = "obsidianagency.com";
  const userEmail = event.user.email;

  if (!userEmail.endsWith(`@${allowedDomain}`)) {
    api.access.deny(
      `Access restricted to ${allowedDomain} email addresses only.`
    );
  }
};
```

6. Click **Deploy**
7. Drag the action into your Login flow
8. Click **Apply**

## Step 5: Run Database Migration

The Prisma schema has been updated with Auth0 fields. The migration has already been applied, but if you need to run it again:

```bash
npx prisma db push
```

## Step 6: Hash Existing Passwords

If you have existing users with plaintext passwords, run:

```bash
DATABASE_URL="mysql://root:Password123@localhost:3306/dashboard" npx tsx prisma/migrations/hash-passwords.ts
```

## Step 7: Start the Application

```bash
npm run dev
```

## How It Works

1. **Universal Login**: Users are redirected to Auth0's hosted login page
2. **Domain Validation**: Only @obsidianagency.com emails are allowed (enforced in Auth0 Action)
3. **User Sync**: After successful login, user profile is synced to Prisma database
4. **Session Management**: Auth0 handles session cookies and user authentication
5. **Protected Routes**: Middleware protects all routes except login, register, and public assets

## Features

- ✅ Auth0 Universal Login with email/password and social providers
- ✅ Email domain restriction (@obsidianagency.com)
- ✅ Automatic user sync to Prisma database
- ✅ Hashed passwords for existing users
- ✅ Session-based authentication
- ✅ Protected routes with middleware
- ✅ Legacy user migration support

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

Make sure you have `.env.local` file with the DATABASE_URL set, or use docker-compose.

### "Invalid email domain"

Check that your Auth0 Action is properly deployed and added to the Login flow.

### "Callback URL mismatch"

Ensure your Auth0 application's Allowed Callback URLs includes your application URL.

### Database connection issues

Verify MySQL is running:

```bash
docker-compose -f docker-compose.dev.yml up -d db
```

## Next Steps

1. Configure your Auth0 tenant branding
2. Set up social login providers (Google, GitHub, etc.)
3. Configure multi-factor authentication (MFA)
4. Set up custom email templates
5. Configure user roles and permissions
