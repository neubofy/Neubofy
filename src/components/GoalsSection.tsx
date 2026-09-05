"use client";
import { Blocks, BarChart3, Rocket, Users, Share2, Lock } from "lucide-react";
import { motion } from "framer-motion";

const GoalsSection = () => {
  const goals = [
    {
      icon: <Blocks className="w-8 h-8 text-primary" />,
      title: "Global Developer Network",
      description: "Building the most comprehensive and verified network of top software developers worldwide"
    },
    {
      icon: <Users className="w-8 h-8 text-secondary" />,
      title: "Finding Top Talent",
      description: "Onboarding the best developers to help consumers build high-quality applications"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Competitive Costs",
      description: "Connecting consumers with top talent to deliver the best products at competitive pricing"
    },
    {
      icon: <Share2 className="w-8 h-8 text-secondary" />,
      title: "Connecting as the Bridge",
      description: "Acting as the middleman to seamlessly pair consumers with the exact right developer for their needs"
    },
    {
      icon: <Rocket className="w-8 h-8 text-primary" />,
      title: "Innovation Showcase",
      description: "Accelerating technology adoption by making it easy to find developers who build exceptional products"
    },
    {
      icon: <Lock className="w-8 h-8 text-secondary" />,
      title: "Trust & Quality",
      description: "Ensuring high standards by connecting consumers only with verified and exceptional developers"
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
            Providing a comprehensive network of top developers to deliver exceptional products to consumers at competitive costs.
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