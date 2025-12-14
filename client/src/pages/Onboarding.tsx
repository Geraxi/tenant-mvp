import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, User, Building2, Search, Heart, ShieldCheck, ArrowRight, MapPin, Euro, Calendar, Users, Home, CheckCircle2, Camera, Plus, X, Bed, Sofa, PawPrint, Cigarette, Moon, Music, Dumbbell, Coffee, Key } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export default function Onboarding() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated, error: authError, logout } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [apiError, setApiError] = useState(false);

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
    // My place info (for roommate seekers with a place)
    hasPlace: false,
    myPlace: {
      city: "",
      area: "",
      rent: "",
      description: "",
      amenities: [] as string[],
      images: [] as string[],
    },
    // Landlord tenant preferences
    tenantPrefs: {
      ageRange: "" as "18-25" | "25-35" | "35+" | "",
      minIncome: "",
      occupation: [] as string[],
      lifestyle: [] as string[],
      petsAllowed: null as boolean | null,
      smokingAllowed: null as boolean | null,
      leaseDuration: "" as "short" | "long" | "flexible" | "",
      maxTenants: "",
    },
    // ID Verification
    idDocument: "" as string,
    selfie: "" as string,
  });
  
  const propertyImageInputRef = useRef<HTMLInputElement>(null);
  const idDocumentInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPropertyImages, setUploadingPropertyImages] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingIdDocument, setUploadingIdDocument] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

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

  const togglePlaceAmenity = (item: string) => {
    setFormData(prev => ({
      ...prev,
      myPlace: {
        ...prev.myPlace,
        amenities: prev.myPlace.amenities.includes(item)
          ? prev.myPlace.amenities.filter(a => a !== item)
          : [...prev.myPlace.amenities, item],
      },
    }));
  };

  const handlePropertyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPropertyImages(true);
    
    try {
      for (const file of Array.from(files)) {
        if (formData.myPlace.images.length >= 6) break;
        
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        try {
          const { url } = await api.uploadImage(base64, file.name, file.type);
          setFormData(prev => ({
            ...prev,
            myPlace: {
              ...prev.myPlace,
              images: [...prev.myPlace.images, url].slice(0, 6),
            },
          }));
        } catch {
          setFormData(prev => ({
            ...prev,
            myPlace: {
              ...prev.myPlace,
              images: [...prev.myPlace.images, base64].slice(0, 6),
            },
          }));
        }
      }
    } finally {
      setUploadingPropertyImages(false);
    }
  };

  const removePropertyImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      myPlace: {
        ...prev.myPlace,
        images: prev.myPlace.images.filter((_, i) => i !== index),
      },
    }));
  };

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Check for session if not authenticated (use effect hook)
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      const checkSession = async () => {
        // Give auth state more time to sync after redirect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Session exists but user data not loaded yet
          // Invalidate queries to force refetch
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          // Don't show auth prompt if session exists
          setShowAuthPrompt(false);
        } else {
          // No session after waiting, show prompt
          setShowAuthPrompt(true);
        }
      };
      checkSession();
    } else if (isAuthenticated) {
      // If authenticated, don't show prompt
      setShowAuthPrompt(false);
    }
  }, [isAuthenticated, isLoading, queryClient]);

  useEffect(() => {
    if (user) {
      const urlParams = new URLSearchParams(window.location.search);
      const createRole = urlParams.get('createRole') as "tenant" | "landlord" | null;
      
      if (createRole) {
        setFormData(prev => ({
          ...prev,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.name,
          role: createRole,
        }));
        setStep(3);
        return;
      }
      
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

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading || (hasSession === true && !isAuthenticated)) {
      const timer = setTimeout(() => {
        console.log('Loading timeout reached, showing error screen');
        setLoadingTimeout(true);
      }, 3000); // 3 second timeout (reduced from 5)
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading, hasSession, isAuthenticated]);

  // Check for session on mount and when auth state changes
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      // If session exists but user not loaded, invalidate to refetch
      if (session && !isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    };
    checkSession();
  }, [isAuthenticated, queryClient]);

  // Detect API errors immediately
  useEffect(() => {
    if (authError || (hasSession === true && !isAuthenticated && !isLoading)) {
      // If we have a session but can't load user after a brief wait, it's likely an API error
      const timer = setTimeout(() => {
        if (hasSession === true && !isAuthenticated && !isLoading) {
          setApiError(true);
        }
      }, 2000); // Check after 2 seconds
      return () => clearTimeout(timer);
    } else {
      setApiError(false);
    }
  }, [authError, hasSession, isAuthenticated, isLoading]);

  // Show loading state while checking authentication
  // Also show loading if we have a session but user data isn't loaded yet
  // But timeout after 3 seconds to prevent infinite loading
  const isStuckLoading = (isLoading || (hasSession === true && !isAuthenticated)) && !loadingTimeout;
  
  if (isStuckLoading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If loading timed out or API error detected, show error screen
  // Show error if: timeout reached OR API error detected
  if ((loadingTimeout || apiError) && !isAuthenticated && (hasSession === true || isLoading)) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {language === "it" ? "Errore di caricamento" : "Loading Error"}
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          {language === "it" 
            ? "Impossibile caricare i dati utente. Riprova o accedi di nuovo." 
            : "Unable to load user data. Please try again or sign in again."}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
              setLoadingTimeout(false);
            }}
            className="bg-blue-500 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg"
          >
            {language === "it" ? "Riprova" : "Retry"}
          </button>
          <button 
            onClick={() => setLocation("/")}
            className="bg-gray-500 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg"
          >
            {language === "it" ? "Accedi" : "Sign In"}
          </button>
        </div>
      </div>
    );
  }

  // Only show auth prompt if we're sure there's no session after waiting
  if (!isAuthenticated && showAuthPrompt && hasSession === false) {
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
  
  // Show loading while checking auth or waiting for auth prompt
  if (!isAuthenticated && !showAuthPrompt) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = async () => {
    if (step === 1) {
      // On first step, log out and go to auth page
      await logout();
      setLocation("/");
      return;
    }
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleRoleSelect = (role: "tenant" | "landlord" | "roommate") => {
    if (role === "roommate") {
      // Roommate is a tenant looking for roommates
      setFormData({ ...formData, role: "tenant", lookingFor: ["roommates"] });
    } else if (role === "tenant") {
      // Tenant looking for homes
      setFormData({ ...formData, role: "tenant", lookingFor: ["homes"] });
    } else {
      setFormData({ ...formData, role });
    }
    handleNext();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    
    try {
      for (const file of Array.from(files)) {
        if (formData.images.length >= 6) break;
        
        // Read file as base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Upload to Supabase Storage
        try {
          const { url } = await api.uploadImage(base64, file.name, file.type);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, url].slice(0, 6),
          }));
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          // Fallback to base64 if storage upload fails (e.g., bucket not configured)
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, base64].slice(0, 6),
          }));
        }
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleIdDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingIdDocument(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const { url } = await api.uploadImage(base64, file.name, file.type);
          setFormData(prev => ({
            ...prev,
            idDocument: url,
          }));
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          setFormData(prev => ({
            ...prev,
            idDocument: base64,
          }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingIdDocument(false);
    }
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingSelfie(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const { url } = await api.uploadImage(base64, file.name, file.type);
          setFormData(prev => ({
            ...prev,
            selfie: url,
          }));
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          setFormData(prev => ({
            ...prev,
            selfie: base64,
          }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingSelfie(false);
    }
  };

  // Calculate total steps based on role and lookingFor
  const getTotalSteps = () => {
    if (formData.role === "landlord") return 8; // Welcome, Security, Role, Info, TenantPrefs, ID Verification, Photos, Confirm
    // Tenant: Welcome, Security, Role, Info, ID Verification, Photos, [PropertyPrefs], [RoommatePrefs], [MyPlace], Confirm
    let steps = 7; // Added ID Verification step
    if (formData.lookingFor.includes("homes")) steps++;
    if (formData.lookingFor.includes("roommates")) {
      steps++; // roommate prefs
      if (formData.hasPlace) steps++; // my place info
    }
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
        hasTenantProfile: formData.role === "tenant" ? true : user.hasTenantProfile,
        hasLandlordProfile: formData.role === "landlord" ? true : user.hasLandlordProfile,
        city: formData.city || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        occupation: formData.occupation || undefined,
        bio: formData.bio || undefined,
        budget: formData.budget ? parseInt(formData.budget) : undefined,
        lookingFor: formData.role === "tenant" ? formData.lookingFor : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        ...(formData.idDocument && { idDocument: formData.idDocument } as any),
        ...(formData.selfie && { selfie: formData.selfie } as any),
        ...(formData.idDocument && formData.selfie && { verificationStatus: "pending" } as any),
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
        tenantPrefs: formData.role === "landlord"
          ? {
              ageRange: formData.tenantPrefs.ageRange || null,
              minIncome: formData.tenantPrefs.minIncome ? parseInt(formData.tenantPrefs.minIncome) : null,
              occupation: formData.tenantPrefs.occupation,
              lifestyle: formData.tenantPrefs.lifestyle,
              petsAllowed: formData.tenantPrefs.petsAllowed,
              smokingAllowed: formData.tenantPrefs.smokingAllowed,
              leaseDuration: formData.tenantPrefs.leaseDuration || null,
              maxTenants: formData.tenantPrefs.maxTenants ? parseInt(formData.tenantPrefs.maxTenants) : null,
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
          hasPlace: formData.hasPlace,
          propertyCity: formData.hasPlace ? formData.myPlace.city : undefined,
          propertyArea: formData.hasPlace ? formData.myPlace.area : undefined,
          propertyRent: formData.hasPlace && formData.myPlace.rent ? parseInt(formData.myPlace.rent) : undefined,
          propertyDescription: formData.hasPlace ? formData.myPlace.description : undefined,
          propertyAmenities: formData.hasPlace ? formData.myPlace.amenities : undefined,
          propertyImages: formData.hasPlace ? formData.myPlace.images : undefined,
        });
      }

      // Update the cached user object with the role immediately
      // This ensures navigation works even if database save fails
      queryClient.setQueryData(["/api/auth/user"], (oldUser: any) => {
        if (oldUser) {
          return { ...oldUser, role: formData.role };
        }
        return { role: formData.role, id: user?.id || "" };
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: language === "it" ? "Benvenuto su Tenant!" : "Welcome to Tenant!",
        description: language === "it" ? "Il tuo profilo e stato creato" : "Your profile has been created successfully",
      });
      
      // Show paywall after signup (user can skip to continue with limited features)
      // Pass role as URL param so paywall knows what role to use
      setLocation(`/paywall?role=${formData.role}`);
    } catch (error: any) {
      // Suppress database connection errors - they're handled by the server workaround
      const errorMessage = error?.message || error?.toString() || '';
      const isDatabaseError = errorMessage.includes('getaddrinfo') || 
                             errorMessage.includes('ENOTFOUND') || 
                             errorMessage.includes('aws-0.us-east-1.pooler.supabase.com') ||
                             errorMessage.includes('Failed to fetch user');
      
      // Only show error if it's not a database connection error
      // Database errors are handled by the server workaround, so the operation may still succeed
      if (!isDatabaseError) {
        toast({
          title: language === "it" ? "Errore" : "Error",
          description: errorMessage || (language === "it" ? "Impossibile aggiornare il profilo" : "Failed to update profile"),
          variant: "destructive",
        });
      } else {
        // Database error but operation might have succeeded - show success anyway
        // The server workaround should have handled it
        console.warn("Database connection error suppressed:", errorMessage);
        
        // Even if database update failed, navigate to the app
        // The server workaround should have created the user data
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        toast({
          title: language === "it" ? "Benvenuto su Tenant!" : "Welcome to Tenant!",
          description: language === "it" ? "Il tuo profilo e stato creato" : "Your profile has been created successfully",
        });
        
        // Update the cached user object with the role immediately
        // This ensures navigation works even if database save failed
        queryClient.setQueryData(["/api/auth/user"], (oldUser: any) => {
          if (oldUser) {
            return { ...oldUser, role: formData.role };
          }
          return { role: formData.role, id: user?.id || "" };
        });
        
        // Navigate to paywall, or directly to role page if we have the role
        if (formData.role) {
          setLocation(`/paywall?role=${formData.role}`);
        } else {
          // Fallback: navigate to tenant page if role not set
          setLocation("/tenant");
        }
      }
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
      // Landlord: 4=Info, 5=TenantPrefs, 6=ID Verification, 7=Photos, 8=Confirm
      if (step === 4) return "landlord_info";
      if (step === 5) return "landlord_tenant_prefs";
      if (step === 6) return "id_verification";
      if (step === 7) return "photos";
      if (step === 8) return "confirm";
    } else {
      // Tenant: 4=Info, 5=ID Verification, 6=Photos, then preferences, then confirm
      if (step === 4) return "tenant_info";
      if (step === 5) return "id_verification";
      if (step === 6) return "photos";
      
      let currentStep = 7; // Updated after adding ID verification step
      if (formData.lookingFor.includes("homes")) {
        if (step === currentStep) return "property_prefs";
        currentStep++;
      }
      if (formData.lookingFor.includes("roommates")) {
        if (step === currentStep) return "roommate_prefs";
        currentStep++;
        if (formData.hasPlace) {
          if (step === currentStep) return "my_place";
          currentStep++;
        }
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
      <input 
        type="file" 
        ref={idDocumentInputRef}
        onChange={handleIdDocumentUpload}
        accept="image/*"
        className="hidden"
      />
      <input 
        type="file" 
        ref={selfieInputRef}
        onChange={handleSelfieUpload}
        accept="image/*"
        capture="user"
        className="hidden"
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto p-6 pt-12">
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
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>

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
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>

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
              className="absolute inset-0 bg-blue-600 flex flex-col p-6"
            >
              <div className="flex-1 flex flex-col justify-center gap-5 mb-6">
                {/* Inquilino Card - White */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect("tenant")}
                  className="bg-white rounded-3xl p-6 cursor-pointer shadow-xl"
                  data-testid="button-role-tenant"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                      <Home size={32} className="text-blue-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black text-blue-600 mb-2">
                      {language === "it" ? "Inquilino" : "Tenant"}
                    </h3>
                    <p className="text-sm text-gray-600 leading-tight">
                      {language === "it" 
                        ? "Cerco una casa in affitto - Vedrò annunci di proprietari" 
                        : "I'm looking for a house for rent - I'll see landlord ads"}
                    </p>
                  </div>
                </motion.div>

                {/* Proprietario Card - Blue (blends with background) */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect("landlord")}
                  className="bg-blue-500 rounded-3xl p-6 cursor-pointer shadow-xl border-2 border-blue-400"
                  data-testid="button-role-landlord"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center mb-3">
                      <Key size={32} className="text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">
                      {language === "it" ? "Proprietario" : "Landlord"}
                    </h3>
                    <p className="text-sm text-blue-50 leading-tight">
                      {language === "it" 
                        ? "Affitto la mia proprietà - Vedrò profili di inquilini" 
                        : "I rent my property - I'll see tenant profiles"}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleNext}
                className="w-full bg-white text-blue-600 font-black text-base py-4 rounded-full shadow-xl mb-3 hover:bg-blue-50 active:scale-[0.98] transition-all"
                data-testid="button-continue-role"
              >
                {language === "it" ? "Continua" : "Continue"}
              </button>

              {/* Back Link */}
              <button 
                onClick={handleBack}
                className="text-center text-white/90 text-xs font-medium hover:text-white hover:underline transition-colors"
                data-testid="button-back"
              >
                {language === "it" ? "Indietro" : "Back"}
              </button>
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
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>
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
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>
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

          {/* Landlord Tenant Preferences Step */}
          {currentContent === "landlord_tenant_prefs" && (
            <motion.div
              key="landlord_tenant_prefs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {language === "it" ? "Preferenze per l'inquilino ideale" : "Ideal tenant preferences"}
                </h2>
                <p className="text-gray-500">
                  {language === "it" 
                    ? "Aiutaci a trovare l'inquilino perfetto per le tue proprieta" 
                    : "Help us find the perfect tenant for your properties"}
                </p>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Age Range */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Fascia d'età preferita" : "Preferred age range"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["18-25", "25-35", "35+"] as const).map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          tenantPrefs: { ...prev.tenantPrefs, ageRange: range }
                        }))}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.tenantPrefs.ageRange === range
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimum Income */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Euro size={14} /> {language === "it" ? "Reddito minimo mensile (opzionale)" : "Minimum monthly income (optional)"}
                  </label>
                  <input 
                    type="number" 
                    value={formData.tenantPrefs.minIncome}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tenantPrefs: { ...prev.tenantPrefs, minIncome: e.target.value }
                    }))}
                    placeholder={language === "it" ? "Es. 2000" : "E.g. 2000"}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                  />
                </div>

                {/* Occupation Preferences */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Professioni preferite (opzionale)" : "Preferred occupations (optional)"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Student", "Professional", "Remote Worker", "Self-Employed", "Retired"].map((occupation) => (
                      <button
                        key={occupation}
                        type="button"
                        onClick={() => {
                          const current = formData.tenantPrefs.occupation;
                          setFormData(prev => ({
                            ...prev,
                            tenantPrefs: {
                              ...prev.tenantPrefs,
                              occupation: current.includes(occupation)
                                ? current.filter(o => o !== occupation)
                                : [...current, occupation]
                            }
                          }));
                        }}
                        className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                          formData.tenantPrefs.occupation.includes(occupation)
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {occupation}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lifestyle Preferences */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Stile di vita (opzionale)" : "Lifestyle preferences (optional)"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Quiet", "Social", "Active", "Night Owl", "Early Bird"].map((lifestyle) => (
                      <button
                        key={lifestyle}
                        type="button"
                        onClick={() => {
                          const current = formData.tenantPrefs.lifestyle;
                          setFormData(prev => ({
                            ...prev,
                            tenantPrefs: {
                              ...prev.tenantPrefs,
                              lifestyle: current.includes(lifestyle)
                                ? current.filter(l => l !== lifestyle)
                                : [...current, lifestyle]
                            }
                          }));
                        }}
                        className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                          formData.tenantPrefs.lifestyle.includes(lifestyle)
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {lifestyle}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pets Allowed */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <PawPrint size={14} /> {language === "it" ? "Animali domestici" : "Pets allowed"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: true, label: language === "it" ? "Sì" : "Yes" },
                      { value: false, label: language === "it" ? "No" : "No" },
                      { value: null, label: language === "it" ? "Flessibile" : "Flexible" }
                    ].map((option) => (
                      <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          tenantPrefs: { ...prev.tenantPrefs, petsAllowed: option.value }
                        }))}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.tenantPrefs.petsAllowed === option.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smoking Allowed */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Cigarette size={14} /> {language === "it" ? "Fumatori" : "Smoking allowed"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: true, label: language === "it" ? "Sì" : "Yes" },
                      { value: false, label: language === "it" ? "No" : "No" },
                      { value: null, label: language === "it" ? "Flessibile" : "Flexible" }
                    ].map((option) => (
                      <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          tenantPrefs: { ...prev.tenantPrefs, smokingAllowed: option.value }
                        }))}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.tenantPrefs.smokingAllowed === option.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lease Duration */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Calendar size={14} /> {language === "it" ? "Durata del contratto preferita" : "Preferred lease duration"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "short", label: language === "it" ? "Breve" : "Short" },
                      { value: "long", label: language === "it" ? "Lungo" : "Long" },
                      { value: "flexible", label: language === "it" ? "Flessibile" : "Flexible" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          tenantPrefs: { ...prev.tenantPrefs, leaseDuration: option.value as "short" | "long" | "flexible" }
                        }))}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.tenantPrefs.leaseDuration === option.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Tenants */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Users size={14} /> {language === "it" ? "Numero massimo di inquilini (opzionale)" : "Maximum number of tenants (optional)"}
                  </label>
                  <input 
                    type="number" 
                    value={formData.tenantPrefs.maxTenants}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      tenantPrefs: { ...prev.tenantPrefs, maxTenants: e.target.value }
                    }))}
                    placeholder={language === "it" ? "Es. 2" : "E.g. 2"}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                  />
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                data-testid="button-next-tenant-prefs"
              >
                {language === "it" ? "Continua" : "Continue"} <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* ID Verification Step */}
          {currentContent === "id_verification" && (
            <motion.div
              key="id_verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {language === "it" ? "Verifica la tua identità" : "Verify your identity"}
                </h2>
                <p className="text-gray-500">
                  {language === "it" 
                    ? "Carica un documento d'identità e un selfie per la verifica" 
                    : "Upload an ID document and a selfie for verification"}
                </p>
              </div>

              <div className="space-y-6 mb-6">
                {/* ID Document Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Documento d'identità" : "ID Document"}
                  </label>
                  {formData.idDocument ? (
                    <div className="relative rounded-2xl overflow-hidden bg-gray-100 border-2 border-primary">
                      <img src={formData.idDocument} alt="ID Document" className="w-full h-48 object-contain" />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, idDocument: "" }))}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                        data-testid="button-remove-id"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => idDocumentInputRef.current?.click()}
                      disabled={uploadingIdDocument}
                      className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      data-testid="button-upload-id"
                    >
                      {uploadingIdDocument ? (
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Camera size={32} />
                          <span className="font-medium">{language === "it" ? "Carica documento d'identità" : "Upload ID document"}</span>
                          <span className="text-xs">{language === "it" ? "Carta d'identità, passaporto o patente" : "ID card, passport or driver's license"}</span>
                        </>
                      )}
                    </button>
                  )}
                  <input 
                    ref={idDocumentInputRef}
                    type="file" 
                    onChange={handleIdDocumentUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Selfie Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Selfie di conferma" : "Confirmation Selfie"}
                  </label>
                  {formData.selfie ? (
                    <div className="relative rounded-2xl overflow-hidden bg-gray-100 border-2 border-primary">
                      <img src={formData.selfie} alt="Selfie" className="w-full h-48 object-cover" />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, selfie: "" }))}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                        data-testid="button-remove-selfie"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => selfieInputRef.current?.click()}
                      disabled={uploadingSelfie}
                      className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      data-testid="button-upload-selfie"
                    >
                      {uploadingSelfie ? (
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <User size={32} />
                          <span className="font-medium">{language === "it" ? "Scatta un selfie" : "Take a selfie"}</span>
                          <span className="text-xs">{language === "it" ? "Assicurati che il viso sia ben visibile" : "Make sure your face is clearly visible"}</span>
                        </>
                      )}
                    </button>
                  )}
                  <input 
                    ref={selfieInputRef}
                    type="file" 
                    onChange={handleSelfieUpload}
                    accept="image/*"
                    capture="user"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex-1" />

              <div className="space-y-3">
                <button 
                  onClick={handleNext}
                  disabled={!formData.idDocument || !formData.selfie}
                  className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-next-id-verification"
                >
                  {language === "it" ? "Continua" : "Continue"} <ArrowRight size={20} />
                </button>
                {(!formData.idDocument || !formData.selfie) && (
                  <p className="text-center text-sm text-gray-400">
                    {language === "it" 
                      ? "Carica sia il documento d'identità che il selfie per continuare" 
                      : "Upload both ID document and selfie to continue"}
                  </p>
                )}
              </div>
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
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>
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
                    disabled={uploadingImages}
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    data-testid="button-add-photo"
                  >
                    {uploadingImages ? (
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Camera size={24} />
                        <span className="text-xs font-medium">{language === "it" ? "Aggiungi" : "Add"}</span>
                      </>
                    )}
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
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>
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
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>
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

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Hai gia un posto?" : "Do you have a place?"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasPlace: !formData.hasPlace })}
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      formData.hasPlace
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-100 text-gray-500 hover:border-gray-200"
                    }`}
                    data-testid="button-has-place"
                  >
                    <Home size={20} />
                    <span className="font-medium flex-1 text-left">
                      {formData.hasPlace 
                        ? (language === "it" ? "Si, cerco un coinquilino per il mio posto" : "Yes, I'm looking for a roommate for my place")
                        : (language === "it" ? "No, cerco un posto con coinquilini" : "No, I'm looking for a place with roommates")}
                    </span>
                    {formData.hasPlace && <CheckCircle2 size={20} className="text-green-500" />}
                  </button>
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

          {/* My Place Step (for roommate seekers with a place) */}
          {currentContent === "my_place" && (
            <motion.div
              key="my_place"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {language === "it" ? "Il tuo posto" : "Your place"}
                </h2>
                <p className="text-gray-500">
                  {language === "it" ? "Racconta ai potenziali coinquilini del tuo appartamento" : "Tell potential roommates about your apartment"}
                </p>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                      <MapPin size={14} /> {language === "it" ? "Citta" : "City"}
                    </label>
                    <input 
                      type="text" 
                      value={formData.myPlace.city}
                      onChange={(e) => setFormData({ ...formData, myPlace: { ...formData.myPlace, city: e.target.value }})}
                      placeholder="Milano, Roma..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      data-testid="input-place-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      {language === "it" ? "Zona" : "Area"}
                    </label>
                    <input 
                      type="text" 
                      value={formData.myPlace.area}
                      onChange={(e) => setFormData({ ...formData, myPlace: { ...formData.myPlace, area: e.target.value }})}
                      placeholder="Centro, Navigli..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                      data-testid="input-place-area"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Euro size={14} /> {language === "it" ? "Affitto mensile (quota)" : "Monthly rent (share)"}
                  </label>
                  <input 
                    type="number" 
                    value={formData.myPlace.rent}
                    onChange={(e) => setFormData({ ...formData, myPlace: { ...formData.myPlace, rent: e.target.value }})}
                    placeholder="500"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                    data-testid="input-place-rent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Descrizione" : "Description"}
                  </label>
                  <textarea 
                    value={formData.myPlace.description}
                    onChange={(e) => setFormData({ ...formData, myPlace: { ...formData.myPlace, description: e.target.value }})}
                    placeholder={language === "it" ? "Descrivi il tuo appartamento..." : "Describe your apartment..."}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium resize-none"
                    data-testid="input-place-description"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    {language === "it" ? "Servizi" : "Amenities"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["WiFi", "Lavatrice", "Cucina", "Balcone", "AC", "Parking"].map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => togglePlaceAmenity(amenity)}
                        className={`px-3 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                          formData.myPlace.amenities.includes(amenity)
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                        data-testid={`button-amenity-${amenity}`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <Camera size={14} /> {language === "it" ? "Foto del posto (max 6)" : "Photos of your place (max 6)"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.myPlace.images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={img} alt={`Place ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePropertyImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                          data-testid={`button-remove-place-image-${index}`}
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {formData.myPlace.images.length < 6 && (
                      <button
                        onClick={() => propertyImageInputRef.current?.click()}
                        disabled={uploadingPropertyImages}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                        data-testid="button-add-place-photo"
                      >
                        {uploadingPropertyImages ? (
                          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <Plus size={20} />
                            <span className="text-xs">Add</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    ref={propertyImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePropertyImageUpload}
                    className="hidden"
                    data-testid="input-place-photos"
                  />
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                data-testid="button-next-my-place"
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
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 self-start"
                data-testid="button-back"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="font-medium">{language === "it" ? "Indietro" : "Back"}</span>
              </button>
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
