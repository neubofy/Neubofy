import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-tertiary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }}></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI-Powered Automation Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <span className="gradient-text">AI Automation</span>
          <br />
          <span className="text-foreground">for Every</span>
          <br />
          <span className="gradient-text">Ambition</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          Transform your productivity with Neubofy's secure, AI-powered custom automation and mentorship solutions. 
          Built for students, professionals, and businesses who dare to innovate.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <Link to="/creations">
            <Button className="btn-hero text-lg px-8 py-4 group">
              View Our Creations
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button className="btn-outline-glow text-lg px-8 py-4 group">
              <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Get Free Consultation
            </Button>
          </Link>
        </div>

        {/* Hero Image/Mockup Placeholder */}
        <div className="relative animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <div className="glass-card p-8 rounded-3xl shadow-elevated max-w-4xl mx-auto glow-effect">
            <div className="bg-gradient-card rounded-2xl p-6 h-64 md:h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-button rounded-2xl mx-auto mb-4 flex items-center justify-center pulse-glow">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold gradient-text mb-2">AI-Powered Dashboard</h3>
                <p className="text-muted-foreground">Beautiful mockup coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: "1s" }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">100%</div>
            <div className="text-muted-foreground">Privacy Focused</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">24/7</div>
            <div className="text-muted-foreground">AI Assistance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">∞</div>
            <div className="text-muted-foreground">Possibilities</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;