"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CustomerCoverageSection = () => {
  const problems = [
    {
      problem: "I need a CRM.",
      solution: "Neubofy can evaluate SaaS, configuration, integration, or custom development options."
    },
    {
      problem: "Our systems don't talk to each other.",
      solution: "We manage integration."
    },
    {
      problem: "We need automation.",
      solution: "We handle workflow and AI automation evaluation and implementation."
    },
    {
      problem: "We need custom software.",
      solution: "Architecture, specialist assembly, execution, and verification."
    },
    {
      problem: "We already have software but don't trust it.",
      solution: "Audit, verification, security, and improvement."
    },
    {
      problem: "We need ongoing technical capability.",
      solution: "External technology department and ongoing support."
    },
    {
      problem: "We don't know what technology we need.",
      solution: "Technology assessment and consulting."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Whatever the situation requires.
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            You don't need a perfectly defined technical brief. Bring us the business problem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center gap-4 bg-black/40 hover:bg-black/60 transition-colors"
            >
              <div className="md:w-1/2">
                <p className="text-lg font-medium text-white">"{item.problem}"</p>
              </div>
              <div className="hidden md:flex shrink-0">
                <ArrowRight className="w-5 h-5 text-white/30" />
              </div>
              <div className="md:w-1/2">
                <p className="text-sm text-muted-foreground">{item.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerCoverageSection;
