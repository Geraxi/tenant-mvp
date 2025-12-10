import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { Link } from "wouter";
import { MapPin, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Favorites() {
  const { t } = useLanguage();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: api.getFavorites,
  });

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar title={t("nav.favorites")} />

      <main className="pt-20 px-4 max-w-md mx-auto">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center p-8 mt-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500">Start swiping to add properties to your favorites!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map((prop) => (
              <Link key={prop.id} href={`/property/${prop.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group block">
                <div className="aspect-[4/5] relative">
                  <img 
                    src={prop.images && prop.images.length > 0 ? prop.images[0] : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"} 
                    alt={prop.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                    €{prop.price}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 truncate">{prop.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin size={12} />
                    <span className="truncate">{prop.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav role="tenant" />
    </div>
  );
}
