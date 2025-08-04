import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ParallaxBackground from "./ParallaxBackground";
import heroDashboard from "@/assets/hero-dashboard-mockup.jpg";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

const HeroSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { elementRef: observerRef, isIntersecting } = useIntersectionObserver();

  return (
    <ParallaxBackground>
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div 
          ref={elementRef}
          className={`text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full mb-8 animate-fade-in pulse-glow">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">100% Privacy-First AI Platform</span>
          </div>

          {/* Main Headline - Updated messaging */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <span className="gradient-text">Custom AI Automations</span>
            <br />
            <span className="text-foreground">That Actually</span>
            <br />
            <span className="gradient-text">Adapt to You</span>
          </h1>

          {/* Enhanced Value Proposition */}
          <div className="max-w-4xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <p className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              We build custom AI automations and secure tools for students, professionals, and businesses—<span className="gradient-text font-bold">no code needed.</span>
            </p>
            <p className="text-xl text-muted-foreground">
              AI that actually adapts to your life, all with <strong className="text-primary">100% privacy</strong> guaranteed.
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Link to="/creations">
              <Button className="btn-hero text-xl px-10 py-5 group hover:scale-105 pulse-glow">
                <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                See Our Creations
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="btn-outline-glow text-xl px-10 py-5 group">
                <Zap className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Get Free Consultation
              </Button>
            </Link>
          </div>

          {/* Hero Dashboard Mockup */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <div className="glass-card p-4 md:p-8 rounded-3xl shadow-elevated max-w-6xl mx-auto glow-effect">
              <img 
                src={heroDashboard} 
                alt="Neubofy AI Dashboard - Custom automation interface showing analytics, workflows, and AI chat features"
                className="w-full h-auto rounded-2xl shadow-card"
              />
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mt-16 animate-fade-in" style={{ animationDelay: "1s" }}>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">100%</div>
              <div className="text-muted-foreground font-medium">Privacy Focused</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-muted-foreground font-medium">AI Assistance</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">Custom</div>
              <div className="text-muted-foreground font-medium">Built for You</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">No Code</div>
              <div className="text-muted-foreground font-medium">Required</div>
            </div>
          </div>
        </div>
      </section>
    </ParallaxBackground>
  );
};

export default HeroSection;