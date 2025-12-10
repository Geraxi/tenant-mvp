import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ysvindlleiicosvdzfsz.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdmluZGxsZWlpY29zdmR6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDE2MjAsImV4cCI6MjA3NTkxNzYyMH0.o1EemdXCSc_t9wgz7uele1qpkNBydwyR_m2vNf2mnDo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      utenti: {
        Row: {
          id: string;
          ruolo: 'tenant' | 'landlord';
          nome: string;
          email: string;
          foto?: string;
          documento_id?: string;
          verificato: boolean;
          telefono?: string;
          data_nascita?: string;
          indirizzo?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ruolo: 'tenant' | 'landlord';
          nome: string;
          email: string;
          foto?: string;
          documento_id?: string;
          verificato?: boolean;
          telefono?: string;
          data_nascita?: string;
          indirizzo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ruolo?: 'tenant' | 'landlord';
          nome?: string;
          email?: string;
          foto?: string;
          documento_id?: string;
          verificato?: boolean;
          telefono?: string;
          data_nascita?: string;
          indirizzo?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      immobili: {
        Row: {
          id: string;
          owner_id: string;
          indirizzo: string;
          descrizione?: string;
          foto: string[];
          tipo: 'appartamento' | 'casa' | 'ufficio' | 'negozio';
          superficie: number;
          locali: number;
          piano?: number;
          ascensore: boolean;
          balcone: boolean;
          giardino: boolean;
          garage: boolean;
          canone_mensile: number;
          spese_condominiali: number;
          deposito_cauzionale: number;
          disponibile: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          indirizzo: string;
          descrizione?: string;
          foto?: string[];
          tipo: 'appartamento' | 'casa' | 'ufficio' | 'negozio';
          superficie: number;
          locali: number;
          piano?: number;
          ascensore?: boolean;
          balcone?: boolean;
          giardino?: boolean;
          garage?: boolean;
          canone_mensile: number;
          spese_condominiali: number;
          deposito_cauzionale: number;
          disponibile?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          indirizzo?: string;
          descrizione?: string;
          foto?: string[];
          tipo?: 'appartamento' | 'casa' | 'ufficio' | 'negozio';
          superficie?: number;
          locali?: number;
          piano?: number;
          ascensore?: boolean;
          balcone?: boolean;
          giardino?: boolean;
          garage?: boolean;
          canone_mensile?: number;
          spese_condominiali?: number;
          deposito_cauzionale?: number;
          disponibile?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contratti: {
        Row: {
          id: string;
          property_id: string;
          tenant_id: string;
          landlord_id: string;
          canone: number;
          data_inizio: string;
          data_fine: string;
          deposito_cauzionale: number;
          spese_condominiali: number;
          contratto_url?: string;
          stato: 'bozza' | 'firmato' | 'attivo' | 'scaduto';
          note?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          tenant_id: string;
          landlord_id: string;
          canone: number;
          data_inizio: string;
          data_fine: string;
          deposito_cauzionale: number;
          spese_condominiali: number;
          contratto_url?: string;
          stato?: 'bozza' | 'firmato' | 'attivo' | 'scaduto';
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          tenant_id?: string;
          landlord_id?: string;
          canone?: number;
          data_inizio?: string;
          data_fine?: string;
          deposito_cauzionale?: number;
          spese_condominiali?: number;
          contratto_url?: string;
          stato?: 'bozza' | 'firmato' | 'attivo' | 'scaduto';
          note?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifiche: {
        Row: {
          id: string;
          utente_id: string;
          tipo: 'scadenza' | 'pagamento' | 'promemoria' | 'sistema';
          titolo: string;
          messaggio: string;
          letta: boolean;
          data_scadenza?: string;
          azione_richiesta?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          utente_id: string;
          tipo: 'scadenza' | 'pagamento' | 'promemoria' | 'sistema';
          titolo: string;
          messaggio: string;
          letta?: boolean;
          data_scadenza?: string;
          azione_richiesta?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          utente_id?: string;
          tipo?: 'scadenza' | 'pagamento' | 'promemoria' | 'sistema';
          titolo?: string;
          messaggio?: string;
          letta?: boolean;
          data_scadenza?: string;
          azione_richiesta?: string;
          created_at?: string;
        };
      };
      documenti: {
        Row: {
          id: string;
          utente_id: string;
          tipo: 'contratto' | 'ricevuta' | 'identita' | 'selfie' | 'altro';
          nome_file: string;
          url: string;
          dimensione: number;
          mime_type: string;
          verificato: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          utente_id: string;
          tipo: 'contratto' | 'ricevuta' | 'identita' | 'selfie' | 'altro';
          nome_file: string;
          url: string;
          dimensione: number;
          mime_type: string;
          verificato?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          utente_id?: string;
          tipo?: 'contratto' | 'ricevuta' | 'identita' | 'selfie' | 'altro';
          nome_file?: string;
          url?: string;
          dimensione?: number;
          mime_type?: string;
          verificato?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
