import React from "react";
import { Anchor, Group } from "@mantine/core";
import GameNodeLogo from "@/components/general/GameNodeLogo";
import { HeroSection } from "@/components/Landing/HeroSection";
import { FeaturesSection } from "@/components/Landing/FeaturesSection";
import { Footer } from "@/components/Footer/Footer";
import { LandingContainer } from "@/components/Landing/LandingContainer";

const Index = () => {
  return (
    <LandingContainer>
      <Group className={"w-full px-lg pt-3"}>
        <Anchor href="/">
          <GameNodeLogo className="w-28 h-auto max-h-full" />
        </Anchor>
      </Group>
      <HeroSection />
      <FeaturesSection title="Features" description="" />
      <Footer />
    </LandingContainer>
  );
};

export default Index;
