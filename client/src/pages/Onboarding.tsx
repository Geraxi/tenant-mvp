import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, User, Building2, Search, Heart, ShieldCheck, ArrowRight, MapPin, Euro, Calendar, Users, Home, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    role: "" as "tenant" | "landlord" | "",
    city: "",
    age: "",
    occupation: "",
    bio: "",
    budget: "",
    lookingFor: "homes" as "homes" | "roommates",
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.name,
      }));
    }
  }, [user]);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in first</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to complete onboarding</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="bg-primary text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg"
          data-testid="button-login-onboarding"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleRoleSelect = (role: "tenant" | "landlord") => {
    setFormData({ ...formData, role });
    handleNext();
  };

  const handleComplete = async () => {
    if (!formData.name || !formData.role || !user) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await api.updateUser(user.id, {
        name: formData.name,
        role: formData.role,
        city: formData.city || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        occupation: formData.occupation || undefined,
        bio: formData.bio || undefined,
        budget: formData.budget ? parseInt(formData.budget) : undefined,
      });

      if (formData.role === "tenant" && formData.lookingFor === "roommates") {
        await api.createRoommate({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : 25,
          occupation: formData.occupation || "Professional",
          bio: formData.bio || `Hi! I'm ${formData.name} and I'm looking for a roommate.`,
          budget: formData.budget ? parseInt(formData.budget) : 800,
          moveInDate: "Flexible",
          preferences: ["Non-smoker", "Clean"],
          images: [user.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"],
        });
      }

      toast({
        title: "Welcome to Tenant!",
        description: "Your profile has been created successfully",
      });
      setLocation(`/${formData.role}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const progressPercentage = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-full bg-white flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <main className="flex-1 flex flex-col p-6 pt-12 relative z-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 bg-blue-100 rounded-full opacity-50 blur-2xl animate-pulse" />
                  <div className="relative z-10 bg-white rounded-3xl shadow-xl p-6 border border-gray-100 transform rotate-[-6deg]">
                    <Search size={48} className="text-primary mb-4" />
                    <div className="h-2 w-24 bg-gray-100 rounded mb-2" />
                    <div className="h-2 w-16 bg-gray-100 rounded" />
                  </div>
                  <div className="absolute bottom-0 right-0 z-20 bg-white rounded-3xl shadow-xl p-6 border border-gray-100 transform rotate-[6deg]">
                    <Heart size={48} className="text-secondary mb-4" />
                    <div className="h-2 w-24 bg-gray-100 rounded mb-2" />
                    <div className="h-2 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <h2 className="text-3xl font-black text-gray-900 leading-tight">
                  Find your perfect <br/>
                  <span className="text-primary">home</span> or <span className="text-secondary">roommate</span>.
                </h2>
                <p className="text-lg text-gray-500 font-medium">
                  Swipe through thousands of verified listings and connect with people who match your lifestyle.
                </p>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Security */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <div className="absolute inset-0 bg-green-100 rounded-full opacity-50 blur-2xl animate-pulse" />
                  <ShieldCheck size={120} className="text-green-500 relative z-10 drop-shadow-2xl" />
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <h2 className="text-3xl font-black text-gray-900 leading-tight">
                  Safe, secure, and <br/>
                  <span className="text-green-500">verified</span>.
                </h2>
                <p className="text-lg text-gray-500 font-medium">
                  We verify every landlord and listing to ensure you can rent with total peace of mind.
                </p>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Next <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 3: Role Selection */}
          {step === 3 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-gray-900 mb-2">What brings you here?</h2>
                <p className="text-gray-500">This helps us personalize your experience</p>
              </div>

              <div className="grid gap-4 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect("tenant")}
                  className={`group p-6 rounded-3xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                    formData.role === "tenant" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-100 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-4 z-10 relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      formData.role === "tenant" ? "bg-primary text-white" : "bg-blue-100 text-primary group-hover:bg-primary group-hover:text-white"
                    }`}>
                      <User size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">I'm looking for a place</h3>
                      <p className="text-sm text-gray-500">Find homes or roommates</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect("landlord")}
                  className={`group p-6 rounded-3xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                    formData.role === "landlord" 
                      ? "border-secondary bg-secondary/5" 
                      : "border-gray-100 hover:border-secondary/50 hover:bg-secondary/5"
                  }`}
                >
                  <div className="flex items-center gap-4 z-10 relative">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      formData.role === "landlord" ? "bg-secondary text-white" : "bg-purple-100 text-secondary group-hover:bg-secondary group-hover:text-white"
                    }`}>
                      <Building2 size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">I'm a landlord</h3>
                      <p className="text-sm text-gray-500">List properties and find tenants</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-secondary transition-colors" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Role-specific questions */}
          {step === 4 && (
            <motion.div
              key="step4b"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              {formData.role === "tenant" ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Tell us about yourself</h2>
                    <p className="text-gray-500">This helps landlords get to know you</p>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                          <MapPin size={14} /> City
                        </label>
                        <input 
                          type="text" 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="Milano"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                          <Calendar size={14} /> Age
                        </label>
                        <input 
                          type="number" 
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: e.target.value})}
                          placeholder="25"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Occupation</label>
                      <input 
                        type="text" 
                        value={formData.occupation}
                        onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                        placeholder="Software Engineer"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <Euro size={14} /> Monthly budget
                      </label>
                      <input 
                        type="number" 
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        placeholder="800"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">What are you looking for?</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, lookingFor: "homes"})}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                            formData.lookingFor === "homes" 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-gray-100 text-gray-500 hover:border-gray-200"
                          }`}
                        >
                          <Home size={24} />
                          <span className="font-bold text-sm">Homes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, lookingFor: "roommates"})}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                            formData.lookingFor === "roommates" 
                              ? "border-secondary bg-secondary/5 text-secondary" 
                              : "border-gray-100 text-gray-500 hover:border-gray-200"
                          }`}
                        >
                          <Users size={24} />
                          <span className="font-bold text-sm">Roommates</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">About your property</h2>
                    <p className="text-gray-500">Help us match you with the right tenants</p>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <MapPin size={14} /> Property location
                      </label>
                      <input 
                        type="text" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Milano, Rome, etc."
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">About you (optional)</label>
                      <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Tell tenants a bit about yourself as a landlord..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium resize-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center items-center text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8"
              >
                <CheckCircle2 size={48} className="text-green-500" />
              </motion.div>

              <h2 className="text-2xl font-black text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-500 mb-8 max-w-xs">
                {formData.role === "tenant" 
                  ? "Start swiping to find your perfect place to live."
                  : "Add your first property listing to start finding tenants."}
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 w-full mb-8">
                <div className="flex items-center gap-4 mb-4">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={formData.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">{formData.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email || ''}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    formData.role === "tenant" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                  }`}>
                    {formData.role === "tenant" ? "Tenant" : "Landlord"}
                  </span>
                  {formData.city && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      {formData.city}
                    </span>
                  )}
                  {formData.budget && formData.role === "tenant" && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">
                      €{formData.budget}/month
                    </span>
                  )}
                </div>
              </div>

              <button 
                onClick={handleComplete}
                disabled={loading}
                className={`w-full font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  formData.role === "tenant" 
                    ? "bg-primary text-white shadow-primary/30" 
                    : "bg-secondary text-white shadow-secondary/30"
                }`}
              >
                {loading ? "Setting up your profile..." : (formData.role === "tenant" ? "Start Swiping" : "Add Your First Listing")}
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
