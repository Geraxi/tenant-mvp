# Tenant - Bilingual Rental App

## Overview

Tenant is a Tinder-style bilingual (English/Italian) rental application that connects tenants looking for homes with landlords offering properties. The app features a swipe-based interface for browsing properties and roommates, with matching functionality similar to dating apps.

**Core Features:**
- Dual-role system: Users can be tenants (searching for homes/roommates) or landlords (listing properties)
- Swipe-based discovery for properties and tenant profiles
- Favorites and matching system
- Bilingual support (English/Italian)
- Mobile-first design with iOS-style interface framing

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript using Vite as the build tool
- **Routing:** Wouter for lightweight client-side routing
- **State Management:** TanStack React Query for server state management
- **UI Components:** shadcn/ui component library with Radix UI primitives
- **Styling:** Tailwind CSS v4 with custom theme variables
- **Animations:** Framer Motion for swipe gestures and transitions
- **Carousel:** Embla Carousel for image galleries

The frontend is organized as a mobile-first SPA with a simulated phone frame for desktop viewing. Protected routes enforce authentication and role-based access.

### Backend Architecture
- **Runtime:** Node.js with Express
- **Language:** TypeScript compiled with tsx for development and esbuild for production
- **API Design:** RESTful endpoints under `/api/*`
- **Authentication:** Replit OpenID Connect (OIDC) with Passport.js
- **Session Management:** Express sessions stored in PostgreSQL via connect-pg-simple

The server handles authentication, user management, property/roommate CRUD operations, swipe actions, matches, and favorites.

### Data Storage
- **Database:** PostgreSQL with Drizzle ORM
- **Schema Location:** `shared/schema.ts` contains all table definitions
- **Migrations:** Managed via `drizzle-kit push`
- **Key Tables:**
  - `users` - User profiles with role (tenant/landlord), includes stripeCustomerId and stripeSubscriptionId for payments
  - `properties` - Rental property listings
  - `roommates` - Tenant profiles seeking roommates
  - `swipes` - User swipe actions (like/skip)
  - `matches` - Mutual matches between users
  - `favorites` - Saved properties
  - `messages` - Chat messages between matched users
  - `reports` - User reports for content moderation
  - `blocks` - Blocked users list
  - `sessions` - Authentication session storage

### Authentication Flow
1. User initiates login via Replit OIDC
2. On successful auth, user is redirected to onboarding if no role is set
3. Role selection (tenant/landlord) determines app experience
4. Session persists via PostgreSQL-backed session store

### Build System
- Development: Vite dev server with HMR for client, tsx for server
- Production: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Client serves from Express static middleware in production

## External Dependencies

### Database
- **PostgreSQL** - Primary data store, connection via `DATABASE_URL` environment variable

### Authentication
- **Replit OIDC** - OpenID Connect provider for user authentication
- **Environment Variables Required:**
  - `DATABASE_URL` - PostgreSQL connection string
  - `SESSION_SECRET` - Session encryption key
  - `REPL_ID` - Replit environment identifier
  - `ISSUER_URL` - OIDC issuer (defaults to Replit)

### Third-Party Libraries
- **openid-client** - OIDC client implementation
- **passport** / **passport-local** - Authentication middleware
- **drizzle-orm** / **drizzle-zod** - Database ORM and schema validation
- **framer-motion** - Animation library for swipe gestures
- **embla-carousel-react** - Touch-friendly carousels
- **date-fns** - Date formatting utilities

### Replit-Specific Integrations
- `@replit/vite-plugin-runtime-error-modal` - Error overlay in development
- `@replit/vite-plugin-cartographer` - Development tooling
- `@replit/vite-plugin-dev-banner` - Development environment indicator

### Payment Processing
- **Stripe** - Subscription payments for Premium features
- **Pricing:**
  - Monthly: €12.99/month
  - Yearly: €95.88/year (€7.99/month equivalent)
- **Environment Variables:**
  - `VITE_STRIPE_MONTHLY_PRICE_ID` - Stripe monthly price ID
  - `VITE_STRIPE_YEARLY_PRICE_ID` - Stripe yearly price ID

## Premium Features
- **Free Users:** 10 swipes per day, resets daily
- **Premium Users:** Unlimited swipes, see who liked you, priority views, unlimited messages

## Chat System
- Real-time messaging between matched users
- Block checking prevents messaging blocked users
- Read receipts for messages

## Content Moderation
- Report users with reason and description
- Block/unblock users
- Blocked users cannot send messages or view each other's profiles

## Push Notifications
- Web Push API implementation using VAPID keys
- Service worker handles push events and notification display
- Notifications sent on:
  - New matches (both users notified)
  - New messages (recipient notified)
- Subscribe/unsubscribe endpoints for managing device subscriptions
- Environment Variables:
  - `VAPID_PUBLIC_KEY` - Public VAPID key for push
  - `VAPID_PRIVATE_KEY` - Private VAPID key (secret)
  - `VITE_VAPID_PUBLIC_KEY` - Public key for frontend