import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { Link } from "wouter";
import { Plus, Edit2, MapPin, Trash2, Home } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function LandlordListings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["landlordProperties"],
    queryFn: api.getLandlordProperties,
  });

  const deleteMutation = useMutation({
    mutationFn: (propertyId: string) => api.deleteProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
      toast({
        title: "Property deleted",
        description: "The property has been removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (propertyId: string, propertyTitle: string) => {
    if (confirm(`Are you sure you want to delete "${propertyTitle}"?`)) {
      deleteMutation.mutate(propertyId);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar 
        title={t("nav.listings")} 
        actionIcon={Plus} 
        onAction={() => window.location.href = "/landlord/create"}
      />

      <main className="pt-20 px-4 max-w-md mx-auto space-y-4">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading properties...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center p-8 mt-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Home className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-500">Create your first listing to get started!</p>
            <Link href="/landlord/create" className="mt-6 inline-block bg-primary text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all">
            Create Listing
          </Link>
          </div>
        ) : (
          listings.map((prop) => (
            <div key={prop.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 border border-gray-100">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <img 
                  src={prop.images && prop.images.length > 0 ? prop.images[0] : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"} 
                  alt={prop.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{prop.title}</h3>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin size={12} />
                    <span>{prop.city}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="font-bold text-primary">€{prop.price}<span className="text-xs text-gray-400 font-normal">/mo</span></span>
                  <div className="flex gap-2">
                    <button className="text-sm font-semibold text-gray-600 hover:text-primary flex items-center gap-1">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(prop.id, prop.title)}
                      disabled={deleteMutation.isPending}
                      className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Floating Action Button (Alternative to TopBar action) */}
      <Link href="/landlord/create" className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
        <Plus size={28} />
      </Link>

      <BottomNav role="landlord" />
    </div>
  );
}
