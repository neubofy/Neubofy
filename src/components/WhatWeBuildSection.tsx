"use client";

import { motion } from "framer-motion";
import { Lightbulb, Wrench, RefreshCw, Shield, Settings } from "lucide-react";

const WhatWeBuildSection = () => {
  const categories = [
    {
      icon: Lightbulb,
      title: "DECIDE",
      items: ["Technology strategy", "Build vs buy", "Architecture", "Technology assessment"]
    },
    {
      icon: Wrench,
      title: "IMPLEMENT",
      items: ["SaaS configuration", "Integrations", "Automation", "Custom software", "AI systems"]
    },
    {
      icon: RefreshCw,
      title: "IMPROVE",
      items: ["Modernization", "Performance", "Data", "Cloud / DevOps", "Existing-system improvement"]
    },
    {
      icon: Shield,
      title: "PROTECT & VERIFY",
      items: ["Security", "Software/code audit", "QA", "Independent verification", "AI/automation assessment"]
    },
    {
      icon: Settings,
      title: "OPERATE",
      items: ["Maintenance", "Support", "Monitoring", "Evolution"]
    }
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
            Whatever the requirement calls for.
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            You don't need to find and manage every specialist yourself. Neubofy determines which capabilities your project requires and coordinates the appropriate independent partners.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col gap-4 hover:border-white/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <cat.icon className="w-6 h-6 text-primary/80" />
                <span className="text-sm font-bold tracking-widest text-foreground">{cat.title}</span>
              </div>
              <ul className="flex flex-col gap-2">
                {cat.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground font-light flex items-start gap-2">
                    <span className="text-primary/50 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeBuildSection;
