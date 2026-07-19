import Reveal from "@/components/Reveal";

const PlatformIntroSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <Reveal>
          <div className="glass-card p-8 md:p-12 rounded-3xl max-w-5xl mx-auto text-center card-3d">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 gradient-text text-3d card-3d-content">
              The Ultimate Showcase for Developer Capabilities
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto card-3d-content">
              This is the global platform where creators list their projects and consumers find top-tier talent. Explore live capabilities, compare portfolios, and contact developers directly.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default PlatformIntroSection;


