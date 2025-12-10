import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "it";

type Translations = {
  [key: string]: {
    en: string;
    it: string;
  };
};

const translations: Translations = {
  // Auth & General
  "app.name": { en: "Tenant", it: "Tenant" },
  "app.tagline": { en: "Find homes with a swipe", it: "Trova casa con uno swipe" },
  "auth.signIn": { en: "Sign In", it: "Accedi" },
  "auth.createAccount": { en: "Create an account", it: "Crea un account" },
  "auth.email": { en: "Email", it: "Email" },
  "auth.password": { en: "Password", it: "Password" },
  "auth.continue": { en: "Continue", it: "Continua" },
  
  // Roles
  "role.title": { en: "Choose your role", it: "Scegli il tuo ruolo" },
  "role.tenant": { en: "Tenant", it: "Inquilino" },
  "role.landlord": { en: "Landlord", it: "Proprietario" },
  
  // Actions
  "action.like": { en: "Like", it: "Mi piace" },
  "action.skip": { en: "Skip", it: "Salta" },
  "action.save": { en: "Save", it: "Salva" },
  "action.saved": { en: "Saved", it: "Salvata" },
  "action.contact": { en: "Contact owner", it: "Contatta proprietario" },
  "action.contactRoommate": { en: "Contact roommate", it: "Contatta coinquilino" },
  "action.addListing": { en: "Add listing", it: "Aggiungi annuncio" },
  "action.submit": { en: "Submit", it: "Invia" },
  "action.logout": { en: "Log out", it: "Esci" },
  
  // Navigation
  "nav.home": { en: "Home", it: "Home" },
  "nav.favorites": { en: "Favorites", it: "Preferiti" },
  "nav.matches": { en: "Matches", it: "Match" },
  "nav.profile": { en: "Profile", it: "Profilo" },
  "nav.listings": { en: "Listings", it: "Annunci" },

  // Tenant Toggle
  "tenant.toggle.homes": { en: "Homes", it: "Case" },
  "tenant.toggle.roommates": { en: "Roommates", it: "Coinquilini" },
  
  // Property Details
  "prop.furnished": { en: "Furnished", it: "Arredata" },
  "prop.pets": { en: "Pets allowed", it: "Animali ammessi" },
  "prop.beds": { en: "beds", it: "camere" },
  "prop.baths": { en: "baths", it: "bagni" },
  "prop.rent": { en: "Monthly rent", it: "Affitto mensile" },
  
  // Empty States
  "empty.noProperties": { en: "No more properties to show", it: "Nessun altro immobile da mostrare" },
  "empty.noRoommates": { en: "No more roommates to show", it: "Nessun altro coinquilino da mostrare" },
  "empty.checkLater": { en: "Check back later!", it: "Torna più tardi!" },
  
  // Landlord Form
  "form.title": { en: "Title", it: "Titolo" },
  "form.city": { en: "City", it: "Città" },
  "form.area": { en: "Area", it: "Zona" },
  "form.price": { en: "Price", it: "Prezzo" },
  "form.type": { en: "Property type", it: "Tipo di immobile" },
  "form.desc": { en: "Description", it: "Descrizione" },
  "form.amenities": { en: "Other amenities", it: "Altri servizi" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
