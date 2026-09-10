"use client";

import { Shield } from "lucide-react";
import ParallaxBackground from "./ParallaxBackground";
import OrchestrationSystem from "./OrchestrationSystem";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { motion } from "framer-motion";

const HeroSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <ParallaxBackground>
      <section className="min-h-[70vh] md:min-h-screen flex items-center justify-center relative overflow-hidden pt-20 md:pt-32">
        {/* Live SVG Orchestration System */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <OrchestrationSystem />
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
            <span className="text-sm font-semibold tracking-wide uppercase">Technology, Without the Guesswork.</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 md:mb-10 animate-fade-in tracking-tight text-foreground leading-[1.1]"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Your Technology Department,
            <br />
            <span className="text-white/40">Without Building One.</span>
          </motion.h1>

          {/* Value Proposition */}
          <motion.div
            className="max-w-3xl mx-auto mb-12 animate-fade-in"
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-8">
              Tell Neubofy what your business needs. We determine what should be built, assemble the right independent specialists, coordinate the work, and verify the result before delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/order"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors bg-white text-black shadow hover:bg-white/90 rounded-full"
              >
                Start a Project
              </a>
              <a
                href="#workflow"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#workflow')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors bg-white/10 text-white shadow hover:bg-white/20 border border-white/20 rounded-full"
              >
                See How Neubofy Works
              </a>
            </div>
          </motion.div>

        </motion.div>
      </section>
    </ParallaxBackground>
  );
};

export default HeroSection;
