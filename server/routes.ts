import type { Express, Request, Response } from "express";
import type { Server as HTTPServer } from "http";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { storage } from "./storage";
import {
  insertPropertySchema,
  insertRoommateSchema,
  insertSwipeSchema,
  insertFavoriteSchema,
} from "@shared/schema";

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
      const user = await storage.getUser(userId);
      
      // Check swipe limit for non-premium users
      const FREE_SWIPE_LIMIT = 10;
      if (user && !user.isPremium && (user.swipeCount || 0) >= FREE_SWIPE_LIMIT) {
        return res.status(403).json({ 
          message: "Swipe limit reached", 
          code: "SWIPE_LIMIT_REACHED",
          swipeCount: user.swipeCount 
        });
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
      const matches = await storage.getUserMatches(req.user.claims.sub);
      res.json(matches);
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
}
