import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { Link } from "wouter";

export default function Matches({ role }: { role: "tenant" | "landlord" }) {
  const { t } = useLanguage();

  const matches = [
    { id: 1, name: "Marco Rossi", message: "Is the apartment still available?", time: "2m", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" },
    { id: 2, name: "Sofia Bianchi", message: "Great, see you on Tuesday!", time: "1h", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" },
    { id: 3, name: "Luca Verdi", message: "Thanks for the info.", time: "1d", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title={t("nav.matches")} />

      <main className="pt-20 px-4 max-w-md mx-auto">
        
        {/* New Matches Row */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">New Matches</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[70px]">
                <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-primary p-0.5">
                   <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden">
                     <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-full h-full object-cover" />
                   </div>
                </div>
                <span className="text-xs font-semibold truncate w-full text-center">User {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-2">
           <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Messages</h2>
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             {matches.map((match) => (
               <div key={match.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer">
                 <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                   <img src={match.img} alt={match.name} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-baseline mb-1">
                     <h3 className="font-bold text-gray-900 truncate">{match.name}</h3>
                     <span className="text-xs text-gray-400 font-medium">{match.time}</span>
                   </div>
                   <p className="text-sm text-gray-500 truncate">{match.message}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

      </main>

      <BottomNav role={role} />
    </div>
  );
}
