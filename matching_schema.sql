-- Matching System Database Schema
-- This file contains the SQL schema for the mutual matching system

-- Likes table - stores likes between users and properties/tenants
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL, -- Can be property_id or tenant_id
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('property', 'tenant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only like the same target once
  UNIQUE(user_id, target_id, target_type)
);

-- Matches table - stores mutual matches between tenants and landlords
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES immobili(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique matches
  UNIQUE(tenant_id, landlord_id, property_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target_id ON likes(target_id);
CREATE INDEX IF NOT EXISTS idx_likes_target_type ON likes(target_type);
CREATE INDEX IF NOT EXISTS idx_matches_tenant_id ON matches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_matches_landlord_id ON matches(landlord_id);
CREATE INDEX IF NOT EXISTS idx_matches_property_id ON matches(property_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Users can view their own likes" ON likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Users can insert matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Users can update their own matches" ON matches
  FOR UPDATE USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- Functions for matching logic

-- Function to create a match when both parties have liked each other
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
DECLARE
  tenant_id UUID;
  landlord_id UUID;
  property_id UUID;
  existing_match UUID;
BEGIN
  -- Check if this is a property like
  IF NEW.target_type = 'property' THEN
    -- Get property owner
    SELECT owner_id INTO landlord_id
    FROM immobili
    WHERE id = NEW.target_id;
    
    tenant_id := NEW.user_id;
    property_id := NEW.target_id;
    
    -- Check if landlord has already liked this tenant
    IF EXISTS (
      SELECT 1 FROM likes
      WHERE user_id = landlord_id
        AND target_id = tenant_id
        AND target_type = 'tenant'
    ) THEN
      -- Create match
      INSERT INTO matches (tenant_id, landlord_id, property_id)
      VALUES (tenant_id, landlord_id, property_id)
      ON CONFLICT (tenant_id, landlord_id, property_id) DO NOTHING
      RETURNING id INTO existing_match;
      
      -- If match was created, send notification (placeholder)
      IF existing_match IS NOT NULL THEN
        -- TODO: Send push notification
        RAISE NOTICE 'Match created between tenant % and landlord % for property %', 
          tenant_id, landlord_id, property_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create a match when landlord likes tenant
CREATE OR REPLACE FUNCTION create_match_on_landlord_like()
RETURNS TRIGGER AS $$
DECLARE
  tenant_id UUID;
  landlord_id UUID;
  property_id UUID;
  existing_match UUID;
BEGIN
  -- Check if this is a tenant like
  IF NEW.target_type = 'tenant' THEN
    landlord_id := NEW.user_id;
    tenant_id := NEW.target_id;
    
    -- Get the property ID from the context (this would need to be passed somehow)
    -- For now, we'll use a placeholder approach
    -- In a real implementation, you might store the property_id in the likes table
    -- or pass it through the application logic
    
    -- Check if tenant has liked any of landlord's properties
    SELECT l.target_id INTO property_id
    FROM likes l
    JOIN immobili i ON l.target_id = i.id
    WHERE l.user_id = tenant_id
      AND l.target_type = 'property'
      AND i.owner_id = landlord_id
    LIMIT 1;
    
    IF property_id IS NOT NULL THEN
      -- Create match
      INSERT INTO matches (tenant_id, landlord_id, property_id)
      VALUES (tenant_id, landlord_id, property_id)
      ON CONFLICT (tenant_id, landlord_id, property_id) DO NOTHING
      RETURNING id INTO existing_match;
      
      -- If match was created, send notification (placeholder)
      IF existing_match IS NOT NULL THEN
        -- TODO: Send push notification
        RAISE NOTICE 'Match created between tenant % and landlord % for property %', 
          tenant_id, landlord_id, property_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically create matches
CREATE TRIGGER trigger_create_match_on_property_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_mutual_like();

CREATE TRIGGER trigger_create_match_on_tenant_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_landlord_like();

-- Update triggers for updated_at
CREATE TRIGGER trigger_likes_updated_at
  BEFORE UPDATE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();




