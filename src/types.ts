// Property and Tenant Management System Types

export interface Utente {
  id: string;
  ruolo: 'tenant' | 'landlord';
  userType?: 'tenant' | 'homeowner'; // Alias for compatibility
  nome: string;
  email: string;
  password?: string;
  foto?: string;
  photos?: string[]; // Multiple photos for Tinder-like carousel
  documento_id?: string;
  verificato: boolean;
  verification_pending?: boolean;
  verification_submitted_at?: string;
  telefono?: string;
  data_nascita?: string;
  indirizzo?: string;
  bio?: string; // User bio/description
  preferences?: {
    rent?: number;
    location?: string;
    moveInDate?: string;
  };
  created_at: string;
  updated_at: string;
  // Onboarding flags
  tenant_onboarding_completed?: boolean;
  landlord_onboarding_completed?: boolean;
}

export interface Immobile {
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
}

export interface Contratto {
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
}


export interface Notifica {
  id: string;
  utente_id: string;
  tipo: 'scadenza' | 'pagamento' | 'promemoria' | 'sistema';
  titolo: string;
  messaggio: string;
  letta: boolean;
  data_scadenza?: string;
  azione_richiesta?: string;
  created_at: string;
}


export interface Documento {
  id: string;
  utente_id: string;
  tipo: 'contratto' | 'ricevuta' | 'identita' | 'selfie' | 'altro';
  nome_file: string;
  url: string;
  dimensione: number;
  mime_type: string;
  verificato: boolean;
  created_at: string;
}


// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  GestioneImmobili: undefined;
  Documenti: undefined;
  Profilo: undefined;
  Notifiche: undefined;
};

// Filter Types
export type FiltroImmobili = 'tutti' | 'disponibili' | 'affittati' | 'miei_immobili';

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

