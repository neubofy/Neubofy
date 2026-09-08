"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const WorkflowSection = () => {
  const steps = [
    { num: "01", title: "Understand", desc: "You explain your business in normal language." },
    { num: "02", title: "Translate", desc: "Neubofy turns your idea into clear technical requirements." },
    { num: "03", title: "Architect", desc: "We determine what actually needs to be built." },
    { num: "04", title: "Select", desc: "We choose the appropriate developer/builder." },
    { num: "05", title: "Build", desc: "The selected builder develops your software." },
    { num: "06", title: "Verify", desc: "Neubofy checks the delivered product against the agreed requirements." },
    { num: "07", title: "Handover", desc: "You receive the completed software." }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            More Than a Developer Marketplace.
          </h2>
          <p className="text-muted-foreground mb-8">
            A marketplace helps you find a developer. <br className="hidden md:block"/>
            Neubofy helps you understand what should be built, determines the right approach, connects the project with an appropriate builder, coordinates development and verifies the result.
          </p>

          <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 mb-16 text-left">
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Typical Marketplace</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                <span>Find</span>
                <span className="text-white/30">→</span>
                <span>Hire</span>
                <span className="text-white/30">→</span>
                <span>Manage</span>
                <span className="text-white/30">→</span>
                <span className="text-white/50 line-through">Hope</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Neubofy Workflow</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white font-medium">
                <span>Understand</span>
                <span className="text-white/30">→</span>
                <span>Translate</span>
                <span className="text-white/30">→</span>
                <span>Plan</span>
                <span className="text-white/30">→</span>
                <span>Select</span>
                <span className="text-white/30">→</span>
                <span>Build</span>
                <span className="text-white/30">→</span>
                <span>Verify</span>
                <span className="text-white/30">→</span>
                <span className="text-green-400">Deliver</span>
              </div>
            </div>
          </div>

        </motion.div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.num} className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="w-full glass-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border border-white/10 hover:border-white/30 transition-all bg-black/40"
              >
                <div className="text-4xl font-light text-white/20 shrink-0">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">— {step.title}</h3>
                  <p className="text-muted-foreground text-sm md:text-base">{step.desc}</p>
                </div>
              </motion.div>

              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  whileInView={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, delay: (index * 0.1) + 0.2 }}
                  viewport={{ once: true }}
                  className="py-4"
                >
                  <ArrowDown className="w-6 h-6 text-white/20" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
