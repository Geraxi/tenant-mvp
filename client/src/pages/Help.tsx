import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { ArrowLeft, MessageCircle, Mail, FileText, ChevronRight, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function Help({ role }: { role: "tenant" | "landlord" }) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const faqs = [
    {
      question: "How do I find a property?",
      answer: "Swipe right on properties you like and left to skip. When a landlord likes you back, it's a match!"
    },
    {
      question: "How do matches work?",
      answer: "When both you and another user swipe right on each other, you get matched and can start messaging."
    },
    {
      question: "How do I update my profile?",
      answer: "Go to your Profile page and tap on the settings icon to edit your information."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We use industry-standard encryption to protect all your personal information."
    }
  ];

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar 
        title="Help & Support" 
        actionIcon={ArrowLeft} 
        onAction={() => setLocation(`/${role}/profile`)}
        actionPosition="left"
      />

      <main className="pt-24 px-4 max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Live Chat Support</h3>
              <p className="text-xs text-gray-500" data-testid="text-chat-status">Coming soon</p>
            </div>
          </div>

          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Email Support</h3>
              <p className="text-xs text-gray-500" data-testid="text-support-email">support@tenant.app</p>
            </div>
          </div>
        </div>

        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Frequently Asked Questions</h2>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {faqs.map((faq, index) => (
            <details key={index} className="group border-b border-gray-50 last:border-0">
              <summary className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer list-none">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-gray-900">{faq.question}</h3>
                </div>
                <ChevronRight size={18} className="text-gray-300 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-5 pl-[4.5rem]">
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400">
          App Version 1.0.0
        </p>
      </main>

      <BottomNav role={role} />
    </div>
  );
}
