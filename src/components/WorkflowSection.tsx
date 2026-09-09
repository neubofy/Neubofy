"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const WorkflowSection = () => {
  const steps = [
    { num: "01", title: "Understand", desc: "You explain your business problem in normal language." },
    { num: "02", title: "Translate", desc: "Neubofy converts the business problem into structured technical requirements." },
    { num: "03", title: "Architect", desc: "We determine what should actually be built and how it should work." },
    { num: "04", title: "Orchestrate", desc: "Neubofy determines which specialists are required and how their responsibilities fit together." },
    { num: "05", title: "Build", desc: "Independent Neubofy partners execute their assigned responsibilities." },
    { num: "06", title: "Verify", desc: "The work is reviewed against requirements, quality expectations and project-specific risk." },
    { num: "07", title: "Deliver", desc: "Neubofy coordinates the final handover." },
    { num: "08", title: "Support / Evolve", desc: "Where applicable, Neubofy can coordinate future improvements, maintenance and additional technology work." }
  ];

  return (
    <section id="workflow" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Technology Orchestration
          </h2>
          <p className="text-muted-foreground mb-8">
            Neubofy determines what should be built, assembles the right independent specialists, coordinates the work, and verifies the result before delivery.
          </p>

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
