import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { useLocation } from "wouter";
import { Settings, LogOut, Globe, Shield, HelpCircle, ChevronRight, RefreshCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile({ role }: { role: "tenant" | "landlord" }) {
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    window.location.href = "/api/logout";
  };

  const switchRole = () => {
    setLocation(role === "tenant" ? "/landlord" : "/tenant");
  };

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar title={t("nav.profile")} />

      <main className="pt-24 px-4 max-w-md mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 border-4 border-white shadow-md overflow-hidden relative">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user.name || 'User'} className="w-full h-full object-cover" data-testid="img-profile" />
            ) : user?.images && user.images.length > 0 ? (
              <img src={user.images[0]} alt={user.name || 'User'} className="w-full h-full object-cover" data-testid="img-profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold" data-testid="text-profile-initial">
                {user?.name?.charAt(0)?.toUpperCase() || user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
              <Settings size={14} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900" data-testid="text-username">{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}</h2>
          <p className="text-gray-500 font-medium" data-testid="text-role">{role === "tenant" ? "Tenant" : "Landlord"} {user?.city ? `• ${user.city}` : ''}</p>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <button 
            onClick={switchRole}
            className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <RefreshCcw size={20} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-900">Switch Role</h3>
              <p className="text-xs text-gray-500">Currently: {role === "tenant" ? "Tenant" : "Landlord"}</p>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </button>

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
          data-testid="button-logout"
        >
          <LogOut size={20} />
          {t("action.logout")}
        </button>

      </main>

      <BottomNav role={role} />
    </div>
  );
}
