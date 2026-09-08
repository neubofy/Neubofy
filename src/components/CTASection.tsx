"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/5 blur-3xl -z-10" />
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-7xl font-bold tracking-tight mb-8">
            Tell Neubofy What You Need
          </h2>
          <p className="text-xl text-muted-foreground font-light mb-12 max-w-2xl mx-auto">
            Stop worrying about technical terminology and developer management. Let us handle the technology while you handle your business.
          </p>
          <a
            href="https://neubofy.zohodesk.in/portal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-medium transition-transform hover:scale-105 bg-white text-black shadow-xl hover:shadow-2xl hover:shadow-white/20 rounded-full"
          >
            Start Your Project <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
