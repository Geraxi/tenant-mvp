import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Crown, Check, X, Sparkles, Heart, Eye, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

interface PaywallProps {
  onSkip?: () => void;
  reason?: "signup" | "swipe_limit";
}

export default function Paywall({ onSkip, reason = "signup" }: PaywallProps) {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  const texts = {
    title: language === "it" ? "Passa a Premium" : "Upgrade to Premium",
    subtitle: language === "it" 
      ? "Sblocca tutte le funzionalita per trovare la casa dei tuoi sogni"
      : "Unlock all features to find your dream home",
    swipeLimitTitle: language === "it" ? "Hai esaurito gli swipe gratuiti!" : "You've run out of free swipes!",
    swipeLimitSubtitle: language === "it"
      ? "Passa a Premium per swipe illimitati e altre funzionalita esclusive"
      : "Upgrade to Premium for unlimited swipes and exclusive features",
    monthly: language === "it" ? "Mensile" : "Monthly",
    yearly: language === "it" ? "Annuale" : "Yearly",
    popular: language === "it" ? "Piu popolare" : "Most Popular",
    save: language === "it" ? "Risparmi il 40%" : "Save 40%",
    continue: language === "it" ? "Continua" : "Continue",
    skip: language === "it" ? "Continua gratis (funzionalita limitate)" : "Continue free (limited features)",
    restorePurchase: language === "it" ? "Ripristina acquisti" : "Restore Purchase",
  };

  const features = [
    {
      icon: Sparkles,
      title: language === "it" ? "Swipe illimitati" : "Unlimited Swipes",
      description: language === "it" ? "Nessun limite giornaliero" : "No daily limits",
    },
    {
      icon: Heart,
      title: language === "it" ? "Vedi chi ti ha messo like" : "See Who Liked You",
      description: language === "it" ? "Scopri subito i tuoi match" : "Find your matches instantly",
    },
    {
      icon: Eye,
      title: language === "it" ? "Visualizzazioni prioritarie" : "Priority Views",
      description: language === "it" ? "Il tuo profilo in evidenza" : "Your profile gets more visibility",
    },
    {
      icon: MessageCircle,
      title: language === "it" ? "Messaggi illimitati" : "Unlimited Messages",
      description: language === "it" ? "Chatta senza limiti" : "Chat without limits",
    },
  ];

  const handleSubscribe = (plan: "monthly" | "yearly") => {
    console.log("Subscribe to:", plan);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      setLocation("/tenant");
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-amber-50 to-white flex flex-col">
      <div className="flex-1 p-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            {reason === "swipe_limit" ? texts.swipeLimitTitle : texts.title}
          </h1>
          <p className="text-gray-600">
            {reason === "swipe_limit" ? texts.swipeLimitSubtitle : texts.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-6"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
              <Check className="w-5 h-5 text-green-500 ml-auto" />
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-6"
        >
          <button
            onClick={() => handleSubscribe("yearly")}
            className="w-full relative bg-gradient-to-r from-amber-400 to-amber-500 text-white p-5 rounded-2xl shadow-lg"
            data-testid="button-subscribe-yearly"
          >
            <span className="absolute -top-2 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {texts.save}
            </span>
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-bold text-lg">{texts.yearly}</div>
                <div className="text-amber-100 text-sm">12 {language === "it" ? "mesi" : "months"}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-2xl">€7.99<span className="text-sm font-normal">/{language === "it" ? "mese" : "mo"}</span></div>
                <div className="text-amber-100 text-sm line-through">€12.99/{language === "it" ? "mese" : "mo"}</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSubscribe("monthly")}
            className="w-full bg-white border-2 border-gray-200 p-5 rounded-2xl"
            data-testid="button-subscribe-monthly"
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-bold text-lg text-gray-900">{texts.monthly}</div>
                <div className="text-gray-500 text-sm">1 {language === "it" ? "mese" : "month"}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-2xl text-gray-900">€12.99<span className="text-sm font-normal text-gray-500">/{language === "it" ? "mese" : "mo"}</span></div>
              </div>
            </div>
          </button>
        </motion.div>

        <div className="mt-auto space-y-3">
          <button
            onClick={handleSkip}
            className="w-full text-gray-500 py-3 text-sm"
            data-testid="button-skip-paywall"
          >
            {texts.skip}
          </button>
          
          <button
            className="w-full text-blue-500 py-2 text-sm font-medium"
            data-testid="button-restore-purchase"
          >
            {texts.restorePurchase}
          </button>

          <p className="text-center text-xs text-gray-400 px-4">
            {language === "it" 
              ? "L'abbonamento si rinnova automaticamente. Puoi annullare in qualsiasi momento."
              : "Subscription auto-renews. Cancel anytime."}
          </p>
        </div>
      </div>
    </div>
  );
}
