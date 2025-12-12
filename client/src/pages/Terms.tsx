import { useLanguage } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Terms() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-full bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => setLocation("/")} className="p-2 -ml-2" data-testid="button-back">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {language === "it" ? "Termini di Servizio" : "Terms of Service"}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "1. Accettazione dei Termini" : "1. Acceptance of Terms"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it" 
              ? "Utilizzando l'app Tenant, accetti di essere vincolato da questi Termini di Servizio. Se non accetti questi termini, ti preghiamo di non utilizzare l'applicazione."
              : "By using the Tenant app, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "2. Descrizione del Servizio" : "2. Description of Service"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Tenant e una piattaforma che mette in contatto inquilini in cerca di alloggio con proprietari che offrono immobili in affitto. Il servizio include funzionalita di ricerca, matching e comunicazione tra utenti."
              : "Tenant is a platform that connects tenants looking for housing with landlords offering rental properties. The service includes search, matching, and communication features between users."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "3. Account Utente" : "3. User Account"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Sei responsabile per mantenere la riservatezza del tuo account e password. Devi avere almeno 18 anni per utilizzare questo servizio."
              : "You are responsible for maintaining the confidentiality of your account and password. You must be at least 18 years old to use this service."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "4. Contenuto dell'Utente" : "4. User Content"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Sei responsabile per tutti i contenuti che pubblichi sull'app, incluse foto, descrizioni e messaggi. Non e consentito pubblicare contenuti illegali, offensivi o fuorvianti."
              : "You are responsible for all content you post on the app, including photos, descriptions, and messages. You may not post illegal, offensive, or misleading content."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "5. Limitazione di Responsabilita" : "5. Limitation of Liability"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Tenant non e responsabile per eventuali danni derivanti dall'uso dell'applicazione o dalle transazioni tra utenti. Ti consigliamo di verificare sempre l'identita delle persone con cui interagisci."
              : "Tenant is not liable for any damages arising from the use of the application or transactions between users. We recommend always verifying the identity of people you interact with."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "6. Modifiche ai Termini" : "6. Changes to Terms"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno comunicate attraverso l'applicazione."
              : "We reserve the right to modify these terms at any time. Changes will be communicated through the application."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "7. Contatti" : "7. Contact"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Per domande sui Termini di Servizio, contattaci all'indirizzo email di supporto."
              : "For questions about the Terms of Service, contact us at the support email address."}
          </p>
        </section>

        <p className="text-sm text-gray-400 pt-6">
          {language === "it" ? "Ultimo aggiornamento: Dicembre 2025" : "Last updated: December 2025"}
        </p>
      </div>
    </div>
  );
}
