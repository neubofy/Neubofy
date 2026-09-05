"use client";

import { Shield } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import RequestFlowAnimation from "./RequestFlowAnimation";
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
            <span className="text-sm font-semibold">Connecting Talent With Consumers</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 animate-fade-in text-3d"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="gradient-text">The Global Network</span>
            <br />
            <span className="text-foreground">For Top</span>
            <br />
            <span className="gradient-text">Developers</span>
          </motion.h1>

          {/* Value Proposition */}
          <motion.div
            className="max-w-4xl mx-auto mb-8 animate-fade-in"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Finding the best developers to provide consumers with the highest quality products at competitive costs.
            </p>
            <p className="text-xl text-muted-foreground">
              Neubofy acts as the bridge, onboarding the world's top talent and connecting them with consumers to build exceptional, affordable applications.
            </p>
          </motion.div>

          {/* Dynamic SVG Explainer Animation */}
          <motion.div
            className="w-full mt-16 animate-fade-in"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <RequestFlowAnimation />
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 animate-fade-in"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">Top</div>
              <div className="text-muted-foreground font-medium">Global Developers</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">Competitive</div>
              <div className="text-muted-foreground font-medium">Pricing</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform">Best</div>
              <div className="text-muted-foreground font-medium">Quality Products</div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </ParallaxBackground>
  );
};

export default HeroSection;