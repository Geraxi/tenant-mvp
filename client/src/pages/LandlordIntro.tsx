import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function LandlordIntro() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  const handleNext = () => {
    // TODO: Move to next onboarding step
    setLocation("/landlord/criteria");
  };

  const handleBack = () => {
    setLocation("/landlord/landing");
  };

  return (
    <ProtectedRoute requiredRole="landlord">
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-black text-gray-900">
              {language === "it" 
                ? "Benvenuto, Proprietario!" 
                : "Welcome, Landlord!"}
            </h1>
            <p className="text-lg text-gray-600">
              {language === "it"
                ? "Iniziamo con l'onboarding"
                : "Let's start with onboarding"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
            <p className="text-gray-600 text-center">
              {language === "it"
                ? "Questa pagina sarà implementata con il flusso di onboarding del proprietario basato sugli screenshot forniti."
                : "This page will be implemented with the landlord onboarding flow based on the provided screenshots."}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              {language === "it" ? "Indietro" : "Back"}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
            >
              {language === "it" ? "Avanti" : "Next"}
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}




