"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const ConceptSection = () => {
  return (
    <section className="py-24 bg-black/50 border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            We Don't Start With Technology. We Start With Your Problem.
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            Businesses often know what they want to accomplish but may not know whether they need software, SaaS, integration, automation, AI, security, infrastructure, or something else. Neubofy's job is to determine the appropriate approach before execution.
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="w-full glass-card p-6 md:p-8 rounded-2xl border border-white/10"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">You Bring</h3>
            <p className="text-xl font-medium text-white">"Here's what our business needs."</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ArrowDown className="w-6 h-6 text-white/20" />
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="w-full glass-card p-6 md:p-8 rounded-2xl border border-white/10"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Neubofy Figures Out</h3>
            <p className="text-xl font-medium text-white">"What technology approach actually makes sense?"</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <ArrowDown className="w-6 h-6 text-white/20" />
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="w-full glass-card p-6 md:p-8 rounded-2xl border border-white/10"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Execution</h3>
            <p className="text-xl font-medium text-white">"Right capabilities assembled around the requirement."</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <ArrowDown className="w-6 h-6 text-white/20" />
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
            className="w-full glass-card p-6 md:p-8 rounded-2xl border border-white/10"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Verification</h3>
            <p className="text-xl font-medium text-white">"Work evaluated against the agreed requirements."</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ConceptSection;
