import { Home, Heart, MessageCircle, User, ListPlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import logo from "@assets/logo-removebg-preview_1765398497308.png";

export function BottomNav({ role }: { role: "tenant" | "landlord" }) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [shouldRender, setShouldRender] = useState(false);

  // Use useEffect to check route on mount and when location changes
  useEffect(() => {
    // Get current path from both wouter and window.location for maximum reliability
    const wouterPath = location || '';
    const windowPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const currentPath = wouterPath || windowPath;
    
    // Hide bottom nav on auth pages, role selection, and onboarding pages
    const hideNavRoutes = [
      "/auth",
      "/role",
      "/tenant/welcome",
      "/tenant/profile/step-1",
      "/tenant/verify",
      "/tenant/intro",
      "/landlord/welcome",
      "/landlord/landing",
      "/landlord/intro",
      "/landlord/criteria",
      "/landlord/verify",
      "/landlord/add-property",
      "/landlord/property",
      "/landlord/publish",
      "/reset-password",
      "/terms",
      "/privacy-policy",
      "/paywall",
    ];

    // Check if current path matches any hidden route (exact match or starts with)
    const matchesHiddenRoute = hideNavRoutes.some(route => {
      return currentPath === route || currentPath.startsWith(route + "/");
    });

    // Also check if we're on root path or any auth-related path
    const isAuthOrRoot = currentPath === "/" || 
                         currentPath === "" || 
                         currentPath.includes("auth") ||
                         currentPath.includes("role") ||
                         currentPath.includes("reset-password") ||
                         currentPath.includes("signup") ||
                         currentPath.includes("login");

    // Determine if we should render the nav
    const shouldHide = matchesHiddenRoute || 
                       isAuthOrRoot || 
                       currentPath === "/" ||
                       currentPath === "/auth" ||
                       !currentPath || 
                       currentPath.trim() === "" ||
                       (typeof window !== 'undefined' && window.location.pathname === "/auth") ||
                       (typeof window !== 'undefined' && window.location.pathname.startsWith("/auth"));

    setShouldRender(!shouldHide);
  }, [location]);

  // Get current path for the rest of the component
  const wouterPath = location || '';
  const windowPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const currentPath = wouterPath || windowPath;
  
  // Don't render if shouldRender is false (determined by useEffect)
  if (!shouldRender) {
    return null;
  }

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
    { href: "/landlord/profile", icon: User, label: t("nav.profile") },
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

export function TopBar({ title, actionIcon: ActionIcon, onAction, actionPosition = "right" }: { title?: string, actionIcon?: any, onAction?: () => void, actionPosition?: "left" | "right" }) {
  const { t } = useLanguage();
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-4 border-b border-gray-50">
      <div className="w-10 flex justify-start">
        {ActionIcon && actionPosition === "left" && (
          <button onClick={onAction} className="p-2 text-gray-600 hover:text-primary transition-colors">
            <ActionIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      {title ? (
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      ) : (
        <div className="flex items-center gap-2">
          <img src={logo} alt="Tenant Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-lg font-bold text-gray-900">{t("app.name")}</h1>
        </div>
      )}
      <div className="w-10 flex justify-end">
        {ActionIcon && actionPosition === "right" && (
          <button onClick={onAction} className="p-2 text-gray-600 hover:text-primary transition-colors">
            <ActionIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
