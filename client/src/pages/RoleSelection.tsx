import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import { User, Building2, ChevronRight } from "lucide-react";

export default function RoleSelection() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-gray-900 mb-2">{t("role.title")}</h1>
          <p className="text-gray-500">Select how you want to use Tenant</p>
        </motion.div>

        <div className="grid gap-4">
          <Link href="/tenant">
            <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group block p-6 rounded-3xl border-2 border-gray-100 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all relative overflow-hidden"
            >
              <div className="flex items-center gap-4 z-10 relative">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <User size={28} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{t("role.tenant")}</h3>
                  <p className="text-sm text-gray-500">I'm looking for a home</p>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-primary transition-colors" />
              </div>
            </motion.a>
          </Link>

          <Link href="/landlord">
            <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group block p-6 rounded-3xl border-2 border-gray-100 hover:border-secondary/50 hover:bg-secondary/5 cursor-pointer transition-all relative overflow-hidden"
            >
              <div className="flex items-center gap-4 z-10 relative">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <Building2 size={28} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{t("role.landlord")}</h3>
                  <p className="text-sm text-gray-500">I want to list a property</p>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-secondary transition-colors" />
              </div>
            </motion.a>
          </Link>
        </div>
      </div>
    </div>
  );
}
