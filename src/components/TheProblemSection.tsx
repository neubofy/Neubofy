"use client";

import { motion } from "framer-motion";
import { Lightbulb, Users, CheckCircle } from "lucide-react";

const TheProblemSection = () => {
  return (
    <section className="py-24 bg-black/50 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Building software isn't just about writing code.
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
            You shouldn't need to become a software engineer to build software.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
          >
            <Lightbulb className="w-8 h-8 text-white mb-6 opacity-80" />
            <h3 className="text-lg font-medium text-muted-foreground mb-4">
              "I don't know what technology I need."
            </h3>
            <p className="text-xl font-semibold text-foreground">
              Neubofy translates your business requirement.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
          >
            <Users className="w-8 h-8 text-white mb-6 opacity-80" />
            <h3 className="text-lg font-medium text-muted-foreground mb-4">
              "I don't know who can actually build it."
            </h3>
            <p className="text-xl font-semibold text-foreground">
              Neubofy selects the appropriate builder.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
          >
            <CheckCircle className="w-8 h-8 text-white mb-6 opacity-80" />
            <h3 className="text-lg font-medium text-muted-foreground mb-4">
              "How do I know what I received actually works?"
            </h3>
            <p className="text-xl font-semibold text-foreground">
              Neubofy verifies the delivered software.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TheProblemSection;
