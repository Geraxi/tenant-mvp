import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import logo from "@assets/logo-removebg-preview_1765398497308.png";
import { useSignIn, useSignUp, useAuth as useClerkAuth, OAuthStrategy } from "@clerk/clerk-react";
import { Mail, Lock, User, ArrowLeft, Globe } from "lucide-react";
import { onboardingStorageWeb } from "@/lib/onboarding/storage.web";

type AuthMode = "welcome" | "login" | "signup";

export default function Auth() {
  const { t, language, setLanguage } = useLanguage();
  const [location] = useLocation();
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
    // Check if this is an OAuth callback (Clerk might redirect here with callback params)
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const hasOAuthCallback = searchParams.has("code") || 
                             searchParams.has("state") ||
                             url.hash.includes("__clerk") ||
                             searchParams.has("__clerk_status");
    
    console.log("[Auth] useEffect - Checking auth state:", {
      location,
      hasOAuthCallback,
      isLoaded,
      isSignedIn,
      searchParams: Object.fromEntries(searchParams),
      hash: url.hash,
      fullUrl: window.location.href
    });
    
    // If we have OAuth callback params, redirect to callback handler
    if (hasOAuthCallback && location === "/auth") {
      console.log("[Auth] OAuth callback detected, redirecting to /sso-callback");
      window.location.href = "/sso-callback" + window.location.search + window.location.hash;
      return;
    }
    
    // Wait for Clerk to fully load before checking sign-in status
    if (!isLoaded) {
      console.log("[Auth] Clerk not loaded yet, waiting...");
      return;
    }
    
    // Check if user is signed in (even without visible callback params, Clerk might have completed OAuth)
    // Give it a moment for Clerk to process any pending OAuth callbacks
    setTimeout(async () => {
      const clerk = (window as any).Clerk;
      const hasClerkUser = clerk?.user !== null && clerk?.user !== undefined;
      const hasClerkSession = clerk?.session !== null && clerk?.session !== undefined;
      
      console.log("[Auth] Delayed check:", {
        isSignedIn,
        hasClerkUser,
        hasClerkSession,
        clerkUser: clerk?.user?.id,
        clerkSession: !!clerk?.session
      });
      
      if (isSignedIn || hasClerkUser) {
        console.log("[Auth] User is signed in, redirecting to home");
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/auth') {
          window.location.href = "/";
        }
      }
    }, 1000);
  }, [isLoaded, isSignedIn, location]);

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
        if (setActive) {
          await setActive({ session: result.createdSessionId });
        }
        
        // Clear onboarding flags for first-time login if needed
        // Get userId from Clerk user after sign in
        const clerk = (window as any).Clerk;
        const userId = clerk?.user?.id;
        if (userId) {
          try {
            const clerk = (window as any).Clerk;
            const session = clerk?.session;
            const token = session ? await session.getToken() : null;
            
            if (token) {
              const response = await fetch("/api/auth/user", {
                headers: {
                  'Authorization': `Bearer ${token}`,
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

  const handleOAuthSignIn = async (strategy: OAuthStrategy) => {
    if (!signIn || !signInLoaded) {
      setError("Authentication not ready. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For native iOS apps, Clerk should handle OAuth automatically
      // But we need to use proper redirect URLs
      const isNative = (window as any).Capacitor?.isNativePlatform();
      const currentOrigin = window.location.origin;
      
      // Use full URL for redirects - Clerk will handle native app redirects
      // For native apps, Clerk uses deep linking via the app's URL scheme
      // Set both to sso-callback so Clerk redirects there after OAuth
      const redirectUrl = `${currentOrigin}/sso-callback`;
      const redirectUrlComplete = `${currentOrigin}/sso-callback`;

      console.log("[Auth] OAuth Sign In:", { 
        strategy, 
        isNative, 
        redirectUrl, 
        redirectUrlComplete,
        currentOrigin 
      });

      // Clerk will redirect to the OAuth provider, then back to redirectUrl
      // For native apps, Clerk automatically handles deep linking
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete,
      });
    } catch (err: any) {
      console.error("OAuth sign in error:", err);
      const errorMessage = err.errors?.[0]?.message || err.message || "Failed to sign in";
      setError(errorMessage);
      setLoading(false);
      
      // For Apple Sign In errors, provide more helpful message
      if (strategy === "oauth_apple" && errorMessage.includes("authorization attempt failed")) {
        setError(language === "it" 
          ? "Errore durante l'autenticazione con Apple. Assicurati che Sign in with Apple sia configurato correttamente."
          : "Error signing in with Apple. Make sure Sign in with Apple is properly configured.");
      }
    }
  };

  const handleOAuthSignUp = async (strategy: OAuthStrategy) => {
    if (!signUp || !signUpLoaded) {
      setError("Authentication not ready. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For native iOS apps, Clerk should handle OAuth automatically
      const isNative = (window as any).Capacitor?.isNativePlatform();
      const currentOrigin = window.location.origin;
      
      // Use full URL for redirects - Clerk will handle native app redirects
      const redirectUrl = `${currentOrigin}/sso-callback`;
      // Set both to sso-callback - we'll check if user needs role selection in the callback handler
      const redirectUrlComplete = `${currentOrigin}/sso-callback`;

      console.log("[Auth] OAuth Sign Up:", { 
        strategy, 
        isNative, 
        redirectUrl, 
        redirectUrlComplete,
        currentOrigin 
      });

      // Clerk will redirect to the OAuth provider, then back to redirectUrl
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl,
        redirectUrlComplete,
      });
    } catch (err: any) {
      console.error("OAuth sign up error:", err);
      const errorMessage = err.errors?.[0]?.message || err.message || "Failed to sign up";
      setError(errorMessage);
      setLoading(false);
      
      // For Apple Sign In errors, provide more helpful message
      if (strategy === "oauth_apple" && errorMessage.includes("authorization attempt failed")) {
        setError(language === "it" 
          ? "Errore durante la registrazione con Apple. Assicurati che Sign in with Apple sia configurato correttamente."
          : "Error signing up with Apple. Make sure Sign in with Apple is properly configured.");
      }
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
        if (setActive) {
          await setActive({ session: result.createdSessionId });
        }
        
        // Wait for Clerk session to be fully established
        // This ensures OnboardingGate can properly detect the user
        let waitAttempts = 0;
        while (waitAttempts < 20) {
          const clerk = (window as any).Clerk;
          if (clerk?.user?.id && clerk?.session) {
            break; // Session is ready
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          waitAttempts++;
        }
        
        // CRITICAL: Clear ALL onboarding flags for new user signup
        // Get userId from Clerk user after sign up
        const clerk = (window as any).Clerk;
        const userId = clerk?.user?.id;
        
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
        // Use window.location.href for hard redirect
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

          {/* OAuth Sign In Options */}
          <div className="space-y-3 mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/80">
                  {language === "it" ? "Oppure continua con" : "Or continue with"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthSignIn("oauth_google")}
                disabled={loading || resetPasswordLoading || !signInLoaded}
                className="flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm">Google</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthSignIn("oauth_apple")}
                disabled={loading || resetPasswordLoading || !signInLoaded}
                className="flex items-center justify-center gap-2 bg-black text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-sm">Apple</span>
              </motion.button>
            </div>
          </div>

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

          {/* OAuth Sign Up Options */}
          <div className="space-y-3 mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/80">
                  {language === "it" ? "Oppure continua con" : "Or continue with"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthSignUp("oauth_google")}
                className="flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm">Google</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuthSignUp("oauth_apple")}
                className="flex items-center justify-center gap-2 bg-black text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-sm">Apple</span>
              </motion.button>
            </div>
          </div>

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
            className="w-full bg-orange-500 text-white font-bold text-lg py-4 px-6 rounded-2xl hover:bg-orange-600 transition-colors"
          >
            {language === "it" ? "Accedi al tuo account" : "Sign in to your account"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode("signup")}
            className="w-full bg-orange-500 text-white font-bold text-lg py-4 px-6 rounded-2xl hover:bg-orange-600 transition-colors"
          >
            {language === "it" ? "Crea un nuovo account" : "Create a new account"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

