import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import logo from "@assets/logo-removebg-preview_1765398497308.png";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, User, ArrowLeft, Globe } from "lucide-react";

type AuthMode = "welcome" | "login" | "signup";

export default function Auth() {
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  
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
    const handleAuthFlow = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      if (code && state) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            console.error('OAuth callback error:', error);
            setError(error.message);
          }
        } catch (err) {
          console.error('OAuth exchange failed:', err);
          setError('Authentication failed. Please try again.');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // After OAuth or initial load, redirect to "/" so OnboardingGate decides the route
      // This ensures onboarding is always checked
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && (window.location.pathname === '/' || window.location.pathname === '/auth')) {
        // Clear onboarding flags for first-time login (if needed)
        const userId = session.user.id;
        // Don't clear here - let OnboardingGate handle it based on actual state
        // Just redirect to "/" so OnboardingGate can decide
        window.location.href = "/";
      }
    };
    handleAuthFlow();

    // REMOVED: onAuthStateChange redirect logic
    // OnboardingGate is now the single source of truth for routing decisions
    // We don't want auth listeners to override onboarding navigation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only handle sign out - let OnboardingGate handle sign in routing
      if (event === 'SIGNED_OUT') {
        // Clear all onboarding state on sign out
        if (typeof window !== 'undefined') {
          // Clear all localStorage keys that start with tenantapp:
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tenantapp:')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        // Redirect to auth page
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth?mode=login';
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log('Attempting login with:', { 
      email: email.trim(), 
      emailLength: email.trim().length,
      passwordLength: password.length
    });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });
    
    if (error) {
      console.error('Login error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      setError(language === "it" ? "Email o password non validi" : `Invalid email or password: ${error.message}`);
      setLoading(false);
      return;
    }
    
    console.log('Login successful:', { 
      userEmail: data?.user?.email,
      userId: data?.user?.id,
      hasSession: !!data?.session 
    });

    // On successful login, wait for session to be established then redirect
    if (data?.session) {
      console.log('Login successful, waiting for auth state...');
      
      // Wait for session to be established and auth state to sync
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to fetch user data to determine redirect
      try {
        const userResponse = await fetch("/api/auth/user", {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
          },
          credentials: "include",
        });
        
        if (userResponse.ok) {
          const user = await userResponse.json();
          setLoading(false);
          
          // IMPORTANT: For FIRST LOGIN, clear onboarding flags if user has no role
          const userId = data.user.id;
          if (userId && !user?.role) {
            // User has no role - this is likely a first login - clear onboarding
            localStorage.removeItem(`tenantapp:userRole:${userId}`);
            localStorage.removeItem(`tenantapp:onboardingCompleted_TENANT:${userId}`);
            localStorage.removeItem(`tenantapp:onboardingCompleted_LANDLORD:${userId}`);
            localStorage.removeItem(`tenantapp:verificationStatus_TENANT:${userId}`);
            localStorage.removeItem(`tenantapp:landlordCriteriaSaved:${userId}`);
          }
          
          // ALWAYS redirect to "/" after login so OnboardingGate decides the route
          // This ensures onboarding is always checked
          window.location.href = "/";
        } else {
          setLoading(false);
          // ALWAYS redirect to "/" so OnboardingGate decides the route
          window.location.href = "/";
        }
      } catch (err) {
        console.error('Error fetching user after login:', err);
        setLoading(false);
        // ALWAYS redirect to "/" so OnboardingGate decides the route
        window.location.href = "/";
      }
      return;
    }
    setLoading(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      });

      // Check if response has content before parsing
      const contentType = response.headers.get('content-type');
      let data: any = {};
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            setError(language === "it" ? "Errore nella risposta del server" : "Server response error");
            setLoading(false);
            return;
          }
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          setError(language === "it" 
            ? "Server API non disponibile. Assicurati che il server sia in esecuzione." 
            : "API server not available. Make sure the server is running.");
        } else {
          setError(data.message || (language === "it" ? "Impossibile creare l'account" : 'Failed to create account'));
        }
        setLoading(false);
        return;
      }

      // Sign in automatically after signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Wait for session to be fully established and auth state to sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verify session exists before redirecting
      const { data: { session: verifySession } } = await supabase.auth.getSession();
      if (!verifySession) {
        setError(language === "it" ? "Errore di autenticazione. Riprova." : "Authentication error. Please try again.");
        setLoading(false);
        return;
      }

      // CRITICAL: Clear ALL onboarding flags for new user signup
      // This ensures new users ALWAYS go through onboarding
      const userId = verifySession.user.id;
      console.log('[Auth] New user signup - clearing onboarding flags:', userId);
      
      if (userId) {
        // Clear ALL user-scoped onboarding flags (including role)
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
      
      // Clear loading state
      setLoading(false);
      
      // DIRECT redirect to role selection for new users
      // This is more reliable than going through OnboardingGate
      console.log('[Auth] Redirecting new user to /role');
      window.location.href = "/role";
      
    } catch (err: any) {
      console.error("Signup error:", err);
      setLoading(false);
      
      // Even on error, if we have a session, try to redirect
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // We have a session, redirect to role selection anyway
          setTimeout(() => {
            setLocation("/role");
          }, 100);
          return;
        }
      } catch (sessionErr) {
        console.error("Session check error:", sessionErr);
      }
      
      // Show error only if we don't have a session
      if (err.message?.includes('JSON') || err.message?.includes('Unexpected end')) {
        setError(language === "it" 
          ? "Impossibile connettersi al server. Assicurati che il server sia in esecuzione." 
          : "Cannot connect to server. Make sure the server is running.");
      } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError(language === "it" 
          ? "Errore di connessione. Controlla la tua connessione di rete." 
          : "Connection error. Please check your network connection.");
      } else {
        setError(err.message || (language === "it" ? "Si è verificato un errore" : 'An error occurred'));
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordLoading(true);
    setError(null);
    
    if (!email.trim()) {
      setError(language === "it" ? "Inserisci la tua email" : "Please enter your email");
      setResetPasswordLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message || (language === "it" ? "Impossibile inviare l'email di reset" : "Failed to send reset email"));
        setResetPasswordLoading(false);
        return;
      }

      setError(null);
      // Show success message
      setError(language === "it" 
        ? "Email di reset password inviata! Controlla la tua casella di posta." 
        : "Password reset email sent! Please check your inbox.");
      setResetPasswordMode(false);
    } catch (err: any) {
      setError(err.message || (language === "it" ? "Errore durante il reset della password" : "Error resetting password"));
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
          className="w-full max-w-sm"
        >
          <button 
            onClick={() => setMode("welcome")}
            className="flex items-center gap-2 text-white mb-6"
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
            {texts.back}
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{texts.signInToAccount}</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={resetPasswordMode ? handleResetPassword : handleEmailSignIn} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder={texts.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="input-email"
                />
              </div>
              {!resetPasswordMode && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    placeholder={texts.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    data-testid="input-password"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={loading || resetPasswordLoading}
                className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                data-testid="button-submit-login"
              >
                {loading || resetPasswordLoading ? "..." : (resetPasswordMode ? (language === "it" ? "Resetta Password" : "Reset Password") : texts.signIn)}
              </button>
            </form>
            <div className="space-y-2">
              <p className="text-center text-sm text-gray-600 mt-4">
                {language === "it" ? "Non hai un account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setResetPasswordMode(false);
                  }}
                  className="text-blue-500 font-semibold hover:underline"
                  data-testid="link-signup-from-login"
                >
                  {texts.signUp}
                </button>
              </p>
              <p className="text-center text-sm text-gray-600">
                {resetPasswordMode ? (
                  <>
                    {language === "it" ? "Ricordi la password? " : "Remember your password? "}
                    <button
                      type="button"
                      onClick={() => setResetPasswordMode(false)}
                      className="text-blue-500 font-semibold hover:underline"
                      data-testid="link-back-to-login"
                    >
                      {language === "it" ? "Accedi" : "Sign In"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResetPasswordMode(true)}
                    className="text-blue-500 font-semibold hover:underline"
                    data-testid="link-reset-password"
                  >
                    {language === "it" ? "Password dimenticata?" : "Forgot password?"}
                  </button>
                )}
              </p>
            </div>
          </div>
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
          className="w-full max-w-sm"
        >
          <button 
            onClick={() => setMode("welcome")}
            className="flex items-center gap-2 text-white mb-6"
            data-testid="button-back"
          >
            <ArrowLeft size={20} />
            {texts.back}
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{texts.createAccount}</h2>
            
            {error && (
              <div className={`p-3 rounded-xl mb-4 text-sm ${error.includes("email") || error.includes("Email") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={texts.firstName}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="input-firstname"
                />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={texts.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="input-lastname"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder={texts.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder={texts.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                  data-testid="input-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                data-testid="button-submit-signup"
              >
                {loading ? "..." : texts.signUp}
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                {language === "it" ? "Hai già un account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-blue-500 font-semibold hover:underline"
                  data-testid="link-login-from-signup"
                >
                  {texts.signIn}
                </button>
              </p>
              <p className="text-center text-xs text-gray-500 mt-2">
                {language === "it" ? "Registrandoti accetti i nostri " : "By signing up you agree to our "}
                <a href="/terms" className="text-blue-500 underline" data-testid="link-terms-signup">
                  {language === "it" ? "Termini" : "Terms"}
                </a>
                {" & "}
                <a href="/privacy-policy" className="text-blue-500 underline" data-testid="link-privacy-signup">
                  Privacy
                </a>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-6 pb-24 relative overflow-hidden">
      <button 
        onClick={() => setLanguage(language === "en" ? "it" : "en")}
        className="absolute top-6 right-6 flex items-center gap-2 font-semibold text-sm bg-white/20 text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
        data-testid="button-language-toggle"
        title={language === "it" ? "Switch to English" : "Passa all'Italiano"}
      >
        <Globe size={16} />
        <span>{language === "it" ? "IT" : "EN"}</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col gap-6 z-10"
      >
        <div className="text-center space-y-2 flex flex-col items-center">
          <img src={logo} alt="Tenant Logo" className="w-20 h-20 object-contain mb-2" data-testid="img-logo" />
          <h1 className="text-3xl font-black text-white tracking-tight">Tenant</h1>
          <h2 className="text-2xl font-bold text-white">{texts.welcome}</h2>
          <p className="text-sm text-white/80">{texts.tagline}</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-center text-white/80 text-sm">{texts.haveAccount}</p>
          <button 
            onClick={() => setMode("login")}
            className="w-full bg-blue-300/30 backdrop-blur-sm text-white font-semibold py-4 rounded-2xl hover:bg-blue-300/50 transition-colors"
            data-testid="button-goto-login"
          >
            {texts.signInToAccount}
          </button>

          <p className="text-center text-white/80 text-sm">{texts.orRegister}</p>
          <button 
            onClick={() => setMode("signup")}
            className="w-full bg-blue-300/30 backdrop-blur-sm text-white font-semibold py-4 rounded-2xl hover:bg-blue-300/50 transition-colors"
            data-testid="button-goto-signup"
          >
            {texts.createAccount}
          </button>
        </div>

        <div className="text-center text-xs text-white/60 mt-4">
          <a href="/terms" className="underline hover:text-white/80" data-testid="link-terms">
            {language === "it" ? "Termini di Servizio" : "Terms of Service"}
          </a>
          {" | "}
          <a href="/privacy-policy" className="underline hover:text-white/80" data-testid="link-privacy">
            {language === "it" ? "Privacy Policy" : "Privacy Policy"}
          </a>
        </div>
      </motion.div>
    </div>
  );
}
