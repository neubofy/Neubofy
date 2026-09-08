"use client";

import { Shield } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { motion } from "framer-motion";

const HeroSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <ParallaxBackground>
      <section className="min-h-[70vh] md:min-h-screen flex items-center justify-center relative overflow-hidden pt-20 md:pt-32">
        {/* Animated Background Elements - Subtle Premium Theme */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0 }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse-slow"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-[80px] animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <motion.div
          ref={elementRef}
          className="text-center relative z-10 w-full max-w-5xl mx-auto px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full mb-8 animate-fade-in border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Shield className="w-5 h-5 text-foreground" />
            <span className="text-sm font-semibold tracking-wide uppercase">Your Technology Department, Without Building One</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-display font-bold mb-6 md:mb-10 animate-fade-in tracking-tight text-foreground leading-[1.1]"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Build the <span className="text-white/60">right</span>
            <br />
            software.
            <br />
            <span className="text-white/40 text-4xl sm:text-5xl md:text-7xl lg:text-8xl">Not just software.</span>
          </motion.h1>

          {/* Value Proposition */}
          <motion.div
            className="max-w-3xl mx-auto mb-12 animate-fade-in"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              Tell Neubofy what your business needs. We translate your idea into the right technical plan, select the right builder, manage the project, and verify the software before delivery.
            </p>
          </motion.div>

        </motion.div>
      </section>
    </ParallaxBackground>
  );
};

export default HeroSection;
