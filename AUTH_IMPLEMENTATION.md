# JWT Authentication Implementation

This document describes the JWT authentication system that has been implemented for the Black Lemon Dashboard.

## Overview

A complete JWT-based authentication system with the following features:
- User login with email/password
- Secure password verification using bcrypt
- JWT token generation and validation
- httpOnly cookies for token storage (XSS protection)
- Route protection middleware
- Automatic redirect to login for unauthenticated users

## Files Created/Modified

### New Files Created

1. **`lib/jwt.ts`** - JWT utility functions
   - `signToken()` - Generate JWT tokens with 7-day expiration
   - `verifyToken()` - Verify and decode JWT tokens

2. **`lib/password.ts`** - Password hashing utilities
   - `hashPassword()` - Hash passwords with bcrypt (10 salt rounds)
   - `verifyPassword()` - Verify passwords against hashes

3. **`lib/prisma.ts`** - Prisma client singleton
   - Prevents multiple database connections
   - Uses generated Prisma client from `app/generated/prisma`

4. **`types/auth.ts`** - TypeScript type definitions
   - `LoginRequest` - Login endpoint request body
   - `LoginResponse` - Login endpoint response
   - `AuthUser` - User data structure (without password)

5. **`app/api/auth/login/route.ts`** - Login API endpoint
   - POST endpoint for authentication
   - Validates credentials
   - Returns httpOnly cookie with JWT token

6. **`app/api/auth/logout/route.ts`** - Logout API endpoint
   - POST endpoint to clear authentication
   - Removes auth-token cookie

7. **`proxy.ts`** - Route protection proxy (formerly middleware.ts)
   - Validates JWT on every request
   - Redirects to `/login` if token is missing/invalid
   - Protects all routes except login/register and static assets

### Modified Files

8. **`components/LoginForm.tsx`** - Updated login form
   - Added state management (email, password, error, loading)
   - Form submission handler with API integration
   - Error display
   - Loading states

## Required Environment Variables

Create a `.env` file in the root directory:

```env
# Database connection (if not already set)
DATABASE_URL="mysql://user:password@localhost:3306/database"

# JWT Secret - REQUIRED for authentication
JWT_SECRET=your-secure-random-secret-min-32-chars
```

### Generating a Secure JWT_SECRET

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -base64 32
```

⚠️ **IMPORTANT**: 
- Never commit `.env` to version control
- Use different secrets for development and production
- Minimum 32 characters recommended

## How It Works

### 1. Login Flow

```
User enters credentials → LoginForm component
    ↓
POST /api/auth/login
    ↓
Verify user exists in database
    ↓
Verify password with bcrypt
    ↓
Generate JWT token (7 days expiration)
    ↓
Set httpOnly cookie
    ↓
Return user data (without password)
    ↓
Redirect to /dashboard
```

### 2. Protected Route Access

```
User requests protected route
    ↓
Proxy intercepts request
    ↓
Check for auth-token cookie
    ↓
Verify JWT token
    ↓
Valid? → Allow access
Invalid/Missing? → Redirect to /login
```

### 3. Logout Flow

```
User clicks logout
    ↓
POST /api/auth/logout
    ↓
Clear auth-token cookie (maxAge: 0)
    ↓
Redirect to /login
```

## Security Features

1. **httpOnly Cookies**
   - JavaScript cannot access the token
   - Prevents XSS attacks

2. **Secure Flag**
   - Cookies only sent over HTTPS in production
   - Prevents man-in-the-middle attacks

3. **SameSite: 'lax'**
   - CSRF protection
   - Cookie only sent with same-site requests

4. **bcrypt Password Hashing**
   - Industry-standard algorithm
   - 10 salt rounds (2^10 = 1024 iterations)
   - Prevents rainbow table attacks

5. **JWT Expiration**
   - 7-day token lifetime
   - Forces periodic re-authentication

6. **Password Field Exclusion**
   - Password hash never sent to client
   - Only user data returned in responses

## Protected Routes

The proxy protects **all routes** except:
- `/login` - Login page
- `/register` - Registration page (if exists)
- `/api/auth/*` - Authentication API endpoints
- `/_next/static/*` - Next.js static files
- `/_next/image/*` - Next.js image optimization
- `/favicon.ico` - Favicon

## API Endpoints

### POST /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "role": "user-role"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

### POST /api/auth/logout

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

## Testing the Implementation

1. **Setup Database**: Ensure your database has users with bcrypt-hashed passwords
2. **Add JWT_SECRET**: Create `.env` file with JWT_SECRET
3. **Start Development Server**: `npm run dev`
4. **Test Login**: Navigate to `/login` and enter credentials
5. **Test Protection**: Try accessing `/dashboard` without logging in
6. **Test Logout**: Call `/api/auth/logout` endpoint

## Next Steps / Optional Enhancements

- [ ] Add password reset functionality
- [ ] Implement refresh tokens for better security
- [ ] Add rate limiting to prevent brute force attacks
- [ ] Add user registration endpoint
- [ ] Implement role-based access control (RBAC)
- [ ] Add session management (view active sessions)
- [ ] Add two-factor authentication (2FA)
- [ ] Add password strength requirements
- [ ] Implement account lockout after failed attempts
- [ ] Add audit logging for authentication events

## Troubleshooting

**Issue**: "JWT_SECRET is not defined"
- **Solution**: Create `.env` file with `JWT_SECRET` variable

**Issue**: Login fails with "Invalid credentials"
- **Solution**: Ensure passwords in database are bcrypt-hashed

**Issue**: Redirect loop to /login
- **Solution**: Check that JWT_SECRET matches between token generation and verification

**Issue**: Proxy not running
- **Solution**: Ensure `proxy.ts` is in the root directory (same level as `app/`)

**Note**: Next.js has deprecated `middleware.ts` in favor of `proxy.ts`. This implementation uses the new convention.

## Dependencies Installed

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "cookie": "^0.6.x"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.x",
    "@types/bcrypt": "^5.x",
    "@types/cookie": "^0.6.x"
  }
}
```

## Database Schema

The implementation uses the existing `User` model from `prisma/schema.prisma`:

```prisma
model User {
  id        String @id @default(cuid())
  username  String
  password  String  // Should be bcrypt-hashed
  email     String
  role      String
  createdAt Int
  updatedAt Int
  reports   Report[]
}
```

**Note**: Ensure passwords are hashed using the `hashPassword()` function before storing in the database.

