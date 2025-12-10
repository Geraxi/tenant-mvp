import { Home, Heart, MessageCircle, User, Building, ListPlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import logo from "@assets/logo-removebg-preview_1765398497308.png";

export function BottomNav({ role }: { role: "tenant" | "landlord" }) {
  const [location] = useLocation();
  const { t } = useLanguage();

  const tenantLinks = [
    { href: "/tenant", icon: Home, label: t("nav.home") },
    { href: "/tenant/favorites", icon: Heart, label: t("nav.favorites") },
    { href: "/tenant/matches", icon: MessageCircle, label: t("nav.matches") },
    { href: "/tenant/profile", icon: User, label: t("nav.profile") },
  ];

  const landlordLinks = [
    { href: "/landlord", icon: User, label: "Tenants" }, // "Swipe Tenants"
    { href: "/landlord/listings", icon: ListPlus, label: t("nav.listings") },
    { href: "/landlord/matches", icon: MessageCircle, label: t("nav.matches") },
    { href: "/landlord/profile", icon: Building, label: t("nav.profile") },
  ];

  const links = role === "tenant" ? tenantLinks : landlordLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe-bottom pt-2 px-6 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors duration-200",
              isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
            )}>
              <link.icon className={cn("w-6 h-6", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar({ title, actionIcon: ActionIcon, onAction }: { title?: string, actionIcon?: any, onAction?: () => void }) {
  const { t } = useLanguage();
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-4 border-b border-gray-50">
      <div className="w-10"></div> {/* Spacer for balance */}
      {title ? (
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      ) : (
        <div className="flex items-center gap-2">
          <img src={logo} alt="Tenant Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-lg font-bold text-gray-900">{t("app.name")}</h1>
        </div>
      )}
      <div className="w-10 flex justify-end">
        {ActionIcon && (
          <button onClick={onAction} className="p-2 text-gray-600 hover:text-primary transition-colors">
            <ActionIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
