import type { Express, Request, Response } from "express";
import type { Server as HTTPServer } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import passport from "passport";
import {
  insertUserSchema,
  insertPropertySchema,
  insertRoommateSchema,
  insertSwipeSchema,
  insertFavoriteSchema,
} from "@shared/schema";

export async function registerRoutes(
  server: HTTPServer,
  app: Express,
): Promise<void> {
  setupAuth(app);

  // Middleware to check if user is authenticated
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // AUTH ROUTES
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error });
      }

      const existingUser = await storage.getUserByEmail(result.data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await hashPassword(result.data.password);
      const user = await storage.createUser({
        ...result.data,
        password: hashedPassword,
      });

      req.login({ id: user.id, email: user.email, role: user.role, name: user.name }, (err) => {
        if (err) return next(err);
        res.json({ 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          name: user.name 
        });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // USER ROUTES
  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      if (req.user!.id !== req.params.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PROPERTY ROUTES
  app.get("/api/properties", requireAuth, async (req, res) => {
    try {
      const properties = await storage.getPropertiesForTenant(req.user!.id);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/properties/:id", requireAuth, async (req, res) => {
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

  app.get("/api/landlord/properties", requireAuth, async (req, res) => {
    try {
      if (req.user!.role !== 'landlord') {
        return res.status(403).json({ message: "Forbidden" });
      }
      const properties = await storage.getPropertiesByLandlord(req.user!.id);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/properties", requireAuth, async (req, res) => {
    try {
      if (req.user!.role !== 'landlord') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const result = insertPropertySchema.safeParse({
        ...req.body,
        landlordId: req.user!.id,
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

  app.patch("/api/properties/:id", requireAuth, async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.landlordId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updated = await storage.updateProperty(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/properties/:id", requireAuth, async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.landlordId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteProperty(req.params.id);
      res.json({ message: "Property deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ROOMMATE ROUTES
  app.get("/api/roommates", requireAuth, async (req, res) => {
    try {
      const roommates = await storage.getRoommatesForTenant(req.user!.id);
      res.json(roommates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/roommates/:id", requireAuth, async (req, res) => {
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

  app.post("/api/roommates", requireAuth, async (req, res) => {
    try {
      const result = insertRoommateSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
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
  app.post("/api/swipes", requireAuth, async (req, res) => {
    try {
      const result = insertSwipeSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid swipe data", errors: result.error });
      }

      const swipe = await storage.createSwipe(result.data);

      // Check for match if it's a like on a roommate
      if (result.data.action === 'like' && result.data.targetType === 'roommate') {
        const roommate = await storage.getRoommate(result.data.targetId);
        if (roommate) {
          // Check if the roommate's user also liked this user
          const reverseSwipe = await storage.getSwipe(roommate.userId, req.user!.id, 'roommate');
          if (reverseSwipe && reverseSwipe.action === 'like') {
            // Create match if not already exists
            const existingMatch = await storage.checkExistingMatch(req.user!.id, roommate.userId);
            if (!existingMatch) {
              await storage.createMatch({
                user1Id: req.user!.id,
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
  app.get("/api/matches", requireAuth, async (req, res) => {
    try {
      const matches = await storage.getUserMatches(req.user!.id);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // FAVORITE ROUTES
  app.get("/api/favorites", requireAuth, async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.user!.id);
      
      // Fetch full property details for each favorite
      const propertiesPromises = favorites.map(f => storage.getProperty(f.propertyId));
      const properties = await Promise.all(propertiesPromises);
      
      res.json(properties.filter(p => p !== undefined));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      const result = insertFavoriteSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
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

  app.delete("/api/favorites/:propertyId", requireAuth, async (req, res) => {
    try {
      await storage.removeFavorite(req.user!.id, req.params.propertyId);
      res.json({ message: "Favorite removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/favorites/:propertyId/check", requireAuth, async (req, res) => {
    try {
      const isFavorited = await storage.isFavorited(req.user!.id, req.params.propertyId);
      res.json({ isFavorited });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
