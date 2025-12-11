import { db } from "./db";
import { eq, and, or } from "drizzle-orm";
import {
  users,
  properties,
  roommates,
  swipes,
  matches,
  favorites,
  type User,
  type InsertUser,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Roommate,
  type InsertRoommate,
  type Swipe,
  type InsertSwipe,
  type Match,
  type InsertMatch,
  type Favorite,
  type InsertFavorite,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Properties
  getProperty(id: string): Promise<Property | undefined>;
  getPropertiesByLandlord(landlordId: string): Promise<Property[]>;
  getAllProperties(): Promise<Property[]>;
  getPropertiesForTenant(userId: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;

  // Roommates
  getRoommate(id: string): Promise<Roommate | undefined>;
  getRoommatesByUser(userId: string): Promise<Roommate[]>;
  getAllRoommates(): Promise<Roommate[]>;
  getRoommatesForTenant(userId: string): Promise<Roommate[]>;
  createRoommate(roommate: InsertRoommate): Promise<Roommate>;
  updateRoommate(id: string, updates: Partial<InsertRoommate>): Promise<Roommate | undefined>;
  deleteRoommate(id: string): Promise<boolean>;

  // Swipes
  createSwipe(swipe: InsertSwipe): Promise<Swipe>;
  getSwipe(userId: string, targetId: string, targetType: string): Promise<Swipe | undefined>;
  getUserSwipes(userId: string): Promise<Swipe[]>;

  // Matches
  createMatch(match: InsertMatch): Promise<Match>;
  getUserMatches(userId: string): Promise<Match[]>;
  checkExistingMatch(user1Id: string, user2Id: string): Promise<Match | undefined>;

  // Favorites
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, propertyId: string): Promise<boolean>;
  getUserFavorites(userId: string): Promise<Favorite[]>;
  isFavorited(userId: string, propertyId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userId = userData.id;
    
    // First check if user exists by id
    if (userId) {
      const existingById = await this.getUser(userId);
      if (existingById) {
        // Update existing user
        const [updated] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();
        return updated;
      }
    }

    // Check if user exists by email (for users created before Replit Auth)
    if (userData.email) {
      const existingByEmail = await this.getUserByEmail(userData.email);
      if (existingByEmail) {
        // Update existing user with new Replit ID
        const [updated] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();
        return updated;
      }
    }

    // Create new user
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    // Delete related records first
    await db.delete(roommates).where(eq(roommates.userId, id));
    await db.delete(swipes).where(eq(swipes.userId, id));
    await db.delete(favorites).where(eq(favorites.userId, id));
    await db.delete(matches).where(or(eq(matches.user1Id, id), eq(matches.user2Id, id)));
    // Delete user
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Properties
  async getProperty(id: string): Promise<Property | undefined> {
    const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return result[0];
  }

  async getPropertiesByLandlord(landlordId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.landlordId, landlordId));
  }

  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties);
  }

  async getPropertiesForTenant(userId: string): Promise<Property[]> {
    // Get properties the user hasn't swiped on yet
    const userSwipes = await db.select().from(swipes).where(
      and(
        eq(swipes.userId, userId),
        eq(swipes.targetType, 'property')
      )
    );
    
    const swipedPropertyIds = userSwipes.map(s => s.targetId);
    
    const allProperties = await db.select().from(properties);
    return allProperties.filter(p => !swipedPropertyIds.includes(p.id));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(property).returning();
    return result[0];
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const result = await db.update(properties).set(updates).where(eq(properties.id, id)).returning();
    return result[0];
  }

  async deleteProperty(id: string): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id)).returning();
    return result.length > 0;
  }

  // Roommates
  async getRoommate(id: string): Promise<Roommate | undefined> {
    const result = await db.select().from(roommates).where(eq(roommates.id, id)).limit(1);
    return result[0];
  }

  async getRoommatesByUser(userId: string): Promise<Roommate[]> {
    return await db.select().from(roommates).where(eq(roommates.userId, userId));
  }

  async getAllRoommates(): Promise<Roommate[]> {
    return await db.select().from(roommates);
  }

  async getRoommatesForTenant(userId: string): Promise<Roommate[]> {
    // Get roommates the user hasn't swiped on yet, excluding their own
    const userSwipes = await db.select().from(swipes).where(
      and(
        eq(swipes.userId, userId),
        eq(swipes.targetType, 'roommate')
      )
    );
    
    const swipedRoommateIds = userSwipes.map(s => s.targetId);
    
    const allRoommates = await db.select().from(roommates);
    return allRoommates.filter(r => !swipedRoommateIds.includes(r.id) && r.userId !== userId);
  }

  async createRoommate(roommate: InsertRoommate): Promise<Roommate> {
    const result = await db.insert(roommates).values(roommate).returning();
    return result[0];
  }

  async updateRoommate(id: string, updates: Partial<InsertRoommate>): Promise<Roommate | undefined> {
    const result = await db.update(roommates).set(updates).where(eq(roommates.id, id)).returning();
    return result[0];
  }

  async deleteRoommate(id: string): Promise<boolean> {
    const result = await db.delete(roommates).where(eq(roommates.id, id)).returning();
    return result.length > 0;
  }

  // Swipes
  async createSwipe(swipe: InsertSwipe): Promise<Swipe> {
    const result = await db.insert(swipes).values(swipe).returning();
    return result[0];
  }

  async getSwipe(userId: string, targetId: string, targetType: string): Promise<Swipe | undefined> {
    const result = await db.select().from(swipes).where(
      and(
        eq(swipes.userId, userId),
        eq(swipes.targetId, targetId),
        eq(swipes.targetType, targetType)
      )
    ).limit(1);
    return result[0];
  }

  async getUserSwipes(userId: string): Promise<Swipe[]> {
    return await db.select().from(swipes).where(eq(swipes.userId, userId));
  }

  // Matches
  async createMatch(match: InsertMatch): Promise<Match> {
    const result = await db.insert(matches).values(match).returning();
    return result[0];
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    return await db.select().from(matches).where(
      or(
        eq(matches.user1Id, userId),
        eq(matches.user2Id, userId)
      )
    );
  }

  async checkExistingMatch(user1Id: string, user2Id: string): Promise<Match | undefined> {
    const result = await db.select().from(matches).where(
      or(
        and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
        and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
      )
    ).limit(1);
    return result[0];
  }

  // Favorites
  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values(favorite).returning();
    return result[0];
  }

  async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    const result = await db.delete(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.propertyId, propertyId)
      )
    ).returning();
    return result.length > 0;
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async isFavorited(userId: string, propertyId: string): Promise<boolean> {
    const result = await db.select().from(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.propertyId, propertyId)
      )
    ).limit(1);
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
