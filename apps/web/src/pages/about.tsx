import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/general/header/LandingHeader";
import { AboutAiSection } from "@/components/about/AboutAiSection";
import { AboutBeyondLibrarySection } from "@/components/about/AboutBeyondLibrarySection";
import { AboutCommunitySection } from "@/components/about/AboutCommunitySection";
import { AboutConnectionsSection } from "@/components/about/AboutConnectionsSection";
import { AboutFeatureIndex } from "@/components/about/AboutFeatureIndex";
import { AboutFinalCta } from "@/components/about/AboutFinalCta";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutJournalSection } from "@/components/about/AboutJournalSection";
import { AboutLibrarySection } from "@/components/about/AboutLibrarySection";
import { AboutManifesto } from "@/components/about/AboutManifesto";
import { AboutMobileAppSection } from "@/components/about/AboutMobileAppSection";
import { AboutPremiumSection } from "@/components/about/AboutPremiumSection";
import { AboutProgressSection } from "@/components/about/AboutProgressSection";
import { AboutPromiseSection } from "@/components/about/AboutPromiseSection";
import { AboutSupportersWall } from "@/components/about/AboutSupportersWall";
import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import aboutStyles from "@/components/about/About.module.css";
import { OpenGraph } from "@/components/general/OpenGraph";

/**
 * Public About page. Composition only: every section lives in
 * `components/about`, the header/footer are shared with the landing and the
 * page stays outside `GlobalAppShell`.
 */
const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <Box className={aboutStyles.page}>
      <OpenGraph
        title={t("about.meta.title")}
        description={t("about.meta.description")}
      />

      <LandingHeader />

      <main>
        <AboutHero />
        <AboutManifesto />
        <AboutFeatureIndex />
        <AboutLibrarySection />
        <AboutJournalSection />
        <AboutProgressSection />
        <AboutCommunitySection />
        <AboutConnectionsSection />
        <AboutAiSection />
        <AboutBeyondLibrarySection />
        <AboutMobileAppSection />
        <AboutPremiumSection />
        <AboutSupportersWall />
        <AboutPromiseSection />
        <AboutFinalCta />
      </main>

      <LandingFooter />
    </Box>
  );
};

export default AboutPage;
