
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import FeaturesSection from "@/components/FeaturesSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import GoToTop from "@/components/GoToTop";
import ParallaxBackground from "@/components/ParallaxBackground";


const Index = () => {
  return (
    <div className="min-h-screen animated-gradient relative">
      <ParallaxBackground>
        <div className="pointer-events-none fixed inset-0 z-0" />
      </ParallaxBackground>
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <WhyChooseUsSection />
        <FeaturesSection />
        <CaseStudiesSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
        <GoToTop />
      </div>
    </div>
  );
};

export default Index;
