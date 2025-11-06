import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { lazy, Suspense } from "react";
const Index = lazy(() => import("./pages/Index"));
const Creations = lazy(() => import("./pages/Creations"));
const CreationDetail = lazy(() => import("./pages/CreationDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const NotFound = lazy(() => import("./pages/NotFound"));
// ...existing code...
import ScrollProgress from "./components/ScrollProgress";
import GoToTop from "./components/GoToTop";
import GeminiChatbot from "./components/GeminiChatbot";


const queryClient = new QueryClient();

const ScrollToTopOnRouteChange = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);
  return null;
};

function App() {
  useEffect(() => {
    // Allow native scrolling behavior for normal feel
    document.documentElement.style.scrollBehavior = 'auto';
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
          <Suspense fallback={null}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/creations" element={<Creations />} />
            <Route path="/creations/:slug" element={<CreationDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            {/* more routes can be added here */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
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
