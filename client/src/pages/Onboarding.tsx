import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, User, Building2, Search, Heart, ShieldCheck, ArrowRight, MapPin, Euro, Calendar, Users, Home, CheckCircle2, Camera, Plus, X, Bed, Sofa, PawPrint, Cigarette, Moon, Music, Dumbbell, Coffee } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

export default function Onboarding() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "" as "tenant" | "landlord" | "",
    city: "",
    age: "",
    occupation: "",
    bio: "",
    budget: "",
    lookingFor: ["homes"] as ("homes" | "roommates")[],
    images: [] as string[],
    // Property preferences
    propertyPrefs: {
      minPrice: "",
      maxPrice: "",
      propertyTypes: [] as string[],
      minBeds: "",
      furnished: null as boolean | null,
      petsAllowed: null as boolean | null,
    },
    // Roommate preferences
    roommatePrefs: {
      ageRange: "" as "18-25" | "25-35" | "35+" | "",
      lifestyle: [] as string[],
      habits: [] as string[],
    },
  });

  const toggleLookingFor = (option: "homes" | "roommates") => {
    setFormData(prev => {
      const current = prev.lookingFor;
      if (current.includes(option)) {
        if (current.length === 1) return prev;
        return { ...prev, lookingFor: current.filter(o => o !== option) };
      } else {
        return { ...prev, lookingFor: [...current, option] };
      }
    });
  };

  const togglePropertyType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      propertyPrefs: {
        ...prev.propertyPrefs,
        propertyTypes: prev.propertyPrefs.propertyTypes.includes(type)
          ? prev.propertyPrefs.propertyTypes.filter(t => t !== type)
          : [...prev.propertyPrefs.propertyTypes, type],
      },
    }));
  };

  const toggleLifestyle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      roommatePrefs: {
        ...prev.roommatePrefs,
        lifestyle: prev.roommatePrefs.lifestyle.includes(item)
          ? prev.roommatePrefs.lifestyle.filter(l => l !== item)
          : [...prev.roommatePrefs.lifestyle, item],
      },
    }));
  };

  const toggleHabit = (item: string) => {
    setFormData(prev => ({
      ...prev,
      roommatePrefs: {
        ...prev.roommatePrefs,
        habits: prev.roommatePrefs.habits.includes(item)
          ? prev.roommatePrefs.habits.filter(h => h !== item)
          : [...prev.roommatePrefs.habits, item],
      },
    }));
  };

  useEffect(() => {
    if (user) {
      if (user.role) {
        setLocation(`/${user.role}`);
        return;
      }
      setFormData(prev => ({
        ...prev,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.name,
      }));
    }
  }, [user, setLocation]);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {language === "it" ? "Accedi prima" : "Please sign in first"}
        </h2>
        <p className="text-gray-500 mb-6">
          {language === "it" ? "Devi accedere per completare la registrazione" : "You need to be logged in to complete onboarding"}
        </p>
        <button 
          onClick={() => setLocation("/")}
          className="bg-primary text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg"
          data-testid="button-login-onboarding"
        >
          {language === "it" ? "Accedi" : "Sign In"}
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string].slice(0, 6),
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Calculate total steps based on role and lookingFor
  const getTotalSteps = () => {
    if (formData.role === "landlord") return 6; // Welcome, Security, Role, Info, Photos, Confirm
    // Tenant: Welcome, Security, Role, Info, Photos, [PropertyPrefs], [RoommatePrefs], Confirm
    let steps = 6;
    if (formData.lookingFor.includes("homes")) steps++;
    if (formData.lookingFor.includes("roommates")) steps++;
    return steps;
  };

  const handleComplete = async () => {
    if (!formData.name || !formData.role || !user) {
      toast({
        title: language === "it" ? "Informazioni mancanti" : "Missing information",
        description: language === "it" ? "Completa tutti i campi obbligatori" : "Please complete all required fields",
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
        lookingFor: formData.role === "tenant" ? formData.lookingFor : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        propertyPrefs: formData.role === "tenant" && formData.lookingFor.includes("homes") 
          ? {
              minPrice: formData.propertyPrefs.minPrice ? parseInt(formData.propertyPrefs.minPrice) : null,
              maxPrice: formData.propertyPrefs.maxPrice ? parseInt(formData.propertyPrefs.maxPrice) : null,
              propertyTypes: formData.propertyPrefs.propertyTypes,
              minBeds: formData.propertyPrefs.minBeds ? parseInt(formData.propertyPrefs.minBeds) : null,
              furnished: formData.propertyPrefs.furnished,
              petsAllowed: formData.propertyPrefs.petsAllowed,
            }
          : undefined,
        roommatePrefs: formData.role === "tenant" && formData.lookingFor.includes("roommates")
          ? {
              ageRange: formData.roommatePrefs.ageRange || null,
              lifestyle: formData.roommatePrefs.lifestyle,
              habits: formData.roommatePrefs.habits,
            }
          : undefined,
      });

      if (formData.role === "tenant" && formData.lookingFor.includes("roommates")) {
        await api.createRoommate({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : 25,
          occupation: formData.occupation || "Professional",
          bio: formData.bio || `Hi! I'm ${formData.name} and I'm looking for a roommate.`,
          budget: formData.budget ? parseInt(formData.budget) : 800,
          moveInDate: "Flexible",
          preferences: formData.roommatePrefs.lifestyle.concat(formData.roommatePrefs.habits),
          images: formData.images.length > 0 ? formData.images : [user.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"],
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: language === "it" ? "Benvenuto su Tenant!" : "Welcome to Tenant!",
        description: language === "it" ? "Il tuo profilo e stato creato" : "Your profile has been created successfully",
      });
      setLocation(`/${formData.role}`);
    } catch (error: any) {
      toast({
        title: language === "it" ? "Errore" : "Error",
        description: error.message || (language === "it" ? "Impossibile aggiornare il profilo" : "Failed to update profile"),
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

  const totalSteps = getTotalSteps();
  const progressPercentage = (step / totalSteps) * 100;

  const propertyTypes = [
    { id: "apartment", label: language === "it" ? "Appartamento" : "Apartment", icon: Building2 },
    { id: "house", label: language === "it" ? "Casa" : "House", icon: Home },
    { id: "studio", label: "Studio", icon: Bed },
    { id: "room", label: language === "it" ? "Stanza" : "Room", icon: Sofa },
  ];

  const lifestyleOptions = [
    { id: "early_bird", label: language === "it" ? "Mattiniero" : "Early Bird", icon: Coffee },
    { id: "night_owl", label: language === "it" ? "Nottambulo" : "Night Owl", icon: Moon },
    { id: "active", label: language === "it" ? "Attivo" : "Active", icon: Dumbbell },
    { id: "social", label: language === "it" ? "Socievole" : "Social", icon: Users },
  ];

  const habitOptions = [
    { id: "non_smoker", label: language === "it" ? "Non fumatore" : "Non-smoker", icon: Cigarette },
    { id: "pet_friendly", label: language === "it" ? "Ama animali" : "Pet-friendly", icon: PawPrint },
    { id: "quiet", label: language === "it" ? "Tranquillo" : "Quiet", icon: Moon },
    { id: "music_lover", label: language === "it" ? "Ama musica" : "Music lover", icon: Music },
  ];

  // Determine which step content to show based on role and preferences
  const getStepContent = () => {
    // Steps 1-3 are the same for everyone
    if (step <= 3) return step;
    
    if (formData.role === "landlord") {
      // Landlord: 4=Info, 5=Photos, 6=Confirm
      if (step === 4) return "landlord_info";
      if (step === 5) return "photos";
      if (step === 6) return "confirm";
    } else {
      // Tenant: 4=Info, 5=Photos, then preferences, then confirm
      if (step === 4) return "tenant_info";
      if (step === 5) return "photos";
      
      let currentStep = 6;
      if (formData.lookingFor.includes("homes")) {
        if (step === currentStep) return "property_prefs";
        currentStep++;
      }
      if (formData.lookingFor.includes("roommates")) {
        if (step === currentStep) return "roommate_prefs";
        currentStep++;
      }
      if (step === currentStep) return "confirm";
    }
    return "confirm";
  };

  const currentContent = getStepContent();

  return (
    <div className="min-h-full bg-white flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      <main className="flex-1 flex flex-col p-6 pt-12 relative z-10 overflow-y-auto">
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
                  {language === "it" ? (
                    <>Trova la tua <br/><span className="text-primary">casa</span> o <span className="text-secondary">coinquilino</span> perfetti.</>
                  ) : (
                    <>Find your perfect <br/><span className="text-primary">home</span> or <span className="text-secondary">roommate</span>.</>
                  )}
                </h2>
                <p className="text-lg text-gray-500 font-medium">
                  {language === "it" 
                    ? "Scorri tra migliaia di annunci verificati e connettiti con persone che corrispondono al tuo stile di vita."
                    : "Swipe through thousands of verified listings and connect with people who match your lifestyle."}
                </p>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                data-testid="button-get-started"
              >
                {language === "it" ? "Inizia" : "Get Started"} <ArrowRight size={20} />
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
                  {language === "it" ? (
                    <>Sicuro e <span className="text-green-500">verificato</span>.</>
                  ) : (
                    <>Safe, secure, and <br/><span className="text-green-500">verified</span>.</>
                  )}
                </h2>
                <p className="text-lg text-gray-500 font-medium">
                  {language === "it"
                    ? "Verifichiamo ogni proprietario e annuncio per garantirti la massima tranquillita."
                    : "We verify every landlord and listing to ensure you can rent with total peace of mind."}
                </p>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                data-testid="button-next-security"
              >
                {language === "it" ? "Avanti" : "Next"} <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Step 3: Role Selection */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {language === "it" ? "Cosa ti porta qui?" : "What brings you here?"}
                </h2>
                <p className="text-gray-500">
                  {language === "it" ? "Questo ci aiuta a personalizzare la tua esperienza" : "This helps us personalize your experience"}
                </p>
              </div>

              <div className="grid gap-4 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect("tenant")}
                  className="group p-6 rounded-3xl border-2 cursor-pointer transition-all border-gray-100 hover:border-primary/50 hover:bg-primary/5"
                  data-testid="button-role-tenant"
                >
                  <div className="flex items-center gap-4 z-10 relative">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors bg-blue-100 text-primary group-hover:bg-primary group-hover:text-white">
                      <User size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {language === "it" ? "Cerco casa" : "I'm looking for a place"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {language === "it" ? "Trova case o coinquilini" : "Find homes or roommates"}
                      </p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect("landlord")}
                  className="group p-6 rounded-3xl border-2 cursor-pointer transition-all border-gray-100 hover:border-secondary/50 hover:bg-secondary/5"
                  data-testid="button-role-landlord"
                >
                  <div className="flex items-center gap-4 z-10 relative">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors bg-purple-100 text-secondary group-hover:bg-secondary group-hover:text-white">
                      <Building2 size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {language === "it" ? "Sono proprietario" : "I'm a landlord"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {language === "it" ? "Pubblica annunci e trova inquilini" : "List properties and find tenants"}
                      </p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-secondary transition-colors" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Tenant Info Step */}
          {currentContent === "tenant_info" && (
            <motion.div
              key="tenant_info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {language === "it" ? "Parlaci di te" : "Tell us about yourself"}
                </h2>
                <p className="text-gray-500">
                  {language === "it" ? "Questo aiuta i proprietari a conoscerti" : "This helps landlords get to know you"}
                </p>
              </div>

              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      <MapPin size={14} /> {language === "it" ? "Citta" : "City"}
                    </label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Milano"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      data-testid="input-city"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      <Calendar size={14} /> {language === "it" ? "Eta" : "Age"}
                    </label>
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      placeholder="25"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      data-testid="input-age"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Occupazione" : "Occupation"}
                  </label>
                  <input 
                    type="text" 
                    value={formData.occupation}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    placeholder={language === "it" ? "Ingegnere Software" : "Software Engineer"}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                    data-testid="input-occupation"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Euro size={14} /> {language === "it" ? "Budget mensile" : "Monthly budget"}
                  </label>
                  <input 
                    type="number" 
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    placeholder="800"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                    data-testid="input-budget"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Cosa cerchi? (seleziona tutto)" : "What are you looking for? (select all)"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => toggleLookingFor("homes")}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        formData.lookingFor.includes("homes") 
                          ? "border-primary bg-primary/5 text-primary" 
                          : "border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                      data-testid="button-looking-homes"
                    >
                      <Home size={24} />
                      <span className="font-bold text-sm">{language === "it" ? "Case" : "Homes"}</span>
                      {formData.lookingFor.includes("homes") && <CheckCircle2 size={16} className="text-primary" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLookingFor("roommates")}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        formData.lookingFor.includes("roommates") 
                          ? "border-secondary bg-secondary/5 text-secondary" 
                          : "border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                      data-testid="button-looking-roommates"
                    >
                      <Users size={24} />
                      <span className="font-bold text-sm">{language === "it" ? "Coinquilini" : "Roommates"}</span>
                      {formData.lookingFor.includes("roommates") && <CheckCircle2 size={16} className="text-secondary" />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                data-testid="button-next-tenant-info"
              >
                {language === "it" ? "Continua" : "Continue"} <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Landlord Info Step */}
          {currentContent === "landlord_info" && (
            <motion.div
              key="landlord_info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {language === "it" ? "Le tue proprieta" : "About your property"}
                </h2>
                <p className="text-gray-500">
                  {language === "it" ? "Aiutaci a trovare gli inquilini giusti" : "Help us match you with the right tenants"}
                </p>
              </div>

              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <MapPin size={14} /> {language === "it" ? "Posizione" : "Property location"}
                  </label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="Milano, Roma, etc."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                    data-testid="input-landlord-city"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Su di te (opzionale)" : "About you (optional)"}
                  </label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder={language === "it" ? "Racconta agli inquilini qualcosa su di te..." : "Tell tenants a bit about yourself as a landlord..."}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium resize-none"
                    data-testid="input-landlord-bio"
                  />
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                data-testid="button-next-landlord-info"
              >
                {language === "it" ? "Continua" : "Continue"} <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Photo Upload Step */}
          {currentContent === "photos" && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {language === "it" ? "Aggiungi le tue foto" : "Add your photos"}
                </h2>
                <p className="text-gray-500">
                  {language === "it" 
                    ? "Le foto aiutano a creare fiducia (max 6)" 
                    : "Photos help build trust (max 6)"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                      data-testid={`button-remove-image-${index}`}
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
                {formData.images.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors"
                    data-testid="button-add-photo"
                  >
                    <Camera size={24} />
                    <span className="text-xs font-medium">{language === "it" ? "Aggiungi" : "Add"}</span>
                  </button>
                )}
              </div>

              <div className="flex-1" />

              <div className="space-y-3">
                <button 
                  onClick={handleNext}
                  className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  data-testid="button-next-photos"
                >
                  {language === "it" ? "Continua" : "Continue"} <ArrowRight size={20} />
                </button>
                {formData.images.length === 0 && (
                  <button 
                    onClick={handleNext}
                    className="w-full text-gray-400 font-medium py-2"
                    data-testid="button-skip-photos"
                  >
                    {language === "it" ? "Salta per ora" : "Skip for now"}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Property Preferences Step */}
          {currentContent === "property_prefs" && (
            <motion.div
              key="property_prefs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {language === "it" ? "Preferenze casa" : "Property preferences"}
                </h2>
                <p className="text-gray-500">
                  {language === "it" ? "Cosa cerchi in una casa?" : "What are you looking for in a home?"}
                </p>
              </div>

              <div className="space-y-5 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Tipo di proprieta" : "Property type"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => togglePropertyType(type.id)}
                        className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                          formData.propertyPrefs.propertyTypes.includes(type.id)
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                        data-testid={`button-property-type-${type.id}`}
                      >
                        <type.icon size={20} />
                        <span className="font-medium text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Euro size={14} /> {language === "it" ? "Fascia di prezzo" : "Price range"}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="number" 
                      value={formData.propertyPrefs.minPrice}
                      onChange={(e) => setFormData({
                        ...formData,
                        propertyPrefs: { ...formData.propertyPrefs, minPrice: e.target.value }
                      })}
                      placeholder={language === "it" ? "Min" : "Min"}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      data-testid="input-min-price"
                    />
                    <input 
                      type="number" 
                      value={formData.propertyPrefs.maxPrice}
                      onChange={(e) => setFormData({
                        ...formData,
                        propertyPrefs: { ...formData.propertyPrefs, maxPrice: e.target.value }
                      })}
                      placeholder={language === "it" ? "Max" : "Max"}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      data-testid="input-max-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Bed size={14} /> {language === "it" ? "Camere minime" : "Minimum bedrooms"}
                  </label>
                  <div className="flex gap-2">
                    {["1", "2", "3", "4+"].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          propertyPrefs: { ...formData.propertyPrefs, minBeds: num.replace("+", "") }
                        })}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                          formData.propertyPrefs.minBeds === num.replace("+", "")
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                        data-testid={`button-beds-${num}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Altre preferenze" : "Other preferences"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        propertyPrefs: { ...formData.propertyPrefs, furnished: formData.propertyPrefs.furnished === true ? null : true }
                      })}
                      className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        formData.propertyPrefs.furnished === true
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                      data-testid="button-furnished"
                    >
                      <Sofa size={20} />
                      <span className="font-medium text-sm">{language === "it" ? "Arredato" : "Furnished"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        propertyPrefs: { ...formData.propertyPrefs, petsAllowed: formData.propertyPrefs.petsAllowed === true ? null : true }
                      })}
                      className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        formData.propertyPrefs.petsAllowed === true
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-100 text-gray-500 hover:border-gray-200"
                      }`}
                      data-testid="button-pets"
                    >
                      <PawPrint size={20} />
                      <span className="font-medium text-sm">{language === "it" ? "Animali OK" : "Pets OK"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                data-testid="button-next-property-prefs"
              >
                {language === "it" ? "Continua" : "Continue"} <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Roommate Preferences Step */}
          {currentContent === "roommate_prefs" && (
            <motion.div
              key="roommate_prefs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {language === "it" ? "Preferenze coinquilino" : "Roommate preferences"}
                </h2>
                <p className="text-gray-500">
                  {language === "it" ? "Chi cerchi come coinquilino?" : "What are you looking for in a roommate?"}
                </p>
              </div>

              <div className="space-y-5 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Fascia di eta preferita" : "Preferred age range"}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "18-25", label: "18-25" },
                      { id: "25-35", label: "25-35" },
                      { id: "35+", label: "35+" },
                    ].map((range) => (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          roommatePrefs: { 
                            ...formData.roommatePrefs, 
                            ageRange: formData.roommatePrefs.ageRange === range.id ? "" : range.id as any
                          }
                        })}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                          formData.roommatePrefs.ageRange === range.id
                            ? "border-secondary bg-secondary/5 text-secondary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                        data-testid={`button-age-${range.id}`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Stile di vita" : "Lifestyle"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {lifestyleOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleLifestyle(option.id)}
                        className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                          formData.roommatePrefs.lifestyle.includes(option.id)
                            ? "border-secondary bg-secondary/5 text-secondary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                        data-testid={`button-lifestyle-${option.id}`}
                      >
                        <option.icon size={20} />
                        <span className="font-medium text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Abitudini" : "Habits"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {habitOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleHabit(option.id)}
                        className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                          formData.roommatePrefs.habits.includes(option.id)
                            ? "border-secondary bg-secondary/5 text-secondary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                        data-testid={`button-habit-${option.id}`}
                      >
                        <option.icon size={20} />
                        <span className="font-medium text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                data-testid="button-next-roommate-prefs"
              >
                {language === "it" ? "Continua" : "Continue"} <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Confirmation Step */}
          {currentContent === "confirm" && (
            <motion.div
              key="confirm"
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

              <h2 className="text-2xl font-black text-gray-900 mb-2">
                {language === "it" ? "Tutto pronto!" : "You're all set!"}
              </h2>
              <p className="text-gray-500 mb-8 max-w-xs">
                {formData.role === "tenant" 
                  ? (language === "it" ? "Inizia a scorrere per trovare il tuo posto perfetto." : "Start swiping to find your perfect place to live.")
                  : (language === "it" ? "Aggiungi il tuo primo annuncio per iniziare a trovare inquilini." : "Add your first property listing to start finding tenants.")}
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 w-full mb-8">
                <div className="flex items-center gap-4 mb-4">
                  {formData.images.length > 0 ? (
                    <img src={formData.images[0]} alt={formData.name} className="w-12 h-12 rounded-full object-cover" />
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
                    {formData.role === "tenant" 
                      ? (language === "it" ? "Inquilino" : "Tenant") 
                      : (language === "it" ? "Proprietario" : "Landlord")}
                  </span>
                  {formData.city && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      {formData.city}
                    </span>
                  )}
                  {formData.role === "tenant" && formData.lookingFor.map(item => (
                    <span key={item} className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      {item === "homes" 
                        ? (language === "it" ? "Case" : "Homes") 
                        : (language === "it" ? "Coinquilini" : "Roommates")}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleComplete}
                disabled={loading}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="button-complete"
              >
                {loading 
                  ? (language === "it" ? "Creazione..." : "Creating...") 
                  : (language === "it" ? "Inizia ad esplorare" : "Start Exploring")} 
                {!loading && <ArrowRight size={20} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
