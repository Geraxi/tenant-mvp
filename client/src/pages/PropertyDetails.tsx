import { useLanguage } from "@/lib/i18n";
import { mockProperties } from "@/lib/mockData";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

export default function PropertyDetails() {
  const { t } = useLanguage();
  const [, params] = useRoute("/property/:id");
  const id = params?.id;
  const property = mockProperties.find(p => p.id === id);
  const [isSaved, setIsSaved] = useState(false);
  const [emblaRef] = useEmblaCarousel({ loop: true });

  if (!property) return <div>Not found</div>;

  return (
    <div className="min-h-full bg-white pb-24">
      {/* Header Image Carousel */}
      <div className="relative h-[50vh] bg-gray-100 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {property.images.map((src, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative" key={index}>
              <img src={src} alt={`${property.title} - ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        
        {/* Nav overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <Link href="/tenant">
            <a className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors pointer-events-auto">
              <ArrowLeft size={24} />
            </a>
          </Link>
          <div className="flex gap-2">
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors pointer-events-auto">
              <Share2 size={24} />
            </button>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {property.images.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 -mt-8 relative bg-white rounded-t-[2rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.1)]">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{property.title}</h1>
            <div className="flex items-center gap-1 text-gray-500 mt-1">
              <MapPin size={16} />
              <span>{property.area}, {property.city}</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xl font-bold text-primary">€{property.price}</div>
             <div className="text-xs text-gray-400">/month</div>
          </div>
        </div>

        {/* Features */}
        <div className="flex gap-4 py-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 whitespace-nowrap">
            <Bed size={20} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{property.bedrooms} {t("prop.beds")}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 whitespace-nowrap">
            <Bath size={20} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{property.bathrooms} {t("prop.baths")}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 whitespace-nowrap">
             <Building2 size={20} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{property.type}</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t("form.desc")}</h2>
          <p className="text-gray-600 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Landlord Preview */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-24">
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
             <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-bold text-gray-900">James Estate</div>
            <div className="text-xs text-gray-500">Listed 2 days ago</div>
          </div>
          <button className="ml-auto text-primary font-bold text-sm bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            Profile
          </button>
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-4 items-center z-50 px-6 pb-8">
        <button 
          onClick={() => setIsSaved(!isSaved)}
          className={cn(
            "p-4 rounded-2xl border-2 transition-colors",
            isSaved ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-400 hover:border-gray-300"
          )}
        >
          <Heart fill={isSaved ? "currentColor" : "none"} />
        </button>
        <Link href={`/chat/new?property=${id}`}>
          <a className="flex-1 bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center">
            {t("action.contact")}
          </a>
        </Link>
      </div>
    </div>
  );
}
