import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/SupabaseAuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import { Donations } from "./pages/Donations";
import { People } from "./pages/People";
import { Donors } from "./pages/Donors";
import { SuperAdmin } from "./pages/SuperAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/people" element={<People />} />
            <Route path="/donors" element={<Donors />} />
            <Route path="/super-admin" element={<SuperAdmin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
