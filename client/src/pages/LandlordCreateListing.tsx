import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, Upload, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function LandlordCreateListing() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    title: "",
    city: "",
    area: "",
    price: "",
    bedrooms: 1,
    bathrooms: 1,
    type: "Apartment",
    description: "",
    furnished: true,
    pets: false,
    amenities: "",
  });

  const createMutation = useMutation({
    mutationFn: (property: any) => api.createProperty(property),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
      toast({
        title: "Success",
        description: "Property created successfully!",
      });
      setLocation("/landlord/listings");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const propertyData = {
      title: formData.title,
      city: formData.city,
      area: formData.area || formData.city,
      price: parseInt(formData.price),
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      type: formData.type,
      description: formData.description,
      furnished: formData.furnished,
      pets: formData.pets,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
      ],
    };

    createMutation.mutate(propertyData);
  };

  return (
    <div className="min-h-full bg-gray-50 pb-24">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white z-40 flex items-center px-4 border-b border-gray-100">
        <Link href="/landlord/listings">
          <a className="p-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </a>
        </Link>
        <h1 className="ml-2 text-lg font-bold text-gray-900">{t("action.addListing")}</h1>
      </header>

      <main className="pt-20 px-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Image Picker Mock */}
          <div className="w-full aspect-video bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-primary/50 hover:text-primary transition-all">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2">
              <Upload size={20} />
            </div>
            <span className="text-sm font-semibold">Upload Photos</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t("form.title")}</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none transition-colors" 
                placeholder="e.g. Modern Loft..." 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("form.city")}</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none transition-colors" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("form.price")}</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none transition-colors" 
                  placeholder="€" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("prop.beds")}</label>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
                   <button 
                     type="button" 
                     onClick={() => setFormData({ ...formData, bedrooms: Math.max(1, formData.bedrooms - 1) })}
                     className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-bold hover:bg-gray-200"
                   >
                     -
                   </button>
                   <span className="flex-1 text-center font-bold">{formData.bedrooms}</span>
                   <button 
                     type="button" 
                     onClick={() => setFormData({ ...formData, bedrooms: formData.bedrooms + 1 })}
                     className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-bold hover:bg-gray-200"
                   >
                     +
                   </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("prop.baths")}</label>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
                   <button 
                     type="button" 
                     onClick={() => setFormData({ ...formData, bathrooms: Math.max(1, formData.bathrooms - 1) })}
                     className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-bold hover:bg-gray-200"
                   >
                     -
                   </button>
                   <span className="flex-1 text-center font-bold">{formData.bathrooms}</span>
                   <button 
                     type="button" 
                     onClick={() => setFormData({ ...formData, bathrooms: formData.bathrooms + 1 })}
                     className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 font-bold hover:bg-gray-200"
                   >
                     +
                   </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t("form.desc")}</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none transition-colors min-h-[120px]" 
                placeholder="Tell us about the property..." 
              />
            </div>

            <div 
              onClick={() => setFormData({ ...formData, furnished: !formData.furnished })}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 cursor-pointer"
            >
               <span className="font-semibold text-gray-700">{t("prop.furnished")}</span>
               <div className={`w-12 h-7 rounded-full relative transition-colors ${formData.furnished ? 'bg-primary' : 'bg-gray-300'}`}>
                 <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.furnished ? 'right-1' : 'left-1'}`} />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t("form.amenities")}</label>
              <textarea 
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none transition-colors min-h-[80px]" 
                placeholder="e.g. Balcony, Dishwasher, Elevator..." 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? "Creating..." : t("action.submit")}
          </button>

        </form>
      </main>
    </div>
  );
}
