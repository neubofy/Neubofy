import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Creations from "./pages/Creations";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
// ...existing code...
import ScrollProgress from "./components/ScrollProgress";
import GoToTop from "./components/GoToTop";
import GeminiChatbot from "./components/GeminiChatbot";


const queryClient = new QueryClient();

const ScrollToTopOnRouteChange = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);
  return null;
};

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    const preloadImages = () => {
      const images = [
        '/src/assets/founder-avatar.jpg',
        '/src/assets/hero-dashboard-mockup.jpg'
      ];
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    preloadImages();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTopOnRouteChange />
          <ScrollProgress />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/creations" element={<Creations />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />

            <Route path="/blog" element={<Blog />} />
// ...existing code...

            <Route path="*" element={<NotFound />} />
          </Routes>
          <GoToTop />
          <GeminiChatbot />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
