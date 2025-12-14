-- Property and Tenant Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS utenti (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  ruolo TEXT NOT NULL CHECK (ruolo IN ('tenant', 'landlord')),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  foto TEXT,
  documento_id TEXT,
  verificato BOOLEAN DEFAULT FALSE,
  telefono TEXT,
  data_nascita DATE,
  indirizzo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS immobili (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES utenti(id) NOT NULL,
  indirizzo TEXT NOT NULL,
  descrizione TEXT,
  foto TEXT[] DEFAULT '{}',
  tipo TEXT NOT NULL CHECK (tipo IN ('appartamento', 'casa', 'ufficio', 'negozio')),
  superficie INTEGER NOT NULL,
  locali INTEGER NOT NULL,
  piano INTEGER,
  ascensore BOOLEAN DEFAULT FALSE,
  balcone BOOLEAN DEFAULT FALSE,
  giardino BOOLEAN DEFAULT FALSE,
  garage BOOLEAN DEFAULT FALSE,
  canone_mensile NUMERIC(10,2) NOT NULL,
  spese_condominiali NUMERIC(10,2) DEFAULT 0,
  deposito_cauzionale NUMERIC(10,2) NOT NULL,
  disponibile BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contratti (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES immobili(id) NOT NULL,
  tenant_id UUID REFERENCES utenti(id) NOT NULL,
  landlord_id UUID REFERENCES utenti(id) NOT NULL,
  canone NUMERIC(10,2) NOT NULL,
  data_inizio DATE NOT NULL,
  data_fine DATE NOT NULL,
  deposito_cauzionale NUMERIC(10,2) NOT NULL,
  spese_condominiali NUMERIC(10,2) DEFAULT 0,
  contratto_url TEXT,
  stato TEXT NOT NULL CHECK (stato IN ('bozza', 'firmato', 'attivo', 'scaduto')) DEFAULT 'bozza',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bills table
CREATE TABLE IF NOT EXISTS bollette (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lease_id UUID REFERENCES contratti(id) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('affitto', 'luce', 'gas', 'acqua', 'riscaldamento', 'condominio', 'tasse', 'altro')),
  descrizione TEXT NOT NULL,
  importo NUMERIC(10,2) NOT NULL,
  data_scadenza DATE NOT NULL,
  data_emissione DATE DEFAULT CURRENT_DATE,
  stato TEXT NOT NULL CHECK (stato IN ('da_pagare', 'pagato', 'scaduto', 'in_ritardo')) DEFAULT 'da_pagare',
  ricevuta_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS pagamenti (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bill_id UUID REFERENCES bollette(id) NOT NULL,
  utente_id UUID REFERENCES utenti(id) NOT NULL,
  importo NUMERIC(10,2) NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('pagopa', 'bonifico', 'contanti', 'carta')),
  stato TEXT NOT NULL CHECK (stato IN ('in_attesa', 'completato', 'fallito', 'rimborsato')) DEFAULT 'in_attesa',
  data_pagamento TIMESTAMPTZ,
  transazione_id TEXT,
  link_pagamento TEXT,
  cashback_guadagnato NUMERIC(10,2) DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifiche (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  utente_id UUID REFERENCES utenti(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('scadenza', 'pagamento', 'promemoria', 'sistema')),
  titolo TEXT NOT NULL,
  messaggio TEXT NOT NULL,
  letta BOOLEAN DEFAULT FALSE,
  data_scadenza TIMESTAMPTZ,
  azione_richiesta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cashback table
CREATE TABLE IF NOT EXISTS cashback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  utente_id UUID REFERENCES utenti(id) NOT NULL,
  importo NUMERIC(10,2) NOT NULL,
  fonte TEXT NOT NULL CHECK (fonte IN ('affitto', 'bollette', 'bonus', 'referral')),
  descrizione TEXT NOT NULL,
  data_guadagno TIMESTAMPTZ NOT NULL,
  stato TEXT NOT NULL CHECK (stato IN ('pending', 'disponibile', 'utilizzato')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documenti (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  utente_id UUID REFERENCES utenti(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('contratto', 'ricevuta', 'identita', 'selfie', 'altro')),
  nome_file TEXT NOT NULL,
  url TEXT NOT NULL,
  dimensione INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  verificato BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER set_updated_at_utenti
  BEFORE UPDATE ON utenti
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER set_updated_at_immobili
  BEFORE UPDATE ON immobili
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER set_updated_at_contratti
  BEFORE UPDATE ON contratti
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER set_updated_at_bollette
  BEFORE UPDATE ON bollette
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER set_updated_at_pagamenti
  BEFORE UPDATE ON pagamenti
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to automatically create bills for rent
CREATE OR REPLACE FUNCTION create_monthly_rent_bills()
RETURNS TRIGGER AS $$
BEGIN
  -- Create monthly rent bills for active contracts
  INSERT INTO bollette (lease_id, categoria, descrizione, importo, data_scadenza, data_emissione)
  SELECT 
    c.id,
    'affitto',
    'Affitto ' || to_char(CURRENT_DATE + INTERVAL '1 month', 'Month YYYY'),
    c.canone,
    (CURRENT_DATE + INTERVAL '1 month')::DATE,
    CURRENT_DATE
  FROM contratti c
  WHERE c.stato = 'attivo'
    AND c.data_fine > CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM bollette b 
      WHERE b.lease_id = c.id 
        AND b.categoria = 'affitto'
        AND b.data_scadenza = (CURRENT_DATE + INTERVAL '1 month')::DATE
    );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create monthly rent bills (run this monthly via cron job)
-- CREATE TRIGGER create_monthly_rent_bills_trigger
--   AFTER INSERT ON bollette
--   FOR EACH STATEMENT EXECUTE PROCEDURE create_monthly_rent_bills();

-- Function to update bill status based on due date
CREATE OR REPLACE FUNCTION update_bill_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update bills that are overdue
  UPDATE bollette 
  SET stato = 'scaduto'
  WHERE stato = 'da_pagare' 
    AND data_scadenza < CURRENT_DATE;
  
  -- Update bills that are very overdue (more than 30 days)
  UPDATE bollette 
  SET stato = 'in_ritardo'
  WHERE stato = 'scaduto' 
    AND data_scadenza < CURRENT_DATE - INTERVAL '30 days';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update bill status
CREATE TRIGGER update_bill_status_trigger
  AFTER INSERT OR UPDATE ON bollette
  FOR EACH STATEMENT EXECUTE PROCEDURE update_bill_status();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE immobili ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratti ENABLE ROW LEVEL SECURITY;
ALTER TABLE bollette ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifiche ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashback ENABLE ROW LEVEL SECURITY;
ALTER TABLE documenti ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON utenti
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON utenti
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON utenti
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties: public read, owner can modify
CREATE POLICY "Anyone can view properties" ON immobili
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own properties" ON immobili
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own properties" ON immobili
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own properties" ON immobili
  FOR DELETE USING (auth.uid() = owner_id);

-- Contracts: only involved parties can access
CREATE POLICY "Users can view own contracts" ON contratti
  FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Users can insert contracts" ON contratti
  FOR INSERT WITH CHECK (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Users can update own contracts" ON contratti
  FOR UPDATE USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- Bills: only involved parties can access
CREATE POLICY "Users can view own bills" ON bollette
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contratti c 
      WHERE c.id = bollette.lease_id 
        AND (c.tenant_id = auth.uid() OR c.landlord_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert bills" ON bollette
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contratti c 
      WHERE c.id = bollette.lease_id 
        AND (c.tenant_id = auth.uid() OR c.landlord_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own bills" ON bollette
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM contratti c 
      WHERE c.id = bollette.lease_id 
        AND (c.tenant_id = auth.uid() OR c.landlord_id = auth.uid())
    )
  );

-- Payments: only the user who made the payment can access
CREATE POLICY "Users can view own payments" ON pagamenti
  FOR SELECT USING (auth.uid() = utente_id);

CREATE POLICY "Users can insert own payments" ON pagamenti
  FOR INSERT WITH CHECK (auth.uid() = utente_id);

CREATE POLICY "Users can update own payments" ON pagamenti
  FOR UPDATE USING (auth.uid() = utente_id);

-- Notifications: only the user can access their notifications
CREATE POLICY "Users can view own notifications" ON notifiche
  FOR SELECT USING (auth.uid() = utente_id);

CREATE POLICY "Users can insert own notifications" ON notifiche
  FOR INSERT WITH CHECK (auth.uid() = utente_id);

CREATE POLICY "Users can update own notifications" ON notifiche
  FOR UPDATE USING (auth.uid() = utente_id);

CREATE POLICY "Users can delete own notifications" ON notifiche
  FOR DELETE USING (auth.uid() = utente_id);

-- Cashback: only the user can access their cashback
CREATE POLICY "Users can view own cashback" ON cashback
  FOR SELECT USING (auth.uid() = utente_id);

CREATE POLICY "Users can insert own cashback" ON cashback
  FOR INSERT WITH CHECK (auth.uid() = utente_id);

CREATE POLICY "Users can update own cashback" ON cashback
  FOR UPDATE USING (auth.uid() = utente_id);

-- Documents: only the user can access their documents
CREATE POLICY "Users can view own documents" ON documenti
  FOR SELECT USING (auth.uid() = utente_id);

CREATE POLICY "Users can insert own documents" ON documenti
  FOR INSERT WITH CHECK (auth.uid() = utente_id);

CREATE POLICY "Users can update own documents" ON documenti
  FOR UPDATE USING (auth.uid() = utente_id);

CREATE POLICY "Users can delete own documents" ON documenti
  FOR DELETE USING (auth.uid() = utente_id);

-- Storage Buckets Setup
-- Create buckets (only if they don't exist)
INSERT INTO storage.buckets (id, name, public) 
SELECT 'user_uploads', 'user_uploads', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user_uploads');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'user_uploads_private', 'user_uploads_private', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user_uploads_private');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'property_images', 'property_images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'property_images');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'documents', 'documents', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents');

-- Storage policies (drop existing policies first to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for user uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own private files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own private files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;

-- User uploads (public - avatars)
CREATE POLICY "Public read access for user uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'user_uploads');

CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user_uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Private user uploads (ID documents, selfies)
CREATE POLICY "Users can view own private files" ON storage.objects
  FOR SELECT USING (bucket_id = 'user_uploads_private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own private files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user_uploads_private' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Property images (public)
CREATE POLICY "Public read access for property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property_images');

CREATE POLICY "Users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'property_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents (private - only the user)
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_utenti_email ON utenti(email);
CREATE INDEX IF NOT EXISTS idx_immobili_owner_id ON immobili(owner_id);
CREATE INDEX IF NOT EXISTS idx_immobili_disponibile ON immobili(disponibile);
CREATE INDEX IF NOT EXISTS idx_contratti_tenant_id ON contratti(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contratti_landlord_id ON contratti(landlord_id);
CREATE INDEX IF NOT EXISTS idx_contratti_property_id ON contratti(property_id);
CREATE INDEX IF NOT EXISTS idx_bollette_lease_id ON bollette(lease_id);
CREATE INDEX IF NOT EXISTS idx_bollette_data_scadenza ON bollette(data_scadenza);
CREATE INDEX IF NOT EXISTS idx_bollette_stato ON bollette(stato);
CREATE INDEX IF NOT EXISTS idx_pagamenti_utente_id ON pagamenti(utente_id);
CREATE INDEX IF NOT EXISTS idx_pagamenti_bill_id ON pagamenti(bill_id);
CREATE INDEX IF NOT EXISTS idx_pagamenti_stato ON pagamenti(stato);
CREATE INDEX IF NOT EXISTS idx_notifiche_utente_id ON notifiche(utente_id);
CREATE INDEX IF NOT EXISTS idx_notifiche_letta ON notifiche(letta);
CREATE INDEX IF NOT EXISTS idx_cashback_utente_id ON cashback(utente_id);
CREATE INDEX IF NOT EXISTS idx_cashback_stato ON cashback(stato);
CREATE INDEX IF NOT EXISTS idx_documenti_utente_id ON documenti(utente_id);
CREATE INDEX IF NOT EXISTS idx_documenti_tipo ON documenti(tipo);

-- Insert sample data for testing (optional)
-- Uncomment the following lines to insert sample data

/*
-- Sample users
INSERT INTO utenti (id, ruolo, nome, email, verificato) VALUES
  ('00000000-0000-0000-0000-000000000001', 'tenant', 'Mario Rossi', 'mario.rossi@email.com', true),
  ('00000000-0000-0000-0000-000000000002', 'landlord', 'Giulia Bianchi', 'giulia.bianchi@email.com', true);

-- Sample property
INSERT INTO immobili (owner_id, indirizzo, descrizione, tipo, superficie, locali, canone_mensile, deposito_cauzionale) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Via Roma 123, Milano', 'Appartamento moderno nel centro di Milano', 'appartamento', 80, 3, 1200.00, 2400.00);

-- Sample contract
INSERT INTO contratti (property_id, tenant_id, landlord_id, canone, data_inizio, data_fine, deposito_cauzionale, stato) VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 1200.00, '2024-01-01', '2024-12-31', 2400.00, 'attivo');
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
