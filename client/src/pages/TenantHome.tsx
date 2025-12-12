import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { SwipeCard } from "@/components/SwipeCard";
import { FilterSheet, FilterOptions } from "@/components/FilterSheet";
import { X, Heart, Users, Home } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Paywall from "@/pages/Paywall";

export default function TenantHome() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"properties" | "roommates">("properties");
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [propertyFilters, setPropertyFilters] = useState<FilterOptions | null>(null);
  const [roommateFilters, setRoommateFilters] = useState<FilterOptions | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const currentFilters = mode === "properties" ? propertyFilters : roommateFilters;

  const handleApplyFilters = (newFilters: FilterOptions) => {
    if (mode === "properties") {
      setPropertyFilters(newFilters);
    } else {
      setRoommateFilters(newFilters);
    }
    toast({
      title: "Filters Applied",
      description: "Your search preferences have been updated",
    });
  };

  const { data: properties = [], isLoading: propertiesLoading, refetch: refetchProperties } = useQuery({
    queryKey: ["properties"],
    queryFn: api.getProperties,
  });

  const { data: roommates = [], isLoading: roommatesLoading, refetch: refetchRoommates } = useQuery({
    queryKey: ["roommates"],
    queryFn: api.getRoommates,
  });

  const swipeMutation = useMutation({
    mutationFn: ({ targetType, targetId, action }: { targetType: 'property' | 'roommate', targetId: string, action: 'like' | 'skip' }) =>
      api.swipe(targetType, targetId, action),
    onSuccess: () => {
      if (mode === "properties") {
        refetchProperties();
      } else {
        refetchRoommates();
      }
    },
    onError: (error: any) => {
      if (error?.code === "SWIPE_LIMIT_REACHED") {
        setShowPaywall(true);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to process swipe",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (direction: "left" | "right") => {
    setLastDirection(direction);
    if (filteredItems.length > 0) {
      const item = filteredItems[0];
      swipeMutation.mutate({
        targetType: mode === "properties" ? "property" : "roommate",
        targetId: item.id,
        action: direction === "right" ? "like" : "skip",
      });
    }
  };

  const isLoading = mode === "properties" ? propertiesLoading : roommatesLoading;
  const currentItems = mode === "properties" ? properties : roommates;

  const filteredItems = currentItems.filter(item => {
    if (!currentFilters) return true;
    if (mode === "properties") {
      const prop = item as any;
      if (currentFilters.priceRange && (prop.price < currentFilters.priceRange[0] || prop.price > currentFilters.priceRange[1])) return false;
      if (currentFilters.beds !== null && prop.beds < currentFilters.beds) return false;
      if (currentFilters.baths !== null && prop.baths < currentFilters.baths) return false;
    } else {
      const roommate = item as any;
      if (currentFilters.ageRange && roommate.age && (roommate.age < currentFilters.ageRange[0] || roommate.age > currentFilters.ageRange[1])) return false;
      if (currentFilters.gender && roommate.gender && roommate.gender !== currentFilters.gender) return false;
    }
    return true;
  });

  if (showPaywall) {
    return (
      <Paywall 
        reason="swipe_limit" 
        onSkip={() => setShowPaywall(false)} 
      />
    );
  }

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-4 border-b border-gray-50">
        <div className="w-10"></div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900" data-testid="text-app-name">{t("app.name")}</h1>
        </div>
        <div className="w-10 flex justify-end">
          <FilterSheet 
            type={mode === "properties" ? "property" : "roommate"} 
            onApply={handleApplyFilters}
            currentFilters={currentFilters}
          />
        </div>
      </header>
      
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
            data-testid="button-toggle-properties"
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
            data-testid="button-toggle-roommates"
          >
            <Users size={16} />
            {t("tenant.toggle.roommates")}
          </button>
        </div>
      </div>

      <main className="h-[calc(100vh-140px)] w-full max-w-md mx-auto pt-24 px-4 flex flex-col items-center justify-center relative">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredItems.length > 0 ? (
              <div className="relative w-full h-[60vh]">
                {filteredItems.slice(0, 2).reverse().map((item, index) => (
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
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Action Buttons */}
        {filteredItems.length > 0 && (
          <div className="mt-6 flex items-center gap-6 z-10">
            <button 
              onClick={() => handleSwipe("left")}
              className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors border border-red-100"
              data-testid="button-swipe-left"
            >
              <X size={32} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => handleSwipe("right")}
              className={cn(
                "w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform",
                mode === "properties" ? "bg-primary shadow-primary/30" : "bg-secondary shadow-secondary/30"
              )}
              data-testid="button-swipe-right"
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
