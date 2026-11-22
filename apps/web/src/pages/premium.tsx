import { LandingHeader } from "@/components/general/header/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PremiumComparison } from "@/components/premium/PremiumComparison";
import { PremiumExtrasGrid } from "@/components/premium/PremiumExtrasGrid";
import { PremiumFaq } from "@/components/premium/PremiumFaq";
import { PremiumFeatureAccent } from "@/components/premium/PremiumFeatureAccent";
import { PremiumFeatureBadge } from "@/components/premium/PremiumFeatureBadge";
import { PremiumFeatureVideo } from "@/components/premium/PremiumFeatureVideo";
import { PremiumFinalCta } from "@/components/premium/PremiumFinalCta";
import { PremiumFreeForever } from "@/components/premium/PremiumFreeForever";
import { PremiumHero } from "@/components/premium/PremiumHero";
import { PremiumMoney } from "@/components/premium/PremiumMoney";
import { PremiumPricing } from "@/components/premium/PremiumPricing";
import { PremiumRest } from "@/components/premium/PremiumRest";
import { PremiumSupportersWall } from "@/components/premium/PremiumSupportersWall";
import premiumStyles from "@/components/premium/Premium.module.css";
import { ThemeScope } from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { OpenGraph } from "@/components/general/OpenGraph";

/**
 * Public Premium landing page. Composition only: every section lives in
 * `components/premium`, the header/footer are shared with the landing and the
 * page stays outside `GlobalAppShell`.
 */
const PremiumPage = () => {
  const { t } = useTranslation();

  return (
    <ThemeScope className={premiumStyles.page}>
      <OpenGraph
        title={t("premium.meta.title")}
        description={t("premium.meta.description")}
      />

      <LandingHeader />

      <main>
        <PremiumHero />
        <PremiumExtrasGrid />
        <PremiumFeatureVideo />
        <PremiumFeatureAccent />
        <PremiumFeatureBadge />
        <PremiumRest />
        <PremiumComparison />
        <PremiumPricing />
        <PremiumSupportersWall />
        <PremiumMoney />
        <PremiumFaq />
        <PremiumFreeForever />
        <PremiumFinalCta />
      </main>

      <LandingFooter />
    </ThemeScope>
  );
};

export default PremiumPage;
