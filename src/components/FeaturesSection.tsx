
import { Bot, Shield, Zap, Users, Brain, Target } from "lucide-react";
import studentMentor from "@/assets/student-mentor-mockup.jpg";
import inventoryAI from "@/assets/inventory-ai-mockup.jpg";
import contentCreator from "@/assets/content-creator-mockup.jpg";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { motion } from "framer-motion";

const FeaturesSection = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();

  const features = [
    {
      icon: Bot,
      title: "Student Mentor AI",
      description: "Personalized AI mentorship for academic success and career guidance with smart study plans.",
      gradient: "from-primary to-primary-glow",
      mockup: studentMentor,
      alt: "Student Mentor AI interface showing personalized study plans and progress tracking"
    },
    {
      icon: Zap,
      title: "Productivity Automation",
      description: "Streamline workflows and eliminate repetitive tasks with intelligent automation systems.",
      gradient: "from-secondary to-secondary-glow",
      mockup: contentCreator,
      alt: "Productivity automation dashboard with workflow management and task automation"
    },
    {
      icon: Target,
      title: "Business Inventory AI",
      description: "AI-powered inventory management with predictive analytics and automated optimization.",
      gradient: "from-tertiary to-tertiary-glow",
      mockup: inventoryAI,
      alt: "Business inventory management system with AI analytics and automation features"
    },
    {
      icon: Brain,
      title: "AI Content Tools",
      description: "Generate, optimize, and manage content with advanced AI writing and creative capabilities.",
      gradient: "from-primary to-secondary",
      mockup: contentCreator,
      alt: "AI content creation interface with text generation and editing tools"
    },
    {
      icon: Shield,
      title: "Privacy First Design",
      description: "Your data stays yours. Zero-knowledge architecture ensures complete privacy and security.",
      gradient: "from-secondary to-tertiary",
      mockup: studentMentor,
      alt: "Privacy-focused security dashboard showing data protection features"
    },
    {
      icon: Users,
      title: "Custom Solutions",
      description: "Tailored automation solutions designed specifically for your industry and workflow needs.",
      gradient: "from-tertiary to-primary",
      mockup: inventoryAI,
      alt: "Custom solution interface showing personalized automation workflows"
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          ref={(node) => {
            if (node) {
              // Assign to both the motion div and the custom observer
              (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
          }}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 gradient-text">
            <span className="gradient-text">How We Help You Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the power of AI automation across every aspect of your work and life
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={isIntersecting ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                className="glass-card p-6 rounded-2xl hover-lift transition-all duration-500 group glow-effect overflow-hidden"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(80,80,200,0.10)" }}
              >
                {/* Feature Image */}
                <motion.div
                  className="relative mb-6 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <img
                    src={feature.mockup}
                    alt={feature.alt}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </motion.div>

                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;