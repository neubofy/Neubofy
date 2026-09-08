"use client";

import { motion } from "framer-motion";
import { ShieldCheck, SearchCode, ServerCog } from "lucide-react";

const TrustVerificationSection = () => {
  return (
    <section className="py-24 border-y border-white/5 bg-black/30">
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-white/70" />
            <span className="text-sm font-semibold tracking-wide uppercase text-white/70">Trust / Verification</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Software is checked before delivery.
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Our verification structure ensures the delivered software aligns with the original agreed requirements before handover.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="p-6"
          >
            <SearchCode className="w-8 h-8 text-white/50 mb-4" />
            <h3 className="text-lg font-bold mb-2">Requirements Check</h3>
            <p className="text-muted-foreground text-sm">We verify that the core functionalities outlined during the translation phase are present and operational.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-6"
          >
            <ServerCog className="w-8 h-8 text-white/50 mb-4" />
            <h3 className="text-lg font-bold mb-2">Technical Review</h3>
            <p className="text-muted-foreground text-sm">Our internal analysts perform a high-level review of the architecture and delivered components.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="p-6"
          >
            <ShieldCheck className="w-8 h-8 text-white/50 mb-4" />
            <h3 className="text-lg font-bold mb-2">Accountable Handover</h3>
            <p className="text-muted-foreground text-sm">We manage the developer relationship so you receive a verified product, not an ongoing negotiation.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustVerificationSection;
