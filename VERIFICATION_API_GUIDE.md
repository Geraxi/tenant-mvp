# ID Verification API Guide

## Overview

The verification system uses simple HTTP API calls that require authentication. Here's how to use them:

## Authentication

All API calls require authentication via Supabase session token. You need to include the Authorization header:

```
Authorization: Bearer <supabase_access_token>
```

## API Endpoints

### 1. Get Pending Verifications

**GET** `/api/admin/pending-verifications`

Returns all users who have uploaded ID documents and selfies but haven't been verified yet.

**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/pending-verifications \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN"
```

**Response:**
```json
[
  {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "idDocument": "https://storage.url/id-doc.jpg",
    "selfie": "https://storage.url/selfie.jpg",
    "verificationStatus": "pending",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  ...
]
```

### 2. Approve User Verification

**POST** `/api/admin/verify-user/:userId`

Approve a user's ID verification.

**Request:**
```bash
curl -X POST http://localhost:5000/api/admin/verify-user/user-123 \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "notes": "Documents verified successfully"
  }'
```

**Response:**
```json
{
  "message": "Verification approved",
  "user": {
    "id": "user-123",
    "verificationStatus": "approved",
    "verificationReviewedAt": "2024-01-15T11:00:00Z",
    "verificationNotes": "Documents verified successfully"
  }
}
```

### 3. Reject User Verification

**POST** `/api/admin/verify-user/:userId`

Reject a user's ID verification.

**Request:**
```bash
curl -X POST http://localhost:5000/api/admin/verify-user/user-123 \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "notes": "ID document is unclear, please resubmit"
  }'
```

**Response:**
```json
{
  "message": "Verification rejected",
  "user": {
    "id": "user-123",
    "verificationStatus": "rejected",
    "verificationReviewedAt": "2024-01-15T11:00:00Z",
    "verificationNotes": "ID document is unclear, please resubmit"
  }
}
```

## How to Get Your Supabase Token

### Option 1: From Browser Console (Easiest)

1. Open your app in the browser
2. Open Developer Console (F12)
3. Run this JavaScript:
```javascript
// Get current session token
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token);
```

### Option 2: From Network Tab

1. Open Developer Tools → Network tab
2. Make any authenticated request in your app
3. Look for the request headers
4. Copy the `Authorization: Bearer ...` token

## Using in JavaScript/TypeScript

### Fetch API Example

```javascript
// Get pending verifications
async function getPendingVerifications() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('/api/admin/pending-verifications', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  });
  
  const pendingUsers = await response.json();
  return pendingUsers;
}

// Approve verification
async function approveVerification(userId, notes = '') {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`/api/admin/verify-user/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'approved',
      notes: notes
    })
  });
  
  return await response.json();
}

// Reject verification
async function rejectVerification(userId, notes = '') {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`/api/admin/verify-user/${userId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'rejected',
      notes: notes
    })
  });
  
  return await response.json();
}
```

## Using in Postman/Insomnia

1. **Set Authorization Header:**
   - Type: Bearer Token
   - Token: Your Supabase access token

2. **For POST requests, set Body:**
   - Type: JSON
   - Content:
   ```json
   {
     "status": "approved",
     "notes": "Optional notes here"
   }
   ```

## Check User Verification Status

You can check a user's verification status by fetching their user data:

```javascript
const user = await api.getMe(); // or fetch('/api/auth/user')
console.log(user.verificationStatus); // 'pending', 'approved', or 'rejected'
```

## Status Values

- `"pending"` - User has uploaded documents, waiting for review
- `"approved"` - Admin has approved the verification
- `"rejected"` - Admin has rejected the verification (user may need to resubmit)

## Notes

- Currently, any authenticated user can review verifications (for simplicity)
- In production, you'd want to add proper admin role checking
- The verification status is automatically set to "pending" when both ID and selfie are uploaded

