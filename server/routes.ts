import type { Express, Request, Response } from "express";
import type { Server as HTTPServer } from "http";
import { setupAuth, isAuthenticated } from "./clerkAuth";
import { storage } from "./storage";
import { requireSupabaseAdmin } from "./supabaseAdmin";
import {
  insertPropertySchema,
  insertRoommateSchema,
  insertSwipeSchema,
  insertFavoriteSchema,
  insertMessageSchema,
  insertReportSchema,
  insertBlockSchema,
  type User,
} from "@shared/schema";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { pushService } from "./pushService";
import { randomUUID } from "crypto";
import { clerkClient } from "@clerk/express";

const clerkSecretKey = process.env.CLERK_SECRET_KEY || process.env.VITE_CLERK_SECRET_KEY;
const clerk = clerkSecretKey ? clerkClient : null;

async function resolveUserId(req: Request): Promise<string | null> {
  if ((req as any).user?.claims?.sub) {
    return (req as any).user.claims.sub;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ") && clerk) {
    const token = authHeader.split(" ")[1];
    try {
      const jwt = await clerk.verifyToken(token);
      return jwt.sub || null;
    } catch {
      return null;
    }
  }

  if (
    process.env.ALLOW_UNAUTHENTICATED_VERIFICATION_SUBMIT === "true" ||
    process.env.NODE_ENV !== "production"
  ) {
    return (req.body as any)?.userId || null;
  }

  return null;
}

export async function registerRoutes(
  server: HTTPServer,
  app: Express,
): Promise<void> {
  await setupAuth(app);

  // AUTH ROUTES
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/pending-signup", async (req: Request, res: Response) => {
    try {
      const { email, confirmationToken } = req.body as any;
      if (!email || !confirmationToken) {
        return res.status(400).json({ message: "Email and confirmation token are required" });
      }

      const supabaseAdmin = requireSupabaseAdmin();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabaseAdmin
        .from("email_verifications")
        .upsert(
          {
            email: String(email).toLowerCase(),
            token: confirmationToken,
            expires_at: expiresAt,
            verified_at: null,
          },
          { onConflict: "email" },
        );

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      const resendKey = process.env.RESEND_API_KEY;
      const resendFrom = process.env.RESEND_FROM;
      if (!resendKey || !resendFrom) {
        return res
          .status(500)
          .json({ message: "Email delivery is not configured (RESEND_API_KEY/RESEND_FROM)." });
      }

      const baseUrl = process.env.PUBLIC_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || "";
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${confirmationToken}`;

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [String(email).toLowerCase()],
          subject: "Conferma il tuo account - Tenant App",
          html: `
            <p>Ciao!</p>
            <p>Per completare la registrazione, conferma la tua email cliccando il link qui sotto:</p>
            <p><a href="${verificationUrl}">Conferma email</a></p>
            <p>Se il link non funziona, copia questo URL nel browser:</p>
            <p>${verificationUrl}</p>
            <p>Il link scadrà tra 24 ore.</p>
          `,
        }),
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        return res.status(502).json({ message: errorText || "Failed to send email" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create verification" });
    }
  });

  app.get("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const token = req.query.token as string | undefined;
      if (!token) {
        return res.status(400).send("Missing token");
      }

      const supabaseAdmin = requireSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from("email_verifications")
        .select("token, expires_at, verified_at")
        .eq("token", token)
        .single();

      if (error || !data) {
        return res.status(404).send("Invalid token");
      }

      if (data.verified_at) {
        return res.status(200).send("Email already verified. You can return to the app.");
      }

      if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        return res.status(410).send("Verification link expired.");
      }

      const { error: updateError } = await supabaseAdmin
        .from("email_verifications")
        .update({ verified_at: new Date().toISOString() })
        .eq("token", token);

      if (updateError) {
        return res.status(500).send("Failed to verify email");
      }

      res.status(200).send("Email verified. You can return to the app.");
    } catch (error: any) {
      res.status(500).send(error.message || "Verification failed");
    }
  });

  app.get("/api/auth/verification-status", async (req: Request, res: Response) => {
    try {
      const token = req.query.token as string | undefined;
      if (!token) {
        return res.status(400).json({ message: "Missing token" });
      }

      const supabaseAdmin = requireSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from("email_verifications")
        .select("verified_at, expires_at")
        .eq("token", token)
        .single();

      if (error || !data) {
        return res.status(404).json({ message: "Invalid token" });
      }

      if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
        return res.status(410).json({ message: "Verification link expired" });
      }

      res.json({ verified: !!data.verified_at });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Verification check failed" });
    }
  });

  // USER ROUTES
  app.patch("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.sub !== req.params.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ADMIN: Review ID verification (simple - any authenticated user can review for now)
  // In production, you'd add proper admin role checking
  app.post("/api/admin/verify-user/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { status, notes } = req.body; // status: 'approved' or 'rejected'
      
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }

      const user = await storage.updateUser(req.params.id, {
        verificationStatus: status,
        verificationReviewedAt: new Date(),
        verificationNotes: notes || null,
      } as any);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: `Verification ${status}`, user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get users pending verification (for admin review)
  app.get("/api/admin/pending-verifications", isAuthenticated, async (req: any, res) => {
    try {
      // Get all users with pending verification
      const allUsers = await storage.getAllUsers();
      const pendingUsers = allUsers.filter((u: any) => 
        u.verificationStatus === 'pending' && (u.idDocument || u.selfie)
      );
      
      res.json(pendingUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/verification/submit", async (req: Request, res: Response) => {
    try {
      const userId = await resolveUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const {
        documentType,
        documentFrontPath,
        documentBackPath,
        selfiePath,
        documentNumber,
        expiryDate,
      } = req.body as any;

      if (!documentType || !documentFrontPath || !selfiePath) {
        return res.status(400).json({ message: "Missing required verification fields" });
      }

      const supabaseAdmin = requireSupabaseAdmin();

      const { data, error } = await supabaseAdmin
        .from("verification_documents")
        .insert({
          user_id: userId,
          document_type: documentType,
          document_front_url: documentFrontPath,
          document_back_url: documentBackPath,
          selfie_url: selfiePath,
          document_number: documentNumber || null,
          expiry_date: expiryDate || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      const { error: updateError } = await supabaseAdmin
        .from("utenti")
        .update({
          verification_pending: true,
          verification_submitted_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.warn("Failed to update utenti verification status:", updateError.message);
      }

      res.json({ success: true, documentId: data.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Verification submission failed" });
    }
  });

  app.get("/api/verification/status", async (req: Request, res: Response) => {
    try {
      const userId = await resolveUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const supabaseAdmin = requireSupabaseAdmin();
      const { data, error } = await supabaseAdmin
        .from("verification_documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        return res.status(404).json({ message: error.message });
      }

      const bucket = "verification-documents";
      const createSignedUrl = async (path?: string | null) => {
        if (!path) return null;
        const signed = await supabaseAdmin.storage
          .from(bucket)
          .createSignedUrl(path, 60 * 10);
        if (signed.error) {
          throw new Error(signed.error.message);
        }
        return signed.data?.signedUrl || null;
      };

      const [documentFrontUrl, documentBackUrl, selfieUrl] = await Promise.all([
        createSignedUrl(data.document_front_url),
        createSignedUrl(data.document_back_url),
        createSignedUrl(data.selfie_url),
      ]);

      res.json({
        ...data,
        document_front_url: documentFrontUrl,
        document_back_url: documentBackUrl,
        selfie_url: selfieUrl,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch verification status" });
    }
  });

  app.post("/api/verification/prepare", async (req: Request, res: Response) => {
    try {
      const userId = await resolveUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const {
        documentFront,
        documentBack,
        selfie,
      } = req.body as any;

      if (!documentFront?.fileName || !documentFront?.contentType || !selfie?.fileName || !selfie?.contentType) {
        return res.status(400).json({ message: "Missing required file metadata" });
      }

      const supabaseAdmin = requireSupabaseAdmin();
      const bucket = "verification-documents";
      const expiresIn = 60 * 5;

      const buildPath = (fileName: string, folder: string) => {
        const extension = fileName.includes(".") ? fileName.split(".").pop() : "jpg";
        const safeBase = fileName
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_");
        return `${userId}/${folder}/${Date.now()}-${safeBase}-${randomUUID()}.${extension}`;
      };

      const documentFrontPath = buildPath(documentFront.fileName, "documents");
      const selfiePath = buildPath(selfie.fileName, "selfies");
      const documentBackPath = documentBack?.fileName ? buildPath(documentBack.fileName, "documents") : null;

      const [frontSigned, selfieSigned, backSigned] = await Promise.all([
        supabaseAdmin.storage.from(bucket).createSignedUploadUrl(documentFrontPath, expiresIn),
        supabaseAdmin.storage.from(bucket).createSignedUploadUrl(selfiePath, expiresIn),
        documentBackPath
          ? supabaseAdmin.storage.from(bucket).createSignedUploadUrl(documentBackPath, expiresIn)
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (frontSigned.error) {
        return res.status(500).json({ message: frontSigned.error.message });
      }
      if (selfieSigned.error) {
        return res.status(500).json({ message: selfieSigned.error.message });
      }
      if (backSigned.error) {
        return res.status(500).json({ message: backSigned.error.message });
      }
      if (!frontSigned.data?.signedUrl || !selfieSigned.data?.signedUrl) {
        return res.status(500).json({ message: "Signed upload URL unavailable" });
      }

      res.json({
        documentFront: {
          path: documentFrontPath,
          signedUrl: frontSigned.data?.signedUrl || null,
        },
        documentBack: documentBackPath
          ? { path: documentBackPath, signedUrl: backSigned.data?.signedUrl || null }
          : null,
        selfie: {
          path: selfiePath,
          signedUrl: selfieSigned.data?.signedUrl || null,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to prepare upload" });
    }
  });

  // PROPERTY ROUTES
  app.get("/api/properties", isAuthenticated, async (req: any, res) => {
    try {
      const properties = await storage.getPropertiesForTenant(req.user.claims.sub);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/properties/:id", isAuthenticated, async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/landlord/properties", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'landlord') {
        return res.status(403).json({ message: "Forbidden" });
      }
      const properties = await storage.getPropertiesByLandlord(req.user.claims.sub);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/properties", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'landlord') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const result = insertPropertySchema.safeParse({
        ...req.body,
        landlordId: req.user.claims.sub,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid property data", errors: result.error });
      }

      const property = await storage.createProperty(result.data);
      res.json(property);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.landlordId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updated = await storage.updateProperty(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.landlordId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteProperty(req.params.id);
      res.json({ message: "Property deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ROOMMATE ROUTES
  app.get("/api/roommates", isAuthenticated, async (req: any, res) => {
    try {
      const roommates = await storage.getRoommatesForTenant(req.user.claims.sub);
      res.json(roommates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/roommates/:id", isAuthenticated, async (req, res) => {
    try {
      const roommate = await storage.getRoommate(req.params.id);
      if (!roommate) {
        return res.status(404).json({ message: "Roommate not found" });
      }
      res.json(roommate);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/roommates", isAuthenticated, async (req: any, res) => {
    try {
      const result = insertRoommateSchema.safeParse({
        ...req.body,
        userId: req.user.claims.sub,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid roommate data", errors: result.error });
      }

      const roommate = await storage.createRoommate(result.data);
      res.json(roommate);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // SWIPE ROUTES
  app.post("/api/swipes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // Check if we need to reset daily swipe count (for non-premium users)
      const FREE_SWIPE_LIMIT = 10;
      if (user && !user.isPremium) {
        const lastReset = user.lastSwipeReset ? new Date(user.lastSwipeReset) : new Date(0);
        const now = new Date();
        const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
        
        // Reset swipe count if it's a new day
        if (daysSinceReset >= 1) {
          await storage.updateUser(userId, { swipeCount: 0, lastSwipeReset: now });
          user = { ...user, swipeCount: 0, lastSwipeReset: now };
        }
        
        // Check swipe limit for non-premium users (10 free swipes per day)
        if ((user.swipeCount || 0) >= FREE_SWIPE_LIMIT) {
          return res.status(403).json({ 
            message: "Daily swipe limit reached", 
            code: "SWIPE_LIMIT_REACHED",
            swipeCount: user.swipeCount,
            resetsAt: new Date(lastReset.getTime() + 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      const result = insertSwipeSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid swipe data", errors: result.error });
      }

      const swipe = await storage.createSwipe(result.data);
      
      // Increment swipe count for non-premium users
      if (user && !user.isPremium) {
        await storage.updateUser(userId, { swipeCount: (user.swipeCount || 0) + 1 });
      }

      if (result.data.action === 'like' && result.data.targetType === 'roommate') {
        const roommate = await storage.getRoommate(result.data.targetId);
        if (roommate) {
          const reverseSwipe = await storage.getSwipe(roommate.userId, req.user.claims.sub, 'roommate');
          if (reverseSwipe && reverseSwipe.action === 'like') {
            const existingMatch = await storage.checkExistingMatch(req.user.claims.sub, roommate.userId);
            if (!existingMatch) {
              await storage.createMatch({
                user1Id: req.user.claims.sub,
                user2Id: roommate.userId,
                relatedType: 'roommate',
                relatedId: result.data.targetId,
              });
              
              const currentUser = await storage.getUser(req.user.claims.sub);
              const otherUser = await storage.getUser(roommate.userId);
              if (otherUser) {
                pushService.notifyNewMatch(roommate.userId, currentUser?.firstName || 'Someone').catch(console.error);
              }
              if (currentUser) {
                pushService.notifyNewMatch(req.user.claims.sub, otherUser?.firstName || 'Someone').catch(console.error);
              }
              
              return res.json({ ...swipe, matched: true });
            }
          }
        }
      }

      res.json({ ...swipe, matched: false });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // MATCH ROUTES
  app.get("/api/matches", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getUserMatches(userId);
      
      const matchesWithOtherUser = await Promise.all(matches.map(async (match) => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        const otherUser: User | undefined = await storage.getUser(otherUserId);
        return {
          ...match,
          otherUserId,
          otherUser: otherUser ? {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            profileImageUrl: (otherUser as User)['profileImageUrl'] || null,
          } : null,
        };
      }));
      
      res.json(matchesWithOtherUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/matches/:matchId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const match = await storage.getMatch(req.params.matchId);
      
      if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      const otherUser: User | undefined = await storage.getUser(otherUserId);
      
      res.json({
        ...match,
        otherUserId,
        otherUser: otherUser ? {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          profileImageUrl: (otherUser as User)['profileImageUrl'] || null,
        } : null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // FAVORITE ROUTES
  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.user.claims.sub);
      
      const propertiesPromises = favorites.map(f => storage.getProperty(f.propertyId));
      const properties = await Promise.all(propertiesPromises);
      
      res.json(properties.filter(p => p !== undefined));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const result = insertFavoriteSchema.safeParse({
        ...req.body,
        userId: req.user.claims.sub,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid favorite data", errors: result.error });
      }

      const favorite = await storage.addFavorite(result.data);
      res.json(favorite);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/favorites/:propertyId", isAuthenticated, async (req: any, res) => {
    try {
      await storage.removeFavorite(req.user.claims.sub, req.params.propertyId);
      res.json({ message: "Favorite removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/favorites/:propertyId/check", isAuthenticated, async (req: any, res) => {
    try {
      const isFavorited = await storage.isFavorited(req.user.claims.sub, req.params.propertyId);
      res.json({ isFavorited });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // CHAT/MESSAGE ROUTES
  app.get("/api/matches/:matchId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const match = await storage.getMatch(req.params.matchId);
      
      if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      const isBlocked = await storage.isBlocked(otherUserId, userId);
      const hasBlocked = await storage.isBlocked(userId, otherUserId);
      
      if (isBlocked || hasBlocked) {
        return res.status(403).json({ message: "Cannot access messages with blocked user" });
      }

      const messages = await storage.getMatchMessages(req.params.matchId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/matches/:matchId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const match = await storage.getMatch(req.params.matchId);
      
      if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      const isBlocked = await storage.isBlocked(otherUserId, userId);
      const hasBlocked = await storage.isBlocked(userId, otherUserId);
      
      if (isBlocked || hasBlocked) {
        return res.status(403).json({ message: "Cannot send messages to this user" });
      }

      const result = insertMessageSchema.safeParse({
        matchId: req.params.matchId,
        senderId: userId,
        content: req.body.content,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid message", errors: result.error });
      }

      const message = await storage.createMessage(result.data);
      
      const sender = await storage.getUser(userId);
      pushService.notifyNewMessage(otherUserId, sender?.firstName || 'Someone', req.params.matchId).catch(console.error);
      
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/messages/:messageId/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageId = req.params.messageId;
      
      const existingMessage = await storage.getMessage(messageId);
      if (!existingMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      const match = await storage.getMatch(existingMessage.matchId);
      if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const message = await storage.markMessageAsRead(messageId);
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const count = await storage.getUnreadCount(req.user.claims.sub);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // REPORT ROUTES
  app.post("/api/reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reportedUserId = req.body.reportedUserId;
      
      if (userId === reportedUserId) {
        return res.status(400).json({ message: "Cannot report yourself" });
      }

      const result = insertReportSchema.safeParse({
        reporterId: userId,
        reportedUserId,
        reason: req.body.reason,
        description: req.body.description,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid report", errors: result.error });
      }

      const report = await storage.createReport(result.data);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // BLOCK ROUTES
  app.post("/api/blocks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blockedId = req.body.blockedId;
      
      if (userId === blockedId) {
        return res.status(400).json({ message: "Cannot block yourself" });
      }
      
      const alreadyBlocked = await storage.isBlocked(userId, blockedId);
      if (alreadyBlocked) {
        return res.status(400).json({ message: "User already blocked" });
      }

      const result = insertBlockSchema.safeParse({
        blockerId: userId,
        blockedId,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid block", errors: result.error });
      }

      const block = await storage.createBlock(result.data);
      res.json(block);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/blocks/:blockedId", isAuthenticated, async (req: any, res) => {
    try {
      await storage.removeBlock(req.user.claims.sub, req.params.blockedId);
      res.json({ message: "Unblocked" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blocks", isAuthenticated, async (req: any, res) => {
    try {
      const blocks = await storage.getUserBlocks(req.user.claims.sub);
      res.json(blocks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // STRIPE ROUTES
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/stripe/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { priceId } = req.body;
      if (!priceId) {
        return res.status(400).json({ message: "Price ID required" });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(user.email || "", userId);
        await storage.updateUser(userId, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${baseUrl}/${user.role}?checkout=success`,
        `${baseUrl}/${user.role}?checkout=cancelled`
      );

      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/stripe/portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No subscription found" });
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      const session = await stripeService.createCustomerPortalSession(
        user.stripeCustomerId,
        `${baseUrl}/${user.role}/profile`
      );

      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      res.json({ 
        isPremium: user?.isPremium || false,
        premiumUntil: user?.premiumUntil,
        subscriptionId: user?.stripeSubscriptionId
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PUSH NOTIFICATION ROUTES
  app.get("/api/push/vapid-key", (req, res) => {
    const publicKey = pushService.getPublicKey();
    if (publicKey) {
      res.json({ publicKey });
    } else {
      res.status(503).json({ message: "Push notifications not configured" });
    }
  });

  app.post("/api/push/subscribe", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { endpoint, p256dh, auth } = req.body;

      if (!endpoint || !p256dh || !auth) {
        return res.status(400).json({ message: "Invalid subscription data" });
      }

      const existing = await storage.getPushSubscriptionByEndpoint(endpoint);
      if (existing) {
        return res.json({ message: "Already subscribed" });
      }

      const subscription = await storage.createPushSubscription({
        userId,
        endpoint,
        p256dh,
        auth,
      });

      res.json({ message: "Subscribed", id: subscription.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/push/unsubscribe", isAuthenticated, async (req: any, res) => {
    try {
      const { endpoint } = req.body;
      
      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint required" });
      }

      const subscription = await storage.getPushSubscriptionByEndpoint(endpoint);
      if (subscription) {
        await storage.deletePushSubscription(subscription.id);
      }

      res.json({ message: "Unsubscribed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/push/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await pushService.sendNotification(userId, {
        title: 'Test Notification',
        body: 'Push notifications are working!',
        url: '/',
      });
      res.json({ message: "Test notification sent" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
