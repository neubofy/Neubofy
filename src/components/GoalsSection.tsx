"use client";
import { Blocks, BarChart3, Rocket, Users, Share2, Lock } from "lucide-react";
import { motion } from "framer-motion";

const GoalsSection = () => {
  const goals = [
    {
      icon: <Blocks className="w-8 h-8 text-primary" />,
      title: "Global Developer Network",
      description: "Building the most comprehensive and verified network of software developers worldwide"
    },
    {
      icon: <Users className="w-8 h-8 text-secondary" />,
      title: "Developer Empowerment",
      description: "Providing a completely free platform for creators to showcase their capabilities and get hired directly"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Direct Value",
      description: "Eliminating middlemen and platform fees so that talent and consumers connect seamlessly"
    },
    {
      icon: <Share2 className="w-8 h-8 text-secondary" />,
      title: "Community-Driven",
      description: "Fostering a thriving ecosystem where developers collaborate, share projects, and grow together"
    },
    {
      icon: <Rocket className="w-8 h-8 text-primary" />,
      title: "Innovation Showcase",
      description: "Accelerating technology adoption by making it easy to find developers who build cutting-edge tools"
    },
    {
      icon: <Lock className="w-8 h-8 text-secondary" />,
      title: "Trust & Quality",
      description: "Ensuring high standards by allowing clients to view actual live projects before contacting developers"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building the premier global network for developers,
            where showcasing capabilities leads directly to business opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goals.map((goal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 rounded-xl border border-white/10 hover:border-primary/20 transition-all duration-300"
            >
              <div className="mb-4">{goal.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{goal.title}</h3>
              <p className="text-muted-foreground">{goal.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoalsSection;