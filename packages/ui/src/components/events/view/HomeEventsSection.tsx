import { useSeasonEvents } from "#@/components/events/hooks/useSeasonEvents";
import { cn } from "#@/util";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import { Stack, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { EventCard, type EventCardKind } from "./EventCard";

/** Below `md` the cards become the mobile carousel (frame `5445:2032`). */
export const HOME_EVENTS_CAROUSEL_QUERY = "(max-width: 62em)";

export interface HomeEventsSectionProps {
  className?: string;
}

const AWARDS_CARD_KIND: Record<string, EventCardKind> = {
  nominations: "awards-nominations",
  voting: "awards-voting",
  results: "awards-results",
};

/**
 * Single Home section of seasonal events (design §4, spec: Seção de eventos na
 * Home). It decides how many cards exist and their layout; each card owns its
 * variant data:
 *
 * - 0 cards: the section is not rendered at all (no empty gap);
 * - 1 card: Wide on web;
 * - 2 cards: Half + Half on web, Awards first;
 * - below `md`: horizontal carousel with a 300 px card and a peek of the next.
 *
 * It replaces the old `DynamicAwardsOverview`/`DynamicRecapOverview` blocks.
 */
export function HomeEventsSection({ className }: HomeEventsSectionProps) {
  const { t } = useTranslation();
  const season = useSeasonEvents();
  const isCarousel = useMediaQuery(HOME_EVENTS_CAROUSEL_QUERY, false);

  if (season.isLoading) {
    return null;
  }

  const kinds: EventCardKind[] = [];

  if (season.awardsEntry?.showHomeCard) {
    const awardsKind = AWARDS_CARD_KIND[season.awardsEntry.kind];
    if (awardsKind) {
      kinds.push(awardsKind);
    }
  }

  if (season.recapEntry) {
    kinds.push(
      season.recapEntry.kind === "live" ? "recap-live" : "recap-closed",
    );
  }

  if (kinds.length === 0) {
    return null;
  }

  const layout = isCarousel ? "carousel" : kinds.length === 1 ? "wide" : "duo";

  return (
    <section
      data-testid={"home-events-section"}
      data-layout={layout}
      aria-label={t("events.home.carouselLabel")}
      className={cn("w-full", className)}
    >
      <Stack gap={"sm"} className={"w-full"}>
        <Title order={2} size={"h4"}>
          {t("events.home.title")}
        </Title>
        {isCarousel ? (
          <Carousel
            data-testid={"home-events-carousel"}
            aria-label={t("events.home.carouselLabel")}
            slideSize={300}
            slideGap={"md"}
            withControls={false}
            withIndicators
            emblaOptions={{ align: "start", slidesToScroll: 1 }}
            className={"w-full"}
          >
            {kinds.map((kind) => (
              <Carousel.Slide key={kind}>
                <EventCard kind={kind} layout={"mobile"} />
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : kinds.length === 2 ? (
          <div className={"grid w-full grid-cols-1 gap-4 md:grid-cols-2"}>
            {kinds.map((kind) => (
              <EventCard key={kind} kind={kind} layout={"half"} />
            ))}
          </div>
        ) : (
          <EventCard kind={kinds[0]} layout={"wide"} />
        )}
      </Stack>
    </section>
  );
}
