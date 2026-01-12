import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import logo from "@assets/logo-removebg-preview_1765398497308.png";
import { useSignIn, useSignUp, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { Mail, Lock, User, ArrowLeft, Globe } from "lucide-react";

type AuthMode = "welcome" | "login" | "signup";

export default function Auth() {
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  
  // Check URL params for mode (e.g., /auth?mode=login)
  const urlParams = new URLSearchParams(window.location.search);
  const urlMode = urlParams.get("mode") as AuthMode | null;
  const [mode, setMode] = useState<AuthMode>(urlMode || "welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  useEffect(() => {
    // If user is already signed in, redirect
    if (isLoaded && isSignedIn) {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/auth') {
        window.location.href = "/";
      }
    }
  }, [isLoaded, isSignedIn]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || !signInLoaded) {
      setError("Authentication not ready. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // Clear onboarding flags for first-time login if needed
        const userId = result.createdUserId;
        if (userId) {
          try {
            const response = await fetch("/api/auth/user", {
              headers: {
                'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`,
              },
            });
            if (response.ok) {
              const user = await response.json();
              if (!user?.role) {
                // User has no role - clear onboarding flags
                localStorage.removeItem(`tenantapp:userRole:${userId}`);
                localStorage.removeItem(`tenantapp:onboardingCompleted_TENANT:${userId}`);
                localStorage.removeItem(`tenantapp:onboardingCompleted_LANDLORD:${userId}`);
                localStorage.removeItem(`tenantapp:verificationStatus_TENANT:${userId}`);
                localStorage.removeItem(`tenantapp:landlordCriteriaSaved:${userId}`);
              }
            }
          } catch (err) {
            // Ignore errors
          }
        }
        
        setLoading(false);
        window.location.href = "/";
      } else {
        setError("Sign in incomplete. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.errors?.[0]?.message || err.message || (language === "it" ? "Email o password non validi" : "Invalid email or password"));
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !signUpLoaded) {
      setError("Authentication not ready. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await signUp.create({
        emailAddress: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Send email verification code or complete signup
      if (result.status === 'missing_requirements') {
        // Need to verify email
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setError(language === "it" 
          ? "Verifica la tua email per completare la registrazione" 
          : "Please verify your email to complete signup");
        setLoading(false);
        return;
      }

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // CRITICAL: Clear ALL onboarding flags for new user signup
        const userId = result.createdUserId;
        console.log('[Auth] New user signup - clearing onboarding flags:', userId);
        
        if (userId) {
          // Clear ALL user-scoped onboarding flags
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`tenantapp:`) && key.includes(`:${userId}`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          // Also clear any non-scoped keys (legacy)
          ['tenantapp:userRole', 'tenantapp:onboardingCompleted_TENANT', 'tenantapp:onboardingCompleted_LANDLORD', 
           'tenantapp:verificationStatus_TENANT', 'tenantapp:landlordCriteriaSaved'].forEach(key => {
            localStorage.removeItem(key);
          });
        }
        
        setLoading(false);
        console.log('[Auth] Redirecting new user to /role');
        window.location.href = "/role";
      } else {
        setError("Sign up incomplete. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.errors?.[0]?.message || err.message || (language === "it" ? "Impossibile creare l'account" : 'Failed to create account'));
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || !signInLoaded) {
      setError("Authentication not ready. Please try again.");
      return;
    }

    setResetPasswordLoading(true);
    setError(null);
    
    if (!email.trim()) {
      setError(language === "it" ? "Inserisci la tua email" : "Please enter your email");
      setResetPasswordLoading(false);
      return;
    }
    
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim().toLowerCase(),
      });

      setError(null);
      setError(language === "it" 
        ? "Email di reset password inviata! Controlla la tua casella di posta." 
        : "Password reset email sent! Please check your inbox.");
      setResetPasswordMode(false);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || (language === "it" ? "Errore durante il reset della password" : "Error resetting password"));
    }
    setResetPasswordLoading(false);
  };

  const texts = {
    welcome: language === "it" ? "Benvenuto su Tenant" : "Welcome to Tenant",
    tagline: language === "it" 
      ? "Trova la tua corrispondenza perfetta nel mercato degli affitti" 
      : "Find your perfect match in the rental market",
    haveAccount: language === "it" ? "Hai già un account?" : "Already have an account?",
    signInToAccount: language === "it" ? "Accedi al tuo account" : "Sign in to your account",
    orRegister: language === "it" ? "Oppure registrati:" : "Or register:",
    createAccount: language === "it" ? "Crea un nuovo account" : "Create a new account",
    email: language === "it" ? "Email" : "Email",
    password: language === "it" ? "Password" : "Password",
    firstName: language === "it" ? "Nome" : "First Name",
    lastName: language === "it" ? "Cognome" : "Last Name",
    signIn: language === "it" ? "Accedi" : "Sign In",
    signUp: language === "it" ? "Registrati" : "Sign Up",
    back: language === "it" ? "Indietro" : "Back",
  };

  if (mode === "login") {
    return (
      <div className="min-h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="text-center mb-6">
            <img src={logo} alt="Tenant Logo" className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-white mb-2">{texts.signInToAccount}</h1>
          </div>

          {error && (
            <div className="bg-red-500 text-white p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={resetPasswordMode ? handleResetPassword : handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {texts.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder={texts.email}
                />
              </div>
            </div>

            {!resetPasswordMode && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {texts.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder={texts.password}
                  />
                </div>
              </div>
            )}

            {!resetPasswordMode && (
              <button
                type="button"
                onClick={() => setResetPasswordMode(true)}
                className="text-white text-sm hover:underline"
              >
                {language === "it" ? "Password dimenticata?" : "Forgot password?"}
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || resetPasswordLoading || !signInLoaded}
              className="w-full bg-white text-blue-600 font-bold text-lg py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetPasswordLoading || loading ? "..." : (resetPasswordMode 
                ? (language === "it" ? "Invia email di reset" : "Send reset email")
                : texts.signIn)}
            </motion.button>

            {resetPasswordMode && (
              <button
                type="button"
                onClick={() => setResetPasswordMode(false)}
                className="text-white text-sm hover:underline"
              >
                {texts.back}
              </button>
            )}
          </form>

          <div className="text-center">
            <button
              onClick={() => setMode("signup")}
              className="text-white text-sm hover:underline"
            >
              {language === "it" ? "Non hai un account? Registrati" : "Don't have an account? Sign up"}
            </button>
          </div>

          <button
            onClick={() => setMode("welcome")}
            className="flex items-center gap-2 text-white text-sm hover:underline"
          >
            <ArrowLeft size={16} />
            {texts.back}
          </button>
        </motion.div>
      </div>
    );
  }

  if (mode === "signup") {
    return (
      <div className="min-h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="text-center mb-6">
            <img src={logo} alt="Tenant Logo" className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-white mb-2">{texts.createAccount}</h1>
          </div>

          {error && (
            <div className="bg-red-500 text-white p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {texts.firstName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder={texts.firstName}
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  {texts.lastName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder={texts.lastName}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {texts.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder={texts.email}
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {texts.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder={texts.password}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !signUpLoaded}
              className="w-full bg-white text-blue-600 font-bold text-lg py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : texts.signUp}
            </motion.button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setMode("login")}
              className="text-white text-sm hover:underline"
            >
              {texts.haveAccount} {texts.signIn}
            </button>
          </div>

          <button
            onClick={() => setMode("welcome")}
            className="flex items-center gap-2 text-white text-sm hover:underline"
          >
            <ArrowLeft size={16} />
            {texts.back}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-6 relative overflow-hidden pb-24">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setLanguage(language === "it" ? "en" : "it")}
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
        >
          <Globe size={20} />
          <span className="font-medium">{language === "it" ? "EN" : "IT"}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center z-10"
      >
        <img src={logo} alt="Tenant Logo" className="w-32 h-32 mx-auto" />
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white">{texts.welcome}</h1>
          <p className="text-xl text-blue-100">{texts.tagline}</p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode("login")}
            className="w-full bg-white text-blue-600 font-bold text-lg py-4 px-6 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            {texts.signIn}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode("signup")}
            className="w-full bg-blue-700 text-white font-bold text-lg py-4 px-6 rounded-2xl hover:bg-blue-800 transition-colors border-2 border-white/20"
          >
            {texts.signUp}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}




