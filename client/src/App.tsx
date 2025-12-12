import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/lib/i18n";
import { MobileFrame } from "@/components/MobileFrame";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

import Auth from "@/pages/Auth";
import RoleSelection from "@/pages/RoleSelection";
import Onboarding from "@/pages/Onboarding";
import TenantHome from "@/pages/TenantHome";
import Favorites from "@/pages/Favorites";
import PropertyDetails from "@/pages/PropertyDetails";
import LandlordHome from "@/pages/LandlordHome";
import LandlordListings from "@/pages/LandlordListings";
import LandlordCreateListing from "@/pages/LandlordCreateListing";
import Matches from "@/pages/Matches";
import Profile from "@/pages/Profile";
import Chat from "@/pages/Chat";

import TenantDetails from "@/pages/TenantDetails";
import Privacy from "@/pages/Privacy";
import Help from "@/pages/Help";
import Terms from "@/pages/Terms";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Paywall from "@/pages/Paywall";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/paywall">
        {() => <Paywall />}
      </Route>
      <Route path="/role" component={RoleSelection} />
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Tenant Routes */}
      <Route path="/tenant">
        {() => <ProtectedRoute requiredRole="tenant"><TenantHome /></ProtectedRoute>}
      </Route>
      <Route path="/tenant/favorites">
        {() => <ProtectedRoute requiredRole="tenant"><Favorites /></ProtectedRoute>}
      </Route>
      <Route path="/tenant/matches">
        {() => <ProtectedRoute requiredRole="tenant"><Matches role="tenant" /></ProtectedRoute>}
      </Route>
      <Route path="/tenant/profile">
        {() => <ProtectedRoute requiredRole="tenant"><Profile role="tenant" /></ProtectedRoute>}
      </Route>
      <Route path="/tenant/privacy">
        {() => <ProtectedRoute requiredRole="tenant"><Privacy role="tenant" /></ProtectedRoute>}
      </Route>
      <Route path="/tenant/help">
        {() => <ProtectedRoute requiredRole="tenant"><Help role="tenant" /></ProtectedRoute>}
      </Route>
      <Route path="/property/:id">
        {() => <ProtectedRoute><PropertyDetails /></ProtectedRoute>}
      </Route>
      <Route path="/tenant-details/:id">
        {() => <ProtectedRoute><TenantDetails /></ProtectedRoute>}
      </Route>

      {/* Landlord Routes */}
      <Route path="/landlord">
        {() => <ProtectedRoute requiredRole="landlord"><LandlordHome /></ProtectedRoute>}
      </Route>
      <Route path="/landlord/listings">
        {() => <ProtectedRoute requiredRole="landlord"><LandlordListings /></ProtectedRoute>}
      </Route>
      <Route path="/landlord/create">
        {() => <ProtectedRoute requiredRole="landlord"><LandlordCreateListing /></ProtectedRoute>}
      </Route>
      <Route path="/landlord/matches">
        {() => <ProtectedRoute requiredRole="landlord"><Matches role="landlord" /></ProtectedRoute>}
      </Route>
      <Route path="/landlord/profile">
        {() => <ProtectedRoute requiredRole="landlord"><Profile role="landlord" /></ProtectedRoute>}
      </Route>
      <Route path="/landlord/privacy">
        {() => <ProtectedRoute requiredRole="landlord"><Privacy role="landlord" /></ProtectedRoute>}
      </Route>
      <Route path="/landlord/help">
        {() => <ProtectedRoute requiredRole="landlord"><Help role="landlord" /></ProtectedRoute>}
      </Route>

      <Route path="/chat/:id">
        {() => <ProtectedRoute><Chat /></ProtectedRoute>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <MobileFrame>
          <Router />
          <Toaster />
        </MobileFrame>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
