import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { SwipeCard } from "@/components/SwipeCard";
import { mockProperties, mockRoommates } from "@/lib/mockData";
import { Filter, X, Heart, Users, Home } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TenantHome() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"properties" | "roommates">("properties");
  const [properties, setProperties] = useState(mockProperties);
  const [roommates, setRoommates] = useState(mockRoommates);
  const [lastDirection, setLastDirection] = useState<string | null>(null);

  const handleSwipe = (direction: "left" | "right") => {
    setLastDirection(direction);
    // Remove the top card
    setTimeout(() => {
      if (mode === "properties") {
        setProperties((prev) => prev.slice(1));
      } else {
        setRoommates((prev) => prev.slice(1));
      }
    }, 200); // slight delay to allow animation to start
  };

  const currentItems = mode === "properties" ? properties : roommates;

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar actionIcon={Filter} onAction={() => console.log("Filter")} />
      
      {/* Mode Toggle */}
      <div className="fixed top-16 left-0 right-0 z-30 px-6 flex justify-center">
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
          <button
            onClick={() => setMode("properties")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              mode === "properties" 
                ? "bg-primary text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Home size={16} />
            {t("tenant.toggle.homes")}
          </button>
          <button
            onClick={() => setMode("roommates")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              mode === "roommates" 
                ? "bg-secondary text-white shadow-md" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Users size={16} />
            {t("tenant.toggle.roommates")}
          </button>
        </div>
      </div>

      <main className="h-[calc(100vh-140px)] w-full max-w-md mx-auto pt-24 px-4 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {currentItems.length > 0 ? (
            <div className="relative w-full h-[60vh]">
              {currentItems.slice(0, 2).reverse().map((item, index) => (
                 <SwipeCard 
                   key={item.id} 
                   data={item} 
                   type={mode === "properties" ? "property" : "tenant"} 
                   onSwipe={handleSwipe} 
                 />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-8"
              key="empty-state"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                {mode === "properties" ? (
                  <Heart className="text-gray-400" size={32} />
                ) : (
                  <Users className="text-gray-400" size={32} />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {mode === "properties" ? t("empty.noProperties") : t("empty.noRoommates")}
              </h3>
              <p className="text-gray-500">{t("empty.checkLater")}</p>
              <button 
                onClick={() => mode === "properties" ? setProperties(mockProperties) : setRoommates(mockRoommates)}
                className="mt-6 text-primary font-bold hover:underline"
              >
                Reset Demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {currentItems.length > 0 && (
          <div className="mt-6 flex items-center gap-6 z-10">
            <button 
              onClick={() => handleSwipe("left")}
              className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors border border-red-100"
            >
              <X size={32} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => handleSwipe("right")}
              className={cn(
                "w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform",
                mode === "properties" ? "bg-primary shadow-primary/30" : "bg-secondary shadow-secondary/30"
              )}
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
