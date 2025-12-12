import { useLanguage } from "@/lib/i18n";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-full bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => setLocation("/")} className="p-2 -ml-2" data-testid="button-back">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {language === "it" ? "Privacy Policy" : "Privacy Policy"}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "1. Raccolta dei Dati" : "1. Data Collection"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Raccogliamo le informazioni che ci fornisci durante la registrazione e l'utilizzo dell'app, inclusi: nome, email, foto del profilo, preferenze di ricerca e informazioni sugli immobili."
              : "We collect information you provide during registration and app usage, including: name, email, profile photos, search preferences, and property information."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "2. Utilizzo dei Dati" : "2. Use of Data"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "I tuoi dati vengono utilizzati per: fornire e migliorare il servizio, facilitare la comunicazione tra utenti, personalizzare l'esperienza nell'app e garantire la sicurezza della piattaforma."
              : "Your data is used to: provide and improve the service, facilitate communication between users, personalize the app experience, and ensure platform security."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "3. Condivisione dei Dati" : "3. Data Sharing"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "I tuoi dati del profilo sono visibili ad altri utenti dell'app. Non vendiamo i tuoi dati personali a terze parti. Potremmo condividere dati con fornitori di servizi che ci aiutano a operare la piattaforma."
              : "Your profile data is visible to other app users. We do not sell your personal data to third parties. We may share data with service providers who help us operate the platform."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "4. Sicurezza dei Dati" : "4. Data Security"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Utilizziamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati, inclusa la crittografia delle comunicazioni e l'archiviazione sicura."
              : "We use technical and organizational security measures to protect your data, including communication encryption and secure storage."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "5. I Tuoi Diritti" : "5. Your Rights"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Hai il diritto di: accedere ai tuoi dati, richiedere la correzione di dati inesatti, richiedere la cancellazione dei tuoi dati e opporti al trattamento dei tuoi dati."
              : "You have the right to: access your data, request correction of inaccurate data, request deletion of your data, and object to the processing of your data."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "6. Cookie e Tecnologie Simili" : "6. Cookies and Similar Technologies"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Utilizziamo cookie e tecnologie simili per mantenere la tua sessione di accesso e migliorare l'esperienza nell'app."
              : "We use cookies and similar technologies to maintain your login session and improve the app experience."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "7. Conservazione dei Dati" : "7. Data Retention"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Conserviamo i tuoi dati per tutto il tempo in cui mantieni un account attivo. Dopo la cancellazione dell'account, i dati vengono rimossi entro 30 giorni."
              : "We retain your data for as long as you maintain an active account. After account deletion, data is removed within 30 days."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {language === "it" ? "8. Contatti" : "8. Contact"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {language === "it"
              ? "Per domande sulla privacy o per esercitare i tuoi diritti, contattaci all'indirizzo email di supporto."
              : "For privacy questions or to exercise your rights, contact us at the support email address."}
          </p>
        </section>

        <p className="text-sm text-gray-400 pt-6">
          {language === "it" ? "Ultimo aggiornamento: Dicembre 2025" : "Last updated: December 2025"}
        </p>
      </div>
    </div>
  );
}
