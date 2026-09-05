import React from "react";

const WhyNeubofyCard: React.FC = () => {
  return (
    <aside className="glass-card p-8 md:p-10 rounded-2xl shadow-elevated max-w-4xl mx-auto bg-black/5 dark:bg-white/5 backdrop-blur-md border border-white/10 card-3d">
      <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 text-3d card-3d-content">Why Neubofy</h3>
      <p className="text-base text-muted-foreground/90 mb-6 card-3d-content">
        Neubofy is a platform that provides a network of exceptional developers. We onboard top talent from around the world, bringing the best developers to the forefront. By acting as the bridge, we connect these skilled creators with our consumers, ensuring you get the best products built at competitive costs.
      </p>

      <ul className="list-inside list-disc space-y-2 text-sm text-foreground card-3d-content">
        <li>Onboarding top global developer talent</li>
        <li>Finding the best developers for your needs</li>
        <li>Connecting skilled creators with consumers</li>
        <li>Delivering the best products at competitive costs</li>
      </ul>
    </aside>
  );
};

export default WhyNeubofyCard;
