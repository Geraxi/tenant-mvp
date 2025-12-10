import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, Heart, MapPin, Euro } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { Property, Roommate } from "@shared/schema";

import { Link, useLocation } from "wouter";

interface SwipeCardProps {
  data: Property | Roommate;
  onSwipe: (direction: "left" | "right") => void;
  type: "property" | "tenant";
}

export function SwipeCard({ data, onSwipe, type }: SwipeCardProps) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [exitX, setExitX] = useState<number>(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipe("right");
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipe("left");
    }
  };

  const handleTap = () => {
     if (type === "property") {
       setLocation(`/property/${data.id}`);
     } else {
       setLocation(`/tenant-details/${data.id}`);
     }
  };

  const isProperty = type === "property";
  const propData = data as Property;
  const tenantData = data as Roommate;

  const imageUrl = data.images && data.images.length > 0 
    ? data.images[0] 
    : "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, x: exitX }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div 
        className="relative w-full h-[65vh] rounded-3xl overflow-hidden shadow-xl bg-white select-none"
        style={{ backgroundColor: "white", transform: "translateZ(0)" }} // Force opaque background and hardware acceleration
      >
        {/* Image */}
        <div className="absolute inset-0 bg-gray-200"> {/* Fallback background color */}
          <img 
            src={imageUrl} 
            alt={isProperty ? propData.title : tenantData.name}
            className="w-full h-full object-cover pointer-events-none"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Status Badges (Like/Nope) */}
        <motion.div 
          style={{ opacity: likeOpacity }} 
          className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-1 rotate-[-15deg] z-20"
        >
          <span className="text-green-500 font-bold text-4xl tracking-widest uppercase">
            {t("action.like")}
          </span>
        </motion.div>

        <motion.div 
          style={{ opacity: nopeOpacity }} 
          className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-1 rotate-[15deg] z-20"
        >
          <span className="text-red-500 font-bold text-4xl tracking-widest uppercase">
            {t("action.skip")}
          </span>
        </motion.div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          {isProperty ? (
            <>
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-3xl font-bold leading-tight drop-shadow-md">{propData.title}</h2>
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-lg font-bold">
                  €{propData.price}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-200 mb-4 text-lg">
                <MapPin className="w-5 h-5" />
                {propData.area}, {propData.city}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {propData.beds} {t("prop.beds")} • {propData.baths} {t("prop.baths")}
                {propData.furnished && <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-sm">{t("prop.furnished")}</span>}
              </div>
            </>
          ) : (
             <>
              <div className="flex items-end gap-3 mb-2">
                <h2 className="text-3xl font-bold drop-shadow-md">{tenantData.name}, {tenantData.age}</h2>
              </div>
              <div className="flex items-center gap-2 text-gray-200 mb-4 text-lg">
                 {tenantData.occupation}
              </div>
              <div className="flex items-center gap-2 text-lg font-semibold text-primary-foreground mb-4">
                 Budget: €{tenantData.budget}
              </div>
              <div className="flex flex-wrap gap-2">
                {tenantData.preferences.map(pref => (
                  <span key={pref} className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                    {pref}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons (outside card for easier tapping on small screens, or we can overlay them) */}
      {/* For this design, let's put them below the card in the parent container, but here we can add visual cues? No, keep it clean. */}
    </motion.div>
  );
}
