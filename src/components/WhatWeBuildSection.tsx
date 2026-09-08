"use client";

import { motion } from "framer-motion";
import { Code2, ShieldCheck, CheckCircle, Cloud, Network, PenTool, Database, Zap } from "lucide-react";

const WhatWeBuildSection = () => {
  const categories = [
    { icon: Code2, title: "AI & Software" },
    { icon: ShieldCheck, title: "Security" },
    { icon: CheckCircle, title: "Quality Assurance" },
    { icon: Cloud, title: "Cloud & DevOps" },
    { icon: Network, title: "Architecture" },
    { icon: PenTool, title: "Product & UX" },
    { icon: Database, title: "Data" },
    { icon: Zap, title: "Future Technology" }
  ];

  return (
    <section className="py-24 bg-black/50 border-y border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            A technology workforce assembled around your problem.
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            You don't need to find and manage every specialist yourself. Neubofy determines which capabilities your project requires and coordinates the appropriate independent partners.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center gap-3 hover:border-white/30 transition-all"
            >
              <cat.icon className="w-8 h-8 text-primary/80" />
              <span className="text-sm font-semibold text-foreground">{cat.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeBuildSection;
