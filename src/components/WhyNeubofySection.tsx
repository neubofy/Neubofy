"use client";

import { motion } from "framer-motion";
import { Target, Shuffle, Crosshair, Users, ShieldCheck, RefreshCcw } from "lucide-react";
import OrchestrationDimensions from "./OrchestrationDimensions";

const WhyNeubofySection = () => {
  const advantages = [
    {
      icon: Target,
      title: "PROBLEM-FIRST",
      desc: "We begin with the business requirement, not a predetermined technology."
    },
    {
      icon: Shuffle,
      title: "TECHNOLOGY-NEUTRAL",
      desc: "We can recommend using what already exists when that is the better choice."
    },
    {
      icon: Crosshair,
      title: "RIGHT CAPABILITY",
      desc: "The requirement determines the capabilities needed."
    },
    {
      icon: Users,
      title: "ONE ACCOUNTABLE RELATIONSHIP",
      desc: "The client should not have to coordinate multiple technical specialists themselves."
    },
    {
      icon: ShieldCheck,
      title: "INDEPENDENT VERIFICATION",
      desc: "Execution and verification can be separated according to project risk."
    },
    {
      icon: RefreshCcw,
      title: "LIFECYCLE",
      desc: "Technology can be supported, improved and evolved after delivery."
    }
  ];

  return (
    <section className="py-24 bg-black/50 border-y border-white/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Why Neubofy?
          </h2>
          <p className="text-xl text-muted-foreground">The structural advantages of using a technology department.</p>
        </motion.div>

        <OrchestrationDimensions />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {advantages.map((adv, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl border border-white/10"
            >
              <adv.icon className="w-8 h-8 text-white/80 mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-3">{adv.title}</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {adv.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNeubofySection;
