import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Home, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { onboardingStorageWeb } from "@/lib/onboarding/storage.web";

export default function RoleSelection() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"tenant" | "landlord" | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [sessionCheckDone, setSessionCheckDone] = useState(false);
  const [maxTimeout, setMaxTimeout] = useState(false);

  // Check for session independently with timeout
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let mounted = true;
    
    // Set a timeout to prevent infinite loading (reduced to 1 second)
    timeoutId = setTimeout(() => {
      if (mounted && !sessionCheckDone) {
        console.warn("Session check timeout, proceeding anyway");
        setHasSession(true); // Assume session exists if check is slow
        setSessionCheckDone(true);
      }
    }, 1000); // 1 second timeout

    // Check Clerk session
    const clerk = (window as any).Clerk;
    if (clerk && clerk.user) {
      if (mounted) {
        clearTimeout(timeoutId);
        setHasSession(true);
        setSessionCheckDone(true);
      }
    } else {
      // Wait a bit for Clerk to load
      setTimeout(() => {
        const clerkCheck = (window as any).Clerk;
        if (mounted) {
          clearTimeout(timeoutId);
          setHasSession(!!clerkCheck?.user);
          setSessionCheckDone(true);
        }
      }, 500);
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Redirect if user already has a role (but only if user data is loaded)
  // But don't redirect if we're still checking session (wait for session check first)
  useEffect(() => {
    if (sessionCheckDone && user?.role && !isLoading) {
      setLocation(`/${user.role}`);
    }
  }, [user, isLoading, sessionCheckDone, setLocation]);

  const handleRoleSelect = async (role: "tenant" | "landlord") => {
    setSelectedRole(role);
    setLoading(true);

    try {
      // Get user ID from Clerk if user data isn't loaded yet
      let userId = user?.id;
      if (!userId) {
        const clerk = (window as any).Clerk;
        userId = clerk?.user?.id;
      }

      if (!userId) {
        throw new Error("User not found. Please try signing in again.");
      }

      // Save the selected role to database
      await api.updateUser(userId, {
        role: role,
        ...(role === "tenant" ? { hasTenantProfile: true } : { hasLandlordProfile: true }),
      } as any);

      // Save the role to localStorage (user-scoped)
      // IMPORTANT: Make sure onboarding is NOT marked as complete
      const userRole = role === "tenant" ? "TENANT" : "LANDLORD";
      await onboardingStorageWeb.setUserRole(userRole);
      
      // Explicitly ensure onboarding completion flags are NOT set
      // This ensures the user must go through onboarding
      if (role === "tenant") {
        // Remove tenant onboarding completion flag if it exists
        localStorage.removeItem(`tenantapp:onboardingCompleted_TENANT:${userId}`);
      } else {
        // Remove landlord onboarding completion flag if it exists
        localStorage.removeItem(`tenantapp:onboardingCompleted_LANDLORD:${userId}`);
      }

      // DIRECT redirect to the appropriate onboarding welcome/landing page
      // This is more reliable than going through OnboardingGate
      if (role === "tenant") {
        console.log('[RoleSelection] Redirecting tenant to /tenant/welcome');
        window.location.href = "/tenant/welcome";
      } else {
        console.log('[RoleSelection] Redirecting landlord to /landlord/landing');
        window.location.href = "/landlord/landing";
      }
    } catch (error: any) {
      toast({
        title: language === "it" ? "Errore" : "Error",
        description: error?.message || (language === "it" ? "Impossibile salvare il ruolo" : "Failed to save role"),
        variant: "destructive",
      });
      setLoading(false);
      setSelectedRole(null);
    }
  };

  // Redirect to login if no session
  useEffect(() => {
    if (sessionCheckDone && hasSession === false) {
      setLocation("/");
    }
  }, [sessionCheckDone, hasSession, setLocation]);

  // Add a maximum timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sessionCheckDone) {
        console.warn("RoleSelection: Session check timeout, proceeding anyway");
        setMaxTimeout(true);
        setSessionCheckDone(true);
        setHasSession(true); // Assume session exists after timeout
      }
    }, 1500); // 1.5 second max timeout
    
    return () => clearTimeout(timer);
  }, [sessionCheckDone]);

  // Show loading only if session check isn't done yet (with timeout protection)
  if (!sessionCheckDone && !maxTimeout) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  // If no session after check, redirect to login (but don't show loading forever)
  if (hasSession === false && sessionCheckDone) {
    // Redirect will happen via useEffect, just show a brief loading
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm text-gray-500">Reindirizzamento...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black text-gray-900">
            {language === "it" 
              ? "Scegli il tuo ruolo" 
              : "Choose your role"}
          </h1>
          <p className="text-lg text-gray-600">
            {language === "it"
              ? "Seleziona come vuoi utilizzare Tenant"
              : "Select how you want to use Tenant"}
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {/* Tenant Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect("tenant")}
            disabled={loading}
            className={`w-full p-6 rounded-2xl border-2 transition-all ${
              selectedRole === "tenant"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selectedRole === "tenant" ? "bg-blue-600" : "bg-blue-100"
              }`}>
                <Home size={32} className={selectedRole === "tenant" ? "text-white" : "text-blue-600"} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {language === "it" ? "Inquilino" : "Tenant"}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === "it"
                    ? "Cerchi una casa o un coinquilino? Trova la soluzione perfetta per te."
                    : "Looking for a home or roommate? Find the perfect solution for you."}
                </p>
              </div>
              {selectedRole === "tenant" && (
                <ArrowRight size={24} className="text-blue-600 flex-shrink-0" />
              )}
            </div>
          </motion.button>

          {/* Landlord Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect("landlord")}
            disabled={loading}
            className={`w-full p-6 rounded-2xl border-2 transition-all ${
              selectedRole === "landlord"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selectedRole === "landlord" ? "bg-blue-600" : "bg-blue-100"
              }`}>
                <Users size={32} className={selectedRole === "landlord" ? "text-white" : "text-blue-600"} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {language === "it" ? "Proprietario" : "Landlord"}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === "it"
                    ? "Hai una proprietà da affittare? Trova inquilini affidabili e verifica."
                    : "Have a property to rent? Find reliable and verified tenants."}
                </p>
              </div>
              {selectedRole === "landlord" && (
                <ArrowRight size={24} className="text-blue-600 flex-shrink-0" />
              )}
            </div>
          </motion.button>
        </div>

        {loading && (
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
