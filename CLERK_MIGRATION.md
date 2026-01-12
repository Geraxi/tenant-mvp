# Clerk Migration Guide

## Environment Variables

Add these to your `.env` file:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2FyaW5nLWJhcm5hY2xlLTc0LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_aXrMDACF8LwVNk6gg5L5bl50OpymO1q4CE7LOY1BcR
```

## What Changed

### Frontend
- ✅ Installed `@clerk/clerk-react`
- ✅ Wrapped App with `ClerkProvider`
- ✅ Replaced `useAuth` hook to use Clerk
- ✅ Updated `Auth.tsx` to use Clerk signup/login
- ✅ Updated `OnboardingGate` to use Clerk
- ✅ Updated `RoleSelection` to use Clerk
- ✅ Updated `storage.web.ts` to get user ID from Clerk

### Backend
- ✅ Installed `@clerk/express`
- ✅ Created `server/clerkAuth.ts` to replace `supabaseAuth.ts`
- ✅ Updated `server/routes.ts` to import from `clerkAuth`
- ✅ Updated `/api/auth/user` endpoint to verify Clerk tokens
- ✅ Updated `isAuthenticated` middleware to use Clerk

## Next Steps

1. **Add environment variables** to `.env` file
2. **Test signup/login** - Create a new account and verify it works
3. **Remove Supabase dependencies** (optional, after testing):
   - Can remove `@supabase/supabase-js` from package.json
   - Can delete `server/supabaseAuth.ts` (backed up as `server/supabaseAuth_BACKUP.ts`)

## Notes

- Clerk handles signup/login on the frontend
- Backend verifies Clerk JWT tokens
- User data is still stored in your PostgreSQL database
- Onboarding flow remains the same




