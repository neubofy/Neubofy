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
            Why Not Just Hire an AI Developer Directly?
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
            AI has made software development faster. But writing code is only one part of building the right software.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
          >
            <Lightbulb className="w-8 h-8 text-white mb-6 opacity-80" />
            <h3 className="text-lg font-medium text-white mb-2">
              Business Requirements
            </h3>
            <p className="text-sm text-muted-foreground">
              A business owner knows the problem they want to solve, but may not know exactly what software should be built. Neubofy translates business needs into clearer technical requirements.
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
            <h3 className="text-lg font-medium text-white mb-2">
              Wrong Solution / Wrong Scope
            </h3>
            <p className="text-sm text-muted-foreground">
              A founder may think they need a particular feature or MVP. Neubofy evaluates the requirement and helps determine what actually needs to be built before unnecessary development costs are created.
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
            <h3 className="text-lg font-medium text-white mb-2">
              Developer Selection
            </h3>
            <p className="text-sm text-muted-foreground">
              Customers should not have to determine which developer is capable of handling their particular project. Neubofy evaluates the project and selects an appropriate builder.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors lg:col-span-1"
          >
            <CheckCircle className="w-8 h-8 text-white mb-6 opacity-80" />
            <h3 className="text-lg font-medium text-white mb-2">
              Communication
            </h3>
            <p className="text-sm text-muted-foreground">
              Neubofy becomes the communication layer between business language and technical language.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-colors lg:col-span-1"
          >
            <CheckCircle className="w-8 h-8 text-white mb-6 opacity-80" />
            <h3 className="text-lg font-medium text-white mb-2">
              Verification
            </h3>
            <p className="text-sm text-muted-foreground">
              The developer builds the software. Neubofy verifies the delivered product against the agreed requirements before handover.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TheProblemSection;
