import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { mockProperties } from "@/lib/mockData";
import { Link } from "wouter";
import { Plus, Edit2, MapPin } from "lucide-react";

export default function LandlordListings() {
  const { t } = useLanguage();
  // Landlord sees all properties for mock
  const listings = mockProperties;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar 
        title={t("nav.listings")} 
        actionIcon={Plus} 
        onAction={() => window.location.href = "/landlord/create"}
      />

      <main className="pt-20 px-4 max-w-md mx-auto space-y-4">
        {listings.map((prop) => (
          <div key={prop.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 border border-gray-100">
            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
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
                <button className="text-sm font-semibold text-gray-600 hover:text-primary flex items-center gap-1">
                  <Edit2 size={14} /> Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Action Button (Alternative to TopBar action) */}
      <Link href="/landlord/create">
        <a className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
          <Plus size={28} />
        </a>
      </Link>

      <BottomNav role="landlord" />
    </div>
  );
}
