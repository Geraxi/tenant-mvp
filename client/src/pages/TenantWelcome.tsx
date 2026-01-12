import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Home, ArrowRight } from "lucide-react";
import { onboardingStorageWeb } from "@/lib/onboarding/storage.web";

export default function TenantWelcome() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    // Don't mark onboarding as complete yet - this is just the welcome screen
    // Redirect to the first onboarding step (we'll create these pages)
    // For now, redirect to a placeholder onboarding step
    // TODO: Create actual onboarding steps based on user's screenshots
    setLocation("/tenant/profile/step-1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Home size={48} className="text-white" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-gray-900">
            {language === "it" 
              ? "Benvenuto, Inquilino!" 
              : "Welcome, Tenant!"}
          </h1>
          <p className="text-lg text-gray-600">
            {language === "it"
              ? "Inizia a cercare la tua casa ideale"
              : "Start searching for your ideal home"}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="w-full bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        >
          {language === "it" ? "Inizia" : "Get Started"}
          <ArrowRight size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
}

