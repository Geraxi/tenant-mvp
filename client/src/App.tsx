import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/lib/i18n";
import NotFound from "@/pages/not-found";

import Auth from "@/pages/Auth";
import RoleSelection from "@/pages/RoleSelection";
import TenantHome from "@/pages/TenantHome";
import Favorites from "@/pages/Favorites";
import PropertyDetails from "@/pages/PropertyDetails";
import LandlordHome from "@/pages/LandlordHome";
import LandlordListings from "@/pages/LandlordListings";
import LandlordCreateListing from "@/pages/LandlordCreateListing";
import Matches from "@/pages/Matches";
import Profile from "@/pages/Profile";
import Chat from "@/pages/Chat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/role" component={RoleSelection} />
      
      {/* Tenant Routes */}
      <Route path="/tenant" component={TenantHome} />
      <Route path="/tenant/favorites" component={Favorites} />
      <Route path="/tenant/matches">
        {() => <Matches role="tenant" />}
      </Route>
      <Route path="/tenant/profile">
        {() => <Profile role="tenant" />}
      </Route>
      <Route path="/property/:id" component={PropertyDetails} />

      {/* Landlord Routes */}
      <Route path="/landlord" component={LandlordHome} />
      <Route path="/landlord/listings" component={LandlordListings} />
      <Route path="/landlord/create" component={LandlordCreateListing} />
      <Route path="/landlord/matches">
        {() => <Matches role="landlord" />}
      </Route>
      <Route path="/landlord/profile">
        {() => <Profile role="landlord" />}
      </Route>

      <Route path="/chat/:id" component={Chat} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
