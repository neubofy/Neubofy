
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ParallaxBackground from "./ParallaxBackground";
import heroDashboard from "@/assets/hero-dashboard-mockup.jpg";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { motion } from "framer-motion";

const HeroSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { elementRef: observerRef, isIntersecting } = useIntersectionObserver();

  return (
    <ParallaxBackground>
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0 }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute top-1/2 left-1/2 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl animate-pulse-slow"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <motion.div
          ref={elementRef}
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full mb-8 animate-fade-in pulse-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">100% Privacy-First AI Platform</span>
          </motion.div>

          {/* Main Headline - Updated messaging */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 animate-fade-in text-3d"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="gradient-text">Find AI SaaS & Automation</span>
            <br />
            <span className="text-foreground">Tailored</span>
            <br />
            <span className="gradient-text">to Your Needs</span>
          </motion.h1>

          {/* Enhanced Value Proposition */}
          <motion.div
            className="max-w-4xl mx-auto mb-8 animate-fade-in"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Find SaaS products like AI tools and automation according to your need.
            </p>
            <p className="text-xl text-muted-foreground">
              Our goal is to let you choose AI-based SaaS products and automation tools—like a Play Store for AI.
            </p>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link to="/orbit">
              <motion.button
                className="btn-3d text-xl px-10 py-5 group focus:outline-none focus:ring-2 focus:ring-primary/50"
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                type="button"
              >
                <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Explore Neubofy Orbit
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/contact">
              <motion.button
                className="btn-3d bg-transparent border-2 border-primary text-xl px-10 py-5 group focus:outline-none focus:ring-2 focus:ring-secondary/50 hover:bg-primary/10"
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                type="button"
              >
                <Zap className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Get Free Consultation
              </motion.button>
            </Link>
          </motion.div>

          {/* Hero Dashboard Mockup */}
          <motion.div
            className="relative animate-fade-in"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="glass-card p-4 md:p-8 rounded-3xl shadow-elevated max-w-6xl mx-auto glow-effect card-3d">
              <img
                src={heroDashboard}
                alt="Neubofy AI Dashboard - Custom automation interface showing analytics, workflows, and AI chat features"
                className="w-full h-auto rounded-2xl shadow-card card-3d-content"
              />
            </div>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 animate-fade-in"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
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
          </motion.div>
        </motion.div>
      </section>
    </ParallaxBackground>
  );
};

export default HeroSection;