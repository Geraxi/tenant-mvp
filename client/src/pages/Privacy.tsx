import { useLanguage } from "@/lib/i18n";
import { BottomNav, TopBar } from "@/components/Layout";
import { ArrowLeft, Shield, Eye, Lock, Trash2, Download } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy({ role }: { role: "tenant" | "landlord" }) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      <TopBar 
        title="Privacy & Security" 
        actionIcon={ArrowLeft} 
        onAction={() => setLocation(`/${role}/profile`)}
        actionPosition="left"
      />

      <main className="pt-24 px-4 max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Eye size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Profile Visibility</h3>
                <p className="text-xs text-gray-500">Control who can see your profile</p>
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full" data-testid="status-visibility">
                Public
              </span>
            </div>
          </div>

          <div className="p-5 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full" data-testid="status-2fa">
                Off
              </span>
            </div>
          </div>

          <div className="p-5 border-b border-gray-50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
              <Download size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Download My Data</h3>
              <p className="text-xs text-gray-500">Contact support to request your data</p>
            </div>
          </div>

          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-600">Delete Account</h3>
              <p className="text-xs text-gray-500">Contact support to delete your account</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-start gap-3">
            <Shield className="text-primary mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Your Data is Protected</h3>
              <p className="text-sm text-gray-500">
                We use industry-standard encryption to protect your personal information. 
                Your data is never shared with third parties without your consent.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav role={role} />
    </div>
  );
}
