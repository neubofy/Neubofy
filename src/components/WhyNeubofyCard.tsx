import React from "react";

const WhyNeubofyCard: React.FC = () => {
  return (
    <aside className="glass-card p-8 md:p-10 rounded-2xl shadow-elevated max-w-4xl mx-auto bg-black/5 dark:bg-white/5 backdrop-blur-md border border-white/10 card-3d">
      <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 text-3d card-3d-content">Why Neubofy</h3>
      <p className="text-base text-muted-foreground/90 mb-6 card-3d-content">
        Neubofy is a global developer network where creators can showcase their capabilities and connect with clients directly. We provide a completely free platform for verified developers to list themselves and their portfolios, ensuring great ideas reach consumers quickly without any middleman interference.
      </p>

      <ul className="list-inside list-disc space-y-2 text-sm text-foreground card-3d-content">
        <li>Free professional profiles for developers globally</li>
        <li>Showcase your capabilities through interactive project listings</li>
        <li>Direct, zero-fee connections between clients and developers</li>
        <li>Focus on talent discoverability and peer networking</li>
      </ul>
    </aside>
  );
};

export default WhyNeubofyCard;
