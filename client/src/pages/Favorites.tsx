import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { mockProperties } from "@/lib/mockData";
import { Link } from "wouter";
import { MapPin } from "lucide-react";

export default function Favorites() {
  const { t } = useLanguage();
  // Mock favorites - just take first 2
  const favorites = mockProperties.slice(0, 2);

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar title={t("nav.favorites")} />

      <main className="pt-20 px-4 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {favorites.map((prop) => (
            <Link key={prop.id} href={`/property/${prop.id}`}>
              <a className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="aspect-[4/5] relative">
                  <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
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
              </a>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav role="tenant" />
    </div>
  );
}
