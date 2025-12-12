import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, Send, MoreVertical, Flag, Ban } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ChatRoom() {
  const { id: matchId } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: api.getMe,
  });

  const { data: matchData } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => api.getMatch(matchId!),
    enabled: !!matchId,
  });

  const { data: messages = [], refetch } = useQuery({
    queryKey: ["messages", matchId],
    queryFn: () => api.getMatchMessages(matchId!),
    enabled: !!matchId,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.sendMessage(matchId!, content),
    onSuccess: () => {
      setMessage("");
      refetch();
    },
  });

  const reportMutation = useMutation({
    mutationFn: (data: { reportedUserId: string; reason: string; description?: string }) =>
      api.reportUser(data.reportedUserId, data.reason, data.description),
    onSuccess: () => {
      setShowReportDialog(false);
      setReportReason("");
      toast({
        title: language === "it" ? "Segnalazione inviata" : "Report submitted",
        description: language === "it" ? "Grazie per la segnalazione" : "Thank you for your report",
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: (blockedId: string) => api.blockUser(blockedId),
    onSuccess: () => {
      toast({
        title: language === "it" ? "Utente bloccato" : "User blocked",
      });
      setLocation(-1);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (matchData?.otherUserId) {
      setOtherUserId(matchData.otherUserId);
    } else if (messages.length > 0 && currentUser) {
      const otherMsg = messages.find(m => m.senderId !== currentUser.id);
      if (otherMsg) setOtherUserId(otherMsg.senderId);
    }
  }, [matchData, messages, currentUser]);

  const handleSend = () => {
    if (message.trim()) {
      sendMutation.mutate(message.trim());
    }
  };

  const handleReport = () => {
    if (otherUserId && reportReason) {
      reportMutation.mutate({
        reportedUserId: otherUserId,
        reason: reportReason,
      });
    }
  };

  const handleBlock = () => {
    if (otherUserId) {
      blockMutation.mutate(otherUserId);
    }
  };

  const texts = {
    typeMessage: language === "it" ? "Scrivi un messaggio..." : "Type a message...",
    report: language === "it" ? "Segnala utente" : "Report user",
    block: language === "it" ? "Blocca utente" : "Block user",
    reportTitle: language === "it" ? "Segnala questo utente" : "Report this user",
    reportPlaceholder: language === "it" ? "Descrivi il problema..." : "Describe the issue...",
    cancel: language === "it" ? "Annulla" : "Cancel",
    submit: language === "it" ? "Invia segnalazione" : "Submit report",
  };

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white z-40 flex items-center justify-between px-4 border-b border-gray-100">
        <button onClick={() => setLocation(-1)} className="p-2 -ml-2" data-testid="button-back">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Chat</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 -mr-2" data-testid="button-menu">
              <MoreVertical size={24} className="text-gray-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowReportDialog(true)} data-testid="button-report">
              <Flag className="mr-2 h-4 w-4" />
              {texts.report}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBlock} className="text-red-600" data-testid="button-block">
              <Ban className="mr-2 h-4 w-4" />
              {texts.block}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 pt-14 pb-20 px-4 overflow-y-auto">
        <div className="space-y-3 py-4">
          {messages.map((msg, index) => {
            const isOwn = msg.senderId === currentUser?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                    isOwn
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-900 rounded-bl-md shadow-sm"
                  }`}
                  data-testid={`message-${msg.id}`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-400"}`}>
                    {new Date(msg.createdAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={texts.typeMessage}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="input-message"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50"
            data-testid="button-send"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.reportTitle}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder={texts.reportPlaceholder}
            rows={4}
            data-testid="input-report-reason"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              {texts.cancel}
            </Button>
            <Button onClick={handleReport} disabled={!reportReason.trim()}>
              {texts.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
