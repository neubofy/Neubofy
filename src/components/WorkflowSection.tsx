"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";

const WorkflowStep = ({ step, index, totalSteps }: { step: any; index: number; totalSteps: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 0.9", "1 0.4"], // Starts fading in when top of element hits 90% of viewport, fully in at 40%
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1]);
  const borderColor = useTransform(scrollYProgress, [0, 0.5, 1], ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]);
  const numColor = useTransform(scrollYProgress, [0, 0.5, 1], ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.8)", "rgba(255,255,255,0.3)"]);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        ref={ref}
        style={{ opacity, scale, borderColor }}
        className="w-full glass-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 md:gap-8 border transition-all bg-black/60 backdrop-blur-md"
      >
        <motion.div style={{ color: numColor }} className="text-4xl font-light shrink-0">
          {step.num}
        </motion.div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">— {step.title}</h3>
          <p className="text-muted-foreground text-sm md:text-base font-light">{step.desc}</p>
        </div>
      </motion.div>

      {index < totalSteps - 1 && (
        <div className="py-4">
          <motion.div style={{ opacity }}>
            <ArrowDown className="w-6 h-6 text-white/20" />
          </motion.div>
        </div>
      )}
    </div>
  );
};


const WorkflowSection = () => {
  const steps = [
    { num: "01", title: "Understand", desc: "Understand the business problem, current situation and desired outcome." },
    { num: "02", title: "Evaluate", desc: "Assess possible approaches, constraints, risks and existing technology." },
    { num: "03", title: "Decide", desc: "Determine whether to configure, integrate, build, improve, secure, audit or use another approach." },
    { num: "04", title: "Architect", desc: "Define the technical approach and requirements." },
    { num: "05", title: "Assemble", desc: "Bring together the appropriate capabilities/specialists." },
    { num: "06", title: "Execute", desc: "Coordinate implementation, configuration, integration, development or other required work." },
    { num: "07", title: "Verify", desc: "Independently evaluate the result against agreed requirements and relevant risks." },
    { num: "08", title: "Deliver", desc: "Coordinate handover and documentation." },
    { num: "09", title: "Support / Evolve", desc: "Where appropriate, coordinate maintenance, improvements and future technology needs." }
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

        <div className="space-y-2 md:space-y-4">
          {steps.map((step, index) => (
            <WorkflowStep key={step.num} step={step} index={index} totalSteps={steps.length} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
