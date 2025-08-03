import { Star, TrendingUp, Users, Award } from "lucide-react";

const CaseStudiesSection = () => {
  const caseStudies = [
    {
      company: "EduTech Solutions",
      logo: "ET",
      industry: "Education",
      challenge: "Manual student progress tracking",
      solution: "AI-powered student mentorship platform",
      results: [
        "40% improvement in student engagement",
        "60% reduction in administrative time",
        "95% student satisfaction rate"
      ],
      icon: TrendingUp,
      gradient: "from-primary to-primary-glow"
    },
    {
      company: "RetailPro Inc",
      logo: "RP",
      industry: "E-commerce",
      challenge: "Inventory management inefficiencies",
      solution: "Custom AI inventory optimization system",
      results: [
        "30% reduction in excess inventory",
        "50% faster restocking decisions",
        "$2M+ in cost savings annually"
      ],
      icon: Award,
      gradient: "from-secondary to-secondary-glow"
    },
    {
      company: "ContentMasters",
      logo: "CM",
      industry: "Digital Marketing",
      challenge: "Content creation bottlenecks",
      solution: "AI content generation and optimization tools",
      results: [
        "300% increase in content output",
        "85% reduction in editing time",
        "200% growth in client acquisition"
      ],
      icon: Users,
      gradient: "from-tertiary to-tertiary-glow"
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            <span className="gradient-text">Success Stories</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real results from organizations that trusted Neubofy to transform their operations
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => {
            const IconComponent = study.icon;
            return (
              <div
                key={index}
                className="glass-card p-8 rounded-2xl hover:shadow-elevated transition-all duration-500 group animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Company Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${study.gradient} flex items-center justify-center text-xl font-bold text-white`}>
                    {study.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{study.company}</h3>
                    <p className="text-muted-foreground">{study.industry}</p>
                  </div>
                </div>

                {/* Challenge & Solution */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-primary mb-2">Challenge</h4>
                    <p className="text-muted-foreground">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-secondary mb-2">Solution</h4>
                    <p className="text-muted-foreground">{study.solution}</p>
                  </div>
                </div>

                {/* Results */}
                <div>
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-tertiary mb-4 flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    Results
                  </h4>
                  <ul className="space-y-2">
                    {study.results.map((result, resultIndex) => (
                      <li key={resultIndex} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to become our next success story?
          </p>
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 text-primary" />
            Trusted by forward-thinking organizations worldwide
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;