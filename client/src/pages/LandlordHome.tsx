import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { SwipeCard } from "@/components/SwipeCard";
import { Filter, X, Check, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function LandlordHome() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const { data: tenants = [], isLoading, refetch } = useQuery({
    queryKey: ["roommates"],
    queryFn: api.getRoommates,
  });

  const swipeMutation = useMutation({
    mutationFn: ({ targetId, action }: { targetId: string, action: 'like' | 'skip' }) =>
      api.swipe("roommate", targetId, action),
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process swipe",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (direction: "left" | "right") => {
    if (tenants.length > 0) {
      const tenant = tenants[0];
      swipeMutation.mutate({
        targetId: tenant.id,
        action: direction === "right" ? "like" : "skip",
      });
    }
  };

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar title="Find Tenants" actionIcon={Filter} onAction={() => console.log("Filter")} />

      <main className="h-[calc(100vh-140px)] w-full max-w-md mx-auto pt-20 px-4 flex flex-col items-center justify-center relative">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading tenants...</p>
          </div>
        ) : (
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
                  <Users className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No more tenants</h3>
                <p className="text-gray-500">{t("empty.checkLater")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Action Buttons */}
        {!isLoading && tenants.length > 0 && (
          <div className="mt-8 flex items-center gap-6 z-10">
            <button 
              onClick={() => handleSwipe("left")}
              disabled={swipeMutation.isPending}
              className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors border border-red-100 disabled:opacity-50"
            >
              <X size={32} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => handleSwipe("right")}
              disabled={swipeMutation.isPending}
              className="w-16 h-16 rounded-full bg-green-500 shadow-lg shadow-green-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform disabled:opacity-50"
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
