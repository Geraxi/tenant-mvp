import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Lock, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid session (from the reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError(language === "it" 
          ? "Link di reset non valido o scaduto. Richiedi un nuovo reset password." 
          : "Invalid or expired reset link. Please request a new password reset.");
      }
    });
  }, [language]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError(language === "it" ? "Le password non corrispondono" : "Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(language === "it" ? "La password deve essere di almeno 6 caratteri" : "Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || (language === "it" ? "Errore durante l'aggiornamento della password" : "Error updating password"));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || (language === "it" ? "Errore durante il reset della password" : "Error resetting password"));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "it" ? "Password aggiornata!" : "Password updated!"}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === "it" 
                ? "La tua password è stata aggiornata con successo. Verrai reindirizzato al login..." 
                : "Your password has been successfully updated. Redirecting to login..."}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <button 
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-white mb-6"
          data-testid="button-back"
        >
          <ArrowLeft size={20} />
          <span>{language === "it" ? "Indietro" : "Back"}</span>
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {language === "it" ? "Resetta Password" : "Reset Password"}
          </h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder={language === "it" ? "Nuova password" : "New password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                data-testid="input-new-password"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder={language === "it" ? "Conferma password" : "Confirm password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                data-testid="input-confirm-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              data-testid="button-submit-reset"
            >
              {loading ? "..." : (language === "it" ? "Aggiorna Password" : "Update Password")}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

