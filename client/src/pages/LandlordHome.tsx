import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { SwipeCard } from "@/components/SwipeCard";
import { mockTenants } from "@/lib/mockData";
import { Filter, X, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function LandlordHome() {
  const { t } = useLanguage();
  const [tenants, setTenants] = useState(mockTenants);
  const [lastDirection, setLastDirection] = useState<string | null>(null);

  const handleSwipe = (direction: "left" | "right") => {
    setLastDirection(direction);
    setTimeout(() => {
      setTenants((prev) => prev.slice(1));
    }, 200);
  };

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar title="Find Tenants" actionIcon={Filter} onAction={() => console.log("Filter")} />

      <main className="h-[calc(100vh-140px)] w-full max-w-md mx-auto pt-20 px-4 flex flex-col items-center justify-center relative">
        <AnimatePresence>
          {tenants.length > 0 ? (
            <div className="relative w-full h-[65vh]">
              {tenants.slice(0, 2).reverse().map((tenant, index) => (
                 <SwipeCard 
                   key={tenant.id} 
                   data={tenant} 
                   type="tenant" 
                   onSwipe={handleSwipe} 
                 />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center p-8"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Check className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No more tenants</h3>
              <p className="text-gray-500">{t("empty.checkLater")}</p>
              <button 
                onClick={() => setTenants(mockTenants)}
                className="mt-6 text-primary font-bold hover:underline"
              >
                Reset Demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {tenants.length > 0 && (
          <div className="mt-8 flex items-center gap-6 z-10">
            <button 
              onClick={() => handleSwipe("left")}
              className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors border border-red-100"
            >
              <X size={32} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => handleSwipe("right")}
              className="w-16 h-16 rounded-full bg-green-500 shadow-lg shadow-green-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform"
            >
              <Check size={32} strokeWidth={3} />
            </button>
          </div>
        )}
      </main>

      <BottomNav role="landlord" />
    </div>
  );
}
