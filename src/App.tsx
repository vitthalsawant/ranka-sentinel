import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerAnalytics from "./pages/CustomerAnalytics";
import CustomerHeatmaps from "./pages/CustomerHeatmaps";
import CameraManagement from "./pages/CameraManagement";
import DetectionSettings from "./pages/DetectionSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to customer dashboard */}
          <Route path="/" element={<Navigate to="/customer" replace />} />
          
          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/analytics" element={<CustomerAnalytics />} />
          <Route path="/customer/heatmaps" element={<CustomerHeatmaps />} />
          <Route path="/customer/cameras" element={<CameraManagement />} />
          <Route path="/customer/detection" element={<DetectionSettings />} />

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
