import { useLanguage } from "@/lib/i18n";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Share2, Users, Calendar, Briefcase, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function TenantDetails() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, params] = useRoute("/tenant-details/:id");
  const id = params?.id;
  const [emblaRef] = useEmblaCarousel({ loop: true });

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["roommate", id],
    queryFn: () => api.getRoommate(id!),
    enabled: !!id,
  });

  const swipeMutation = useMutation({
    mutationFn: () => api.swipe("roommate", id!, "like"),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Swipe sent successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send swipe",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    swipeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!tenant) return <div className="min-h-full bg-white flex items-center justify-center p-8">Profile not found</div>;

  return (
    <div className="min-h-full bg-white pb-24">
      {/* Header Image Carousel */}
      <div className="relative h-[50vh] bg-gray-100 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {tenant.images.map((src, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative" key={index}>
              <img src={src} alt={`${tenant.name} - ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        
        {/* Nav overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <Link href="/tenant" className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors pointer-events-auto">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex gap-2">
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors pointer-events-auto">
              <Share2 size={24} />
            </button>
          </div>
        </div>
        
        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {tenant.images.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 -mt-8 relative bg-white rounded-t-[2rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.1)]">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight flex items-center gap-2">
              {tenant.name}, {tenant.age}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 mt-1 font-medium">
              <Briefcase size={16} />
              <span>{tenant.occupation}</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xl font-bold text-secondary">€{tenant.budget}</div>
             <div className="text-xs text-gray-400">/month</div>
          </div>
        </div>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-2xl border border-purple-100 text-purple-700">
            <Calendar size={18} />
            <span className="font-semibold text-sm">Move-in: {tenant.moveInDate}</span>
          </div>
          {tenant.preferences.map((pref, i) => (
            <div key={i} className="px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 text-gray-600 font-semibold text-sm">
              {pref}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">About me</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {tenant.bio}
          </p>
        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-4 items-center z-50 px-6 pb-8">
        <button 
          onClick={handleLike}
          disabled={swipeMutation.isPending}
          className={cn(
            "p-4 rounded-2xl border-2 transition-colors border-secondary bg-secondary/5 text-secondary hover:bg-secondary/10",
            swipeMutation.isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <Heart fill="currentColor" />
        </button>
        <Link href={`/chat/new?user=${id}`} className="flex-1 bg-secondary text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-secondary/25 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center">
          {t("action.contactRoommate")}
        </Link>
      </div>
    </div>
  );
}
