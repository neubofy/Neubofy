import { Bot, Shield, Zap, Users, Brain, Target } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Bot,
      title: "Student Mentor AI",
      description: "Personalized AI mentorship for academic success and career guidance.",
      gradient: "from-primary to-primary-glow"
    },
    {
      icon: Zap,
      title: "Productivity Automation",
      description: "Streamline workflows and eliminate repetitive tasks with smart automation.",
      gradient: "from-secondary to-secondary-glow"
    },
    {
      icon: Target,
      title: "Business Inventory",
      description: "AI-powered inventory management and business optimization tools.",
      gradient: "from-tertiary to-tertiary-glow"
    },
    {
      icon: Brain,
      title: "AI Content Tools",
      description: "Generate, optimize, and manage content with advanced AI capabilities.",
      gradient: "from-primary to-secondary"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays yours. Only you and your AI have access to your information.",
      gradient: "from-secondary to-tertiary"
    },
    {
      icon: Users,
      title: "Custom Solutions",
      description: "Tailored automation solutions for your specific needs and industry.",
      gradient: "from-tertiary to-primary"
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            <span className="gradient-text">How We Help</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the power of AI automation across every aspect of your work and life
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="glass-card p-8 rounded-2xl hover:shadow-elevated transition-all duration-500 group glow-effect animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;