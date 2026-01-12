import { clerkClient, getAuth } from '@clerk/express';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";

// Get Clerk secret key from environment
const clerkSecretKey = process.env.CLERK_SECRET_KEY || process.env.VITE_CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  console.error("Missing CLERK_SECRET_KEY. Please set CLERK_SECRET_KEY environment variable.");
}

// Initialize Clerk client
let clerk: ReturnType<typeof clerkClient> | null = null;
if (clerkSecretKey) {
  clerk = clerkClient(clerkSecretKey);
}

// Rate limiters for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 uploads per minute
  message: { message: "Too many uploads, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions',
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const sessionSecret = process.env.SESSION_SECRET;

  if (isProduction && !sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }
  
  return session({
    secret: sessionSecret || 'dev-only-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "lax" : "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Clerk middleware will be applied per-route using requireAuth
  // We don't apply it globally to avoid interfering with public routes

  app.get("/api/auth/callback", async (req, res) => {
    res.redirect("/");
  });

  app.get("/api/auth/user", async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(' ')[1];
      
      // Verify token with Clerk
      if (!clerk) {
        return res.status(500).json({ message: "Clerk not configured" });
      }

      let clerkUser;
      try {
        clerkUser = await clerk.verifyToken(token);
      } catch (error: any) {
        console.error('Clerk token verification error:', error);
        return res.status(401).json({ message: "Invalid token" });
      }

      if (!clerkUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Get user from Clerk
      const userId = clerkUser.sub; // Clerk uses 'sub' for user ID
      let user;
      
      try {
        user = await storage.getUser(userId);
        
        if (!user) {
          try {
            // Create user in database from Clerk data (already fetched above)
            await storage.upsertUser({
              id: userId,
              email: clerkUserData.emailAddresses[0]?.emailAddress || null,
              firstName: clerkUserData.firstName || null,
              lastName: clerkUserData.lastName || null,
              profileImageUrl: clerkUserData.imageUrl || null,
            });
            user = await storage.getUser(userId);
          } catch (dbError: any) {
            // Database connection failed - return minimal user object
            if (dbError?.code !== 'ENOTFOUND') {
              console.warn("Database connection failed, returning minimal user object");
            }
            // Use already fetched clerkUserData
            user = {
              id: userId,
              email: clerkUserData.emailAddresses[0]?.emailAddress || null,
              firstName: clerkUserData.firstName || null,
              lastName: clerkUserData.lastName || null,
              name: clerkUserData.firstName && clerkUserData.lastName
                ? `${clerkUserData.firstName} ${clerkUserData.lastName}`
                : clerkUserData.emailAddresses[0]?.emailAddress?.split('@')[0] || null,
              profileImageUrl: clerkUserData.imageUrl || null,
              role: null, // Will need to be set in onboarding
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        }
      } catch (dbError: any) {
        // Database connection failed - return minimal user object
        if (dbError?.code !== 'ENOTFOUND') {
          console.warn("Database connection failed, returning minimal user object");
        }
        // Use already fetched clerkUserData
        user = {
          id: userId,
          email: clerkUserData.emailAddresses[0]?.emailAddress || null,
          firstName: clerkUserData.firstName || null,
          lastName: clerkUserData.lastName || null,
          name: clerkUserData.firstName && clerkUserData.lastName
            ? `${clerkUserData.firstName} ${clerkUserData.lastName}`
            : clerkUserData.emailAddresses[0]?.emailAddress?.split('@')[0] || null,
          profileImageUrl: clerkUserData.imageUrl || null,
          role: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      res.json(user);
    } catch (error: any) {
      // Don't log database connection errors to avoid showing technical details to users
      if (error?.code === 'ENOTFOUND' || error?.message?.includes('getaddrinfo')) {
        // Try to return minimal user from Clerk
        try {
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ') && clerk) {
            const token = authHeader.split(' ')[1];
            try {
              const jwt = await clerk.verifyToken(token);
              const userId = jwt.sub;
              const clerkUserData = await clerk.users.getUser(userId);
              return res.json({
                id: userId,
                email: clerkUserData.emailAddresses[0]?.emailAddress || null,
                firstName: clerkUserData.firstName || null,
                lastName: clerkUserData.lastName || null,
                name: clerkUserData.firstName && clerkUserData.lastName
                  ? `${clerkUserData.firstName} ${clerkUserData.lastName}`
                  : clerkUserData.emailAddresses[0]?.emailAddress?.split('@')[0] || null,
                profileImageUrl: clerkUserData.imageUrl || null,
                role: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            } catch (tokenError) {
              // Token invalid, continue to error response
            }
          }
        } catch (fallbackError) {
          // Ignore fallback errors
        }
      }
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.json({ message: "Logged out" });
    });
  });

  // Remove the old Supabase signup endpoint - Clerk handles signup
  // But keep it for backward compatibility during migration
  app.post("/api/auth/signup", authLimiter, async (req, res) => {
    // Clerk handles signup on the frontend
    // This endpoint is no longer needed but kept for compatibility
    res.status(200).json({ message: "Signup handled by Clerk" });
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  // Clerk middleware already verifies the token
  // The user info is available in req.auth
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Attach user info to request for easy access
  req.user = {
    id: req.auth.userId,
    claims: {
      sub: req.auth.userId,
    },
  };
  
  next();
}

