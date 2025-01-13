import { Footer } from "@/components/Footer/Footer";
import { FeaturesSection } from "@/components/Landing/FeaturesSection";
import { HeroSection } from "@/components/Landing/HeroSection";
import { LandingContainer } from "@/components/Landing/LandingContainer";
import { Anchor, Group } from "@mantine/core";
import GameNodeLogo from "@/components/general/GameNodeLogo";

export default function Page() {
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
}
