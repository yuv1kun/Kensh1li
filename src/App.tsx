
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationProvider } from "@/components/alerts/NotificationProvider";
import { AlertSystem } from "@/lib/neuromorphic/alert-system";
import AlertIndicator from "@/components/alerts/AlertIndicator";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import ThreatLibrary from "./pages/ThreatLibrary";
import NeuralArchitecture from "./pages/NeuralArchitecture";
import Documentation from "./pages/Documentation";
import AlertDashboard from "./pages/AlertDashboard";
import AIAssistant from "./pages/AIAssistant";
import AISecurityDashboard from "./pages/AISecurityDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize the AlertSystem for the entire application
const alertSystem = new AlertSystem({
  minSeverityToAlert: 'low',
  notificationSound: true,
  autoAcknowledgeAfterMs: 0, // Don't auto-acknowledge
  maxAlertsToStore: 200,
  autoExecuteActions: false
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <NotificationProvider alertSystem={alertSystem}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AlertIndicator />
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/threat-library" element={<ThreatLibrary />} />
                <Route path="/neural-architecture" element={<NeuralArchitecture />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/alerts" element={<AlertDashboard />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/ai-security" element={<AISecurityDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
