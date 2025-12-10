import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { Link, useLocation } from "wouter";
import { Settings, LogOut, Globe, Shield, HelpCircle, ChevronRight, User } from "lucide-react";

export default function Profile({ role }: { role: "tenant" | "landlord" }) {
  const { t, language, setLanguage } = useLanguage();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title={t("nav.profile")} />

      <main className="pt-24 px-4 max-w-md mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 border-4 border-white shadow-md overflow-hidden relative">
            <User className="w-full h-full p-6 text-gray-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
              <Settings size={14} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Alex Johnson</h2>
          <p className="text-gray-500 font-medium">{role === "tenant" ? "Tenant" : "Landlord"} • Milano</p>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <button 
            onClick={() => setLanguage(language === "en" ? "it" : "en")}
            className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-900">Language</h3>
              <p className="text-xs text-gray-500">{language === "en" ? "English" : "Italiano"}</p>
            </div>
            <span className="font-bold text-gray-400 text-sm">{language.toUpperCase()}</span>
          </button>

           <div className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-900">Privacy & Security</h3>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </div>

          <div className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-900">Help & Support</h3>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          {t("action.logout")}
        </button>

      </main>

      <BottomNav role={role} />
    </div>
  );
}
