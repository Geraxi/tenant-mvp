import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, User, Building2, Search, Heart, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleRoleSelect = async (role: string) => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please provide your details first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await api.register({
        ...formData,
        role,
      });
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully",
      });
      setLocation(`/${role}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-white flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "25%" }}
          animate={{ width: `${step * 25}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col p-6 pt-12 relative z-10">
        <AnimatePresence mode="wait">
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

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex items-center justify-center">
                 <div className="relative w-64 h-64">
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

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Create your account</h2>
                <p className="text-gray-500">Just a few details to get started</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Your name"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="hello@example.com"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={!formData.name || !formData.email || !formData.password}
                className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-2">{t("role.title")}</h2>
                <p className="text-gray-500">Select how you want to use Tenant</p>
              </div>

              <div className="grid gap-4 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !loading && handleRoleSelect("tenant")}
                  className="group block p-6 rounded-3xl border-2 border-gray-100 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all relative overflow-hidden disabled:opacity-50"
                >
                  <div className="flex items-center gap-4 z-10 relative">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <User size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{t("role.tenant")}</h3>
                      <p className="text-sm text-gray-500">I'm looking for a home</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !loading && handleRoleSelect("landlord")}
                  className="group block p-6 rounded-3xl border-2 border-gray-100 hover:border-secondary/50 hover:bg-secondary/5 cursor-pointer transition-all relative overflow-hidden disabled:opacity-50"
                >
                  <div className="flex items-center gap-4 z-10 relative">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                      <Building2 size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{t("role.landlord")}</h3>
                      <p className="text-sm text-gray-500">I want to list a property</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-secondary transition-colors" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
