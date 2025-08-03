import { CheckCircle, Zap, Shield, Heart } from "lucide-react";

const WhyChooseUsSection = () => {
  const reasons = [
    {
      icon: Heart,
      title: "Student-Built, Student-Focused",
      description: "Created by an ambitious 11th-grader who understands the unique challenges students face in today's competitive world."
    },
    {
      icon: Shield,
      title: "Privacy-First Architecture",
      description: "Your data is yours alone. We've built our systems with privacy by design, ensuring only you and your AI have access to your information."
    },
    {
      icon: Zap,
      title: "Innovation at Core",
      description: "We don't just follow trends—we create them. Our solutions are designed to push the boundaries of what's possible with AI automation."
    },
    {
      icon: CheckCircle,
      title: "Proven Results",
      description: "From academic success to business growth, our users consistently achieve their goals faster and more efficiently than ever before."
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Why Choose <span className="gradient-text">Neubofy?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're not just another SaaS company. We're innovators, dreamers, and problem-solvers 
            dedicated to transforming how you work and learn.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {reasons.map((reason, index) => {
            const IconComponent = reason.icon;
            return (
              <div 
                key={index}
                className="glass-card p-8 rounded-2xl hover:shadow-elevated transition-all duration-500 group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-button flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {reason.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Row */}
        <div className="mt-16 glass-card p-8 rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold gradient-text mb-2">Young</div>
              <div className="text-muted-foreground">But Ambitious</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text mb-2">Secure</div>
              <div className="text-muted-foreground">Privacy Guaranteed</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text mb-2">Fast</div>
              <div className="text-muted-foreground">Quick Turnaround</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text mb-2">Custom</div>
              <div className="text-muted-foreground">Tailored Solutions</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;