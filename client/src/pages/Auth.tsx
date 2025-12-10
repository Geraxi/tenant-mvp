import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import logo from "@assets/logo-removebg-preview_1765398497308.png";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role) {
      setLocation(`/${user.role}`);
    } else if (!isLoading && isAuthenticated && !user?.role) {
      setLocation("/onboarding");
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <button 
        onClick={() => setLanguage(language === "en" ? "it" : "en")}
        className="absolute top-6 right-6 font-bold text-sm bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
        data-testid="button-language-toggle"
      >
        {language.toUpperCase()}
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col gap-8 z-10"
      >
        <div className="text-center space-y-2 flex flex-col items-center">
          <img src={logo} alt="Tenant Logo" className="w-24 h-24 object-contain mb-2" data-testid="img-logo" />
          <h1 className="text-5xl font-black text-primary tracking-tight">{t("app.name")}</h1>
          <p className="text-lg text-gray-500 font-medium">{t("app.tagline")}</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            data-testid="button-login"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            {t("auth.signIn")}
          </button>

          <p className="text-center text-gray-500 text-sm">
            {t("auth.createAccount") || "Sign in with Google, GitHub, Apple, or email"}
          </p>
        </div>

        <div className="text-center text-xs text-gray-400 mt-4">
          {t("auth.termsNotice") || "By signing in, you agree to our Terms of Service and Privacy Policy"}
        </div>
      </motion.div>
    </div>
  );
}
