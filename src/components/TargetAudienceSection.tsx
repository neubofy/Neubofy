"use client";

import { motion } from "framer-motion";
import { Building2, Code2 } from "lucide-react";
import Link from "next/link";

const TargetAudienceSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Businesses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-10 rounded-3xl border border-white/10 flex flex-col h-full bg-gradient-to-br from-black/60 to-black/20"
          >
            <Building2 className="w-12 h-12 text-white/80 mb-6" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">For Businesses</h2>
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Your technology department, without building one.
            </h3>
            <p className="text-muted-foreground mb-8 flex-grow">
              Focus on growing your business while we handle the technical translation, execution, and verification of your software.
            </p>
            <a
              href="https://neubofy.zohodesk.in/portal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors bg-white text-black shadow hover:bg-white/90 rounded-full w-fit"
            >
              Start a Project
            </a>
          </motion.div>

          {/* For Builders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-10 rounded-3xl border border-white/10 flex flex-col h-full bg-gradient-to-br from-black/60 to-black/20"
          >
            <Code2 className="w-12 h-12 text-white/80 mb-6" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">For Builders</h2>
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Get qualified projects without having to become the salesperson.
            </h3>
            <p className="text-muted-foreground mb-8 flex-grow">
              Join our private network. We handle client acquisition and requirements engineering so you can focus on writing excellent code.
            </p>
            <Link
              href="/developers"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-colors bg-white/10 text-white shadow hover:bg-white/20 border border-white/20 rounded-full w-fit"
            >
              Register Interest
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
