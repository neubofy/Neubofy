"use client";
import { motion } from "framer-motion";
import { Globe2, Brain, Handshake, Code2, Building2, Stars } from "lucide-react";

const OrganizationImpact = () => {
  const impactMetrics = [
    {
      metric: "Top",
      label: "Global Talent",
      description: "Onboarding the best developers from around the world."
    },
    {
      metric: "Quality",
      label: "Products",
      description: "Connecting consumers with developers to build the highest quality apps."
    },
    {
      metric: "Competitive",
      label: "Costs",
      description: "Providing consumers with exceptional products at competitive pricing."
    }
  ];

  const uniqueFeatures = [
    {
      icon: <Handshake className="w-12 h-12 text-primary" />,
      title: "Connecting Creators & Consumers",
      description: "We act as the bridge, ensuring consumers get paired with the perfect developer for their project."
    },
    {
      icon: <Brain className="w-12 h-12 text-secondary" />,
      title: "Showcase Capabilities",
      description: "A comprehensive network where top talent can list their projects and demonstrate their true potential."
    },
    {
      icon: <Code2 className="w-12 h-12 text-primary" />,
      title: "Developer Network",
      description: "We're building an incredible platform designed to onboard the best developers from every corner of the globe."
    },
    {
      icon: <Building2 className="w-12 h-12 text-secondary" />,
      title: "Business Transformation",
      description: "Helping organizations and consumers find the exact right talent by reviewing verified developer profiles."
    },
    {
      icon: <Globe2 className="w-12 h-12 text-primary" />,
      title: "Global Reach",
      description: "Providing developers worldwide with a powerful platform to reach global markets and consumer needs."
    },
    {
      icon: <Stars className="w-12 h-12 text-secondary" />,
      title: "Exceptional Quality",
      description: "Join a network focused on delivering the absolute best applications at competitive costs for every consumer."
    }
  ];

  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Main Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Empowering Global
            </span>
            <br />
            <span className="text-foreground">
              Software Developers
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building the most trusted network where the best developers connect with consumers to build high-quality products at competitive costs.
          </p>
        </motion.div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {impactMetrics.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {item.metric}
              </div>
              <div className="text-xl font-semibold mb-2">{item.label}</div>
              <div className="text-muted-foreground">{item.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Unique Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {uniqueFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 rounded-xl border border-white/10 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="glass-icon-container p-3 rounded-lg">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrganizationImpact;