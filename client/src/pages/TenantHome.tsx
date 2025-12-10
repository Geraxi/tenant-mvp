import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { SwipeCard } from "@/components/SwipeCard";
import { mockProperties } from "@/lib/mockData";
import { Filter, X, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function TenantHome() {
  const { t } = useLanguage();
  const [properties, setProperties] = useState(mockProperties);
  const [lastDirection, setLastDirection] = useState<string | null>(null);

  const handleSwipe = (direction: "left" | "right") => {
    setLastDirection(direction);
    // Remove the top card
    setTimeout(() => {
      setProperties((prev) => prev.slice(1));
    }, 200); // slight delay to allow animation to start
  };

  const activeProperty = properties[0];

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar actionIcon={Filter} onAction={() => console.log("Filter")} />

      <main className="h-[calc(100vh-140px)] w-full max-w-md mx-auto pt-20 px-4 flex flex-col items-center justify-center relative">
        <AnimatePresence>
          {properties.length > 0 ? (
            <div className="relative w-full h-[65vh]">
              {properties.slice(0, 2).reverse().map((prop, index) => (
                 <SwipeCard 
                   key={prop.id} 
                   data={prop} 
                   type="property" 
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
                <Heart className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("empty.noProperties")}</h3>
              <p className="text-gray-500">{t("empty.checkLater")}</p>
              <button 
                onClick={() => setProperties(mockProperties)}
                className="mt-6 text-primary font-bold hover:underline"
              >
                Reset Demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {properties.length > 0 && (
          <div className="mt-8 flex items-center gap-6 z-10">
            <button 
              onClick={() => handleSwipe("left")}
              className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors border border-red-100"
            >
              <X size={32} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => handleSwipe("right")}
              className="w-16 h-16 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:scale-105 transition-transform"
            >
              <Heart size={32} strokeWidth={2.5} fill="currentColor" />
            </button>
          </div>
        )}
      </main>

      <BottomNav role="tenant" />
    </div>
  );
}
