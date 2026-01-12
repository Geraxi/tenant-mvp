import { useState, useMemo, useEffect } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import Paywall from "@/pages/Paywall";

type SwipeItem = {
  id: string;
  type: "property" | "roommate";
  data: any;
};

export default function TenantHome() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"properties" | "roommates">("properties");
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [propertyFilters, setPropertyFilters] = useState<FilterOptions | null>(null);
  const [roommateFilters, setRoommateFilters] = useState<FilterOptions | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Check what user is looking for
  const userLookingFor = useMemo(() => {
    return (user as any)?.lookingFor || [];
  }, [user]);
  
  const lookingForBoth = useMemo(() => {
    return userLookingFor.includes("homes") && userLookingFor.includes("roommates");
  }, [userLookingFor]);
  
  const lookingForRoommates = useMemo(() => {
    return userLookingFor.includes("roommates");
  }, [userLookingFor]);
  
  const lookingForHomes = useMemo(() => {
    return userLookingFor.includes("homes");
  }, [userLookingFor]);
  
  // Set initial mode based on what user is looking for
  useEffect(() => {
    if (lookingForRoommates && !lookingForHomes) {
      setMode("roommates");
    } else if (lookingForHomes && !lookingForRoommates) {
      setMode("properties");
    }
  }, [lookingForRoommates, lookingForHomes]);


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

  const { data: properties = [], isLoading: propertiesLoading, refetch: refetchProperties, error: propertiesError } = useQuery({
    queryKey: ["properties"],
    queryFn: api.getProperties,
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: roommates = [], isLoading: roommatesLoading, refetch: refetchRoommates, error: roommatesError } = useQuery({
    queryKey: ["roommates"],
    queryFn: api.getRoommates,
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const swipeMutation = useMutation({
    mutationFn: ({ targetType, targetId, action }: { targetType: 'property' | 'roommate', targetId: string, action: 'like' | 'skip' }) =>
      api.swipe(targetType, targetId, action),
    onSuccess: () => {
      refetchProperties();
      refetchRoommates();
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

  // Combine properties and roommates if looking for both
  const combinedItems: SwipeItem[] = useMemo(() => {
    if (lookingForBoth) {
      // User wants both - combine them
      const props = properties.map(p => ({ id: p.id, type: "property" as const, data: p }));
      const roomies = roommates.map(r => ({ id: r.id, type: "roommate" as const, data: r }));
      // Interleave them for variety
      const combined: SwipeItem[] = [];
      const maxLen = Math.max(props.length, roomies.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < props.length) combined.push(props[i]);
        if (i < roomies.length) combined.push(roomies[i]);
      }
      return combined;
    } else if (lookingForRoommates && !lookingForHomes) {
      // User only wants roommates
      return roommates.map(r => ({ id: r.id, type: "roommate" as const, data: r }));
    } else if (lookingForHomes && !lookingForRoommates) {
      // User only wants properties
      return properties.map(p => ({ id: p.id, type: "property" as const, data: p }));
    } else {
      // Fallback to mode-based (for users who haven't set lookingFor yet)
      if (mode === "properties") {
        return properties.map(p => ({ id: p.id, type: "property" as const, data: p }));
      } else {
        return roommates.map(r => ({ id: r.id, type: "roommate" as const, data: r }));
      }
    }
  }, [properties, roommates, lookingForBoth, lookingForRoommates, lookingForHomes, mode]);

  const handleSwipe = (direction: "left" | "right") => {
    setLastDirection(direction);
    if (filteredItems.length > 0) {
      const item = filteredItems[0];
      swipeMutation.mutate({
        targetType: item.type,
        targetId: item.id,
        action: direction === "right" ? "like" : "skip",
      });
    }
  };

  const isLoading = lookingForBoth 
    ? (propertiesLoading || roommatesLoading)
    : (mode === "properties" ? propertiesLoading : roommatesLoading);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  const currentFilters = lookingForBoth 
    ? (propertyFilters || roommateFilters) // Use whichever filter is set
    : (mode === "properties" ? propertyFilters : roommateFilters);

  const filteredItems = combinedItems.filter(item => {
    if (!currentFilters) return true;
    if (item.type === "property") {
      const prop = item.data as any;
      if (currentFilters.priceRange && (prop.price < currentFilters.priceRange[0] || prop.price > currentFilters.priceRange[1])) return false;
      if (currentFilters.beds !== null && prop.beds < currentFilters.beds) return false;
      if (currentFilters.baths !== null && prop.baths < currentFilters.baths) return false;
    } else {
      const roommate = item.data as any;
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
            type={lookingForBoth ? "both" : (mode === "properties" ? "property" : "roommate")} 
            onApply={(filters) => {
              if (lookingForBoth) {
                setPropertyFilters(filters);
                setRoommateFilters(filters);
              } else if (mode === "properties") {
                setPropertyFilters(filters);
              } else {
                setRoommateFilters(filters);
              }
              toast({
                title: "Filters Applied",
                description: "Your search preferences have been updated",
              });
            }}
            currentFilters={currentFilters}
          />
        </div>
      </header>
      
      {/* Mode Toggle - Show only if user hasn't set preferences yet */}
      {userLookingFor.length === 0 && (
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
      )}

      <main className={`h-[calc(100vh-140px)] w-full max-w-md mx-auto ${lookingForBoth ? 'pt-16' : 'pt-24'} px-4 flex flex-col items-center justify-center relative`}>
        {isLoading && !loadingTimeout ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : loadingTimeout ? (
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Home className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("empty.noProperties")}
            </h3>
            <p className="text-gray-500 mb-4">
              {propertiesError || roommatesError 
                ? (propertiesError?.message || roommatesError?.message || "Failed to load content")
                : "No content available"}
            </p>
            <button
              onClick={() => {
                setLoadingTimeout(false);
                refetchProperties();
                refetchRoommates();
              }}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredItems.length > 0 ? (
              <div className="relative w-full h-[60vh]">
                {filteredItems.slice(0, 2).reverse().map((item, index) => (
                   <SwipeCard 
                     key={`${item.type}-${item.id}`} 
                     data={item.data} 
                     type={item.type === "property" ? "property" : "tenant"} 
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
                  {lookingForBoth ? (
                    <Heart className="text-gray-400" size={32} />
                  ) : mode === "properties" ? (
                    <Heart className="text-gray-400" size={32} />
                  ) : (
                    <Users className="text-gray-400" size={32} />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {lookingForBoth 
                    ? t("empty.noMatches")
                    : (mode === "properties" ? t("empty.noProperties") : t("empty.noRoommates"))}
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
                lookingForBoth || mode === "properties" 
                  ? "bg-primary shadow-primary/30" 
                  : "bg-secondary shadow-secondary/30"
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
