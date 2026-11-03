import { useGame } from "#@/components/game/hooks/useGame";
import { DetailsBox } from "#@/components/general/DetailsBox";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { Group, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { GameCompany, GameRepositoryFindOneDto } from "@repo/wrapper/server";
import { ReactNode, useMemo } from "react";

interface IProps {
  gameId: number;
  /**
   * Shows each company's logo instead of its name; companies without a logo keep their name.
   */
  withLogos?: boolean;
}

const renderCompaniesWithLogos = (companies: GameCompany[]): ReactNode => (
  <Group className={"gn-company-list"}>
    {companies.map((company) => {
      // always .png: IGDB flattens transparency onto black in .jpg, and its alphaChannel flag is unreliable
      const logoUrl = getSizedImageUrl(
        company.logo?.url,
        ImageSize.LOGO_MED,
      )?.replace(/\.jpg$/, ".png");
      return logoUrl ? (
        <img
          key={company.id}
          className={"gn-company-logo"}
          src={logoUrl}
          alt={company.name}
          title={company.name}
        />
      ) : (
        <Text key={company.id} className={"gn-company-name"}>
          {company.name}
        </Text>
      );
    })}
  </Group>
);

const INVOLVED_COMPANIES_DTO: GameRepositoryFindOneDto = {
  relations: {
    involvedCompanies: {
      company: {
        logo: true,
      },
    },
  },
};

const GameInfoDetailsDeveloperInfo = ({ gameId, withLogos }: IProps) => {
  const { t } = useTranslation();
  const game = useGame(gameId, INVOLVED_COMPANIES_DTO);
  const involvedCompanies = game.data?.involvedCompanies;
  const developers = useMemo(() => {
    const hasDevelopers =
      involvedCompanies != undefined &&
      involvedCompanies.some((company) => company.developer);
    if (hasDevelopers) {
      return involvedCompanies
        .filter((ic) => ic.developer)
        .map((ic) => ic.company);
    }
    return null;
  }, [involvedCompanies]);
  const publishers = useMemo(() => {
    const hasPublishers =
      involvedCompanies != undefined &&
      involvedCompanies.some((company) => company.publisher);

    if (hasPublishers) {
      return involvedCompanies
        .filter((ic) => ic.publisher)
        .map((ic) => ic.company);
    }
    return null;
  }, [involvedCompanies]);
  const renderCompanies = (companies: GameCompany[] | null) => {
    if (!companies) return t("game.details.notAvailable");
    if (withLogos) return renderCompaniesWithLogos(companies);
    return companies.map((company) => company.name).join(", ");
  };
  const developersNames = renderCompanies(developers);
  const publishersNames = renderCompanies(publishers);

  return (
    <>
      <DetailsBox
        withBorder
        withDimmedTitle
        title={t("game.details.developers")}
        withPadding
        withBackground
        withRipple
      >
        {game.isLoading ? <Skeleton className={"w-64 h-4"} /> : developersNames}
      </DetailsBox>
      <DetailsBox
        withBorder
        withDimmedTitle
        title={t("game.details.publishers")}
        withPadding
        withBackground
        withRipple
      >
        {game.isLoading ? <Skeleton className={"w-64 h-4"} /> : publishersNames}
      </DetailsBox>
    </>
  );
};

export { GameInfoDetailsDeveloperInfo };