import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Splash from "./pages/Splash";
import Dashboard from "./pages/Dashboard";
import FinancialAdvice from "./pages/FinancialAdvice";
import InvestmentAdvice from "./pages/InvestmentAdvice";
import Stocks from "./pages/Stocks";
import Newsletter from "./pages/Newsletter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/splash" element={<Splash />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/financial-advice" element={<FinancialAdvice />} />
            <Route path="/investment-advice" element={<InvestmentAdvice />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/newsletter" element={<Newsletter />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
