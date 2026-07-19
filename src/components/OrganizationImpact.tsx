"use client";
import { motion } from "framer-motion";
import { Globe2, Brain, Handshake, Code2, Building2, Stars } from "lucide-react";

const OrganizationImpact = () => {
  const impactMetrics = [
    {
      metric: "100%",
      label: "Free to Use",
      description: "No hidden fees, no subscriptions."
    },
    {
      metric: "Global",
      label: "Developer Network",
      description: "Connecting talent worldwide directly to clients."
    },
    {
      metric: "0%",
      label: "Platform Cut",
      description: "Keep 100% of what you earn from your clients."
    }
  ];

  const uniqueFeatures = [
    {
      icon: <Handshake className="w-12 h-12 text-primary" />,
      title: "Direct Client Connection",
      description: "We step out of the way. Consumers contact you directly for your services based on the capabilities you showcase."
    },
    {
      icon: <Brain className="w-12 h-12 text-secondary" />,
      title: "Showcase Capabilities",
      description: "Use Neubofy Orbit to list your interactive projects and demonstrate your true potential to global clients."
    },
    {
      icon: <Code2 className="w-12 h-12 text-primary" />,
      title: "Developer First",
      description: "We're building more than a marketplace - we're creating the ultimate network designed purely for software developers."
    },
    {
      icon: <Building2 className="w-12 h-12 text-secondary" />,
      title: "Business Transformation",
      description: "Helping organizations find the exact right talent by reviewing verified project showcases and directly hiring the creator."
    },
    {
      icon: <Globe2 className="w-12 h-12 text-primary" />,
      title: "Global Distribution",
      description: "Providing developers worldwide with a powerful platform to reach global markets while maintaining their complete independence."
    },
    {
      icon: <Stars className="w-12 h-12 text-secondary" />,
      title: "Quality Peer Network",
      description: "Join a community of verified creators, share your work, and elevate your professional developer presence."
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
            Building the most trusted free ecosystem where developers showcase their work and clients hire them directly
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