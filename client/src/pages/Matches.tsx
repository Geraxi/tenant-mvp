import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { Link, useLocation } from "wouter";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Matches({ role }: { role: "tenant" | "landlord" }) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: api.getMatches,
  });

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar title={t("nav.matches")} />

      <main className="pt-20 px-4 max-w-md mx-auto">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center p-8 mt-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-500">Keep swiping to find your perfect match!</p>
          </div>
        ) : (
          <>
            {/* New Matches Row */}
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">New Matches</h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-2">
                {matches.slice(0, 4).map((match) => (
                  <button 
                    key={match.id} 
                    onClick={() => setLocation(`/chat/${match.id}`)}
                    className="flex flex-col items-center gap-1 min-w-[70px]"
                    data-testid={`match-avatar-${match.id}`}
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-primary p-0.5">
                       <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden">
                         <img src={`https://i.pravatar.cc/150?u=${match.id}`} className="w-full h-full object-cover" />
                       </div>
                    </div>
                    <span className="text-xs font-semibold truncate w-full text-center">
                      {match.id.substring(0, 8)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-2">
               <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Messages</h2>
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                 {matches.map((match) => (
                   <button 
                     key={match.id} 
                     onClick={() => setLocation(`/chat/${match.id}`)}
                     className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                     data-testid={`match-message-${match.id}`}
                   >
                     <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                       <img src={`https://i.pravatar.cc/150?u=${match.id}`} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-baseline mb-1">
                         <h3 className="font-bold text-gray-900 truncate">Match {match.id.substring(0, 8)}</h3>
                         <span className="text-xs text-gray-400 font-medium">New</span>
                       </div>
                       <p className="text-sm text-gray-500 truncate">Start a conversation...</p>
                     </div>
                   </button>
                 ))}
               </div>
            </div>
          </>
        )}
      </main>

      <BottomNav role={role} />
    </div>
  );
}
