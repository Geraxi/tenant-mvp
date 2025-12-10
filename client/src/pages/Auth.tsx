import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import logo from "@assets/logo-removebg-preview_1765398497308.png";

export default function Auth() {
  const { t, language, setLanguage } = useLanguage();
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/role");
  };

  return (
    <div className="min-h-full bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      {/* Language Toggle */}
      <button 
        onClick={() => setLanguage(language === "en" ? "it" : "en")}
        className="absolute top-6 right-6 font-bold text-sm bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
      >
        {language.toUpperCase()}
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col gap-8 z-10"
      >
        {/* Logo */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <img src={logo} alt="Tenant Logo" className="w-24 h-24 object-contain mb-2" />
          <h1 className="text-5xl font-black text-primary tracking-tight">{t("app.name")}</h1>
          <p className="text-lg text-gray-500 font-medium">{t("app.tagline")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">{t("auth.email")}</label>
            <input 
              type="email" 
              placeholder="hello@example.com"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">{t("auth.password")}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
          >
            {t("auth.signIn")}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-4">
          <a href="#" className="text-primary font-bold hover:underline">
            {t("auth.createAccount")}
          </a>
          
          <div className="flex items-center gap-4 justify-center pt-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
              <span className="font-bold text-gray-600">G</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
              <span className="font-bold text-gray-600"></span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
