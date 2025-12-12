import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  const isProduction = process.env.NODE_ENV === "production";
  
  // Require SESSION_SECRET in production
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
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        return res.status(401).json({ message: "Invalid token" });
      }

      let user = await storage.getUser(supabaseUser.id);
      
      if (!user) {
        await storage.upsertUser({
          id: supabaseUser.id,
          email: supabaseUser.email || null,
          firstName: supabaseUser.user_metadata?.first_name || null,
          lastName: supabaseUser.user_metadata?.last_name || null,
          profileImageUrl: supabaseUser.user_metadata?.avatar_url || null,
        });
        user = await storage.getUser(supabaseUser.id);
      }

      res.json(user);
    } catch (error: any) {
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

  // Image upload endpoint using Supabase Storage
  app.post("/api/upload/image", uploadLimiter, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(' ')[1];
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !supabaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { base64, fileName, contentType } = req.body;

      if (!base64 || !fileName) {
        return res.status(400).json({ message: "Missing base64 or fileName" });
      }

      // Convert base64 to buffer
      const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate unique file path
      const fileExt = fileName.split('.').pop() || 'jpg';
      const filePath = `users/${supabaseUser.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from('user-images')
        .upload(filePath, buffer, {
          contentType: contentType || 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Storage upload error:', error);
        return res.status(500).json({ message: error.message });
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('user-images')
        .getPublicUrl(filePath);

      res.json({ url: urlData.publicUrl });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Admin endpoint to delete a user (DEVELOPMENT ONLY - for testing/cleanup)
  app.delete("/api/auth/admin/user/:email", async (req, res) => {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Forbidden in production" });
    }
    
    try {
      const { email } = req.params;
      
      // Find user in Supabase
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        return res.status(500).json({ message: listError.message });
      }
      
      const supabaseUser = users.find(u => u.email === email);
      if (supabaseUser) {
        // Delete from Supabase
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
        if (deleteError) {
          console.error("Supabase delete error:", deleteError);
        }
        
        // Delete from our database
        await storage.deleteUser(supabaseUser.id);
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/signup", authLimiter, async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      await storage.upsertUser({
        id: data.user.id,
        email: data.user.email || null,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
      });

      const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

      if (signInError) {
        const { data: sessionData } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (sessionData.session) {
          return res.json({ 
            user: data.user,
            session: sessionData.session,
          });
        }
      }

      res.json({ 
        user: data.user,
        message: "Account created successfully. Please sign in.",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      claims: {
        sub: user.id,
        email: user.email,
      }
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
