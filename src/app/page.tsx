import HeroSection from "@/components/HeroSection";
import PlatformIntroSection from "@/components/PlatformIntroSection";
import WhyNeubofyCard from "@/components/WhyNeubofyCard";
import GoalsSection from "@/components/GoalsSection";
import OrganizationImpact from "@/components/OrganizationImpact";
import Reveal from "@/components/Reveal";
import ParallaxBackground from "@/components/ParallaxBackground";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <ParallaxBackground>
        <div className="pointer-events-none fixed inset-0 z-0" />
      </ParallaxBackground>
      <div className="relative z-10">
        <Reveal y={32}><HeroSection /></Reveal>
        <div className="py-20">
          <Reveal y={20} delay={0.08}><WhyNeubofyCard /></Reveal>
        </div>
        <Reveal y={24} delay={0.1}><OrganizationImpact /></Reveal>
        <Reveal y={24} delay={0.15}><GoalsSection /></Reveal>
        <Reveal y={24} delay={0.2}><PlatformIntroSection /></Reveal>
      </div>
    </div>
  );
}
