import type { Express, Request, Response } from "express";
import type { Server as HTTPServer } from "http";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { storage } from "./storage";
import {
  insertPropertySchema,
  insertRoommateSchema,
  insertSwipeSchema,
  insertFavoriteSchema,
  insertMessageSchema,
  insertReportSchema,
  insertBlockSchema,
} from "@shared/schema";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";

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
        const otherUser = await storage.getUser(otherUserId);
        return {
          ...match,
          otherUserId,
          otherUser: otherUser ? {
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            profilePhoto: otherUser.profilePhoto,
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
      const otherUser = await storage.getUser(otherUserId);
      
      res.json({
        ...match,
        otherUserId,
        otherUser: otherUser ? {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          profilePhoto: otherUser.profilePhoto,
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
}
