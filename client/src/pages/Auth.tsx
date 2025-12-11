import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import logo from "@assets/logo-removebg-preview_1765398497308.png";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";

type AuthMode = "welcome" | "login" | "signup";

export default function Auth() {
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const response = await fetch("/api/auth/user", {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        if (response.ok) {
          const user = await response.json();
          if (user?.role) {
            setLocation(`/${user.role}`);
          } else {
            setLocation("/onboarding");
          }
        }
      }
    };
    handleAuthFlow();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const response = await fetch("/api/auth/user", {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        if (response.ok) {
          const user = await response.json();
          if (user?.role) {
            setLocation(`/${user.role}`);
          } else {
            setLocation("/onboarding");
          }
        } else {
          setLocation("/onboarding");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(language === "it" ? "Email o password non validi" : "Invalid email or password");
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

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create account');
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      setLocation("/onboarding");
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
    setLoading(false);
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
      <div className="min-h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
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

            <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                  data-testid="input-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                data-testid="button-submit-login"
              >
                {loading ? "..." : texts.signIn}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === "signup") {
    return (
      <div className="min-h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
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
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <button 
        onClick={() => setLanguage(language === "en" ? "it" : "en")}
        className="absolute top-6 right-6 font-bold text-sm bg-white/20 text-white px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
        data-testid="button-language-toggle"
      >
        {language.toUpperCase()}
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
      </motion.div>
    </div>
  );
}
