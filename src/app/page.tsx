import HeroSection from "@/components/HeroSection";
import WhatWeBuildSection from "@/components/WhatWeBuildSection";
import TheProblemSection from "@/components/TheProblemSection";
import WorkflowSection from "@/components/WorkflowSection";
import WhyNeubofySection from "@/components/WhyNeubofySection";
import TargetAudienceSection from "@/components/TargetAudienceSection";
import TrustVerificationSection from "@/components/TrustVerificationSection";
import CTASection from "@/components/CTASection";

import Reveal from "@/components/Reveal";
import PageTransition from "@/components/PageTransition";
import ServicePausePopup from "@/components/ServicePausePopup";

export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen relative">
        <ServicePausePopup />
        <div className="relative z-10">
          <HeroSection />
          <WhatWeBuildSection />
          <TheProblemSection />
          <WorkflowSection />
          <WhyNeubofySection />
          <TargetAudienceSection />
          <TrustVerificationSection />
          <CTASection />
        </div>
      </div>
    </PageTransition>
  );
}
