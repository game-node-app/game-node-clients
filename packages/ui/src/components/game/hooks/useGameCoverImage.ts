import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Game,
  GameRepositoryFindOneDto,
  GameRepositoryService,
} from "@repo/wrapper/server";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { isGameObject } from "#@/components/game/util/isGameObject";
import { TGameOrSearchGame } from "#@/components/game/util/types";

export const GAME_COVER_PLACEHOLDER = "/img/game_placeholder.jpeg";

/** The unpersonalized read `useGame` uses for its shared `["game", id, dto]` entry. */
const DEFAULT_COVER_DTO: GameRepositoryFindOneDto = {
  relations: { cover: true },
};
const FALLBACK_STALE_TIME = 5 * 60 * 1000;

interface CoverFailure {
  /** The cover URL the failure belongs to. A different URL starts over. */
  url: string;
  failedUrls: string[];
  fallbackUrl?: string;
}

/**
 * Cover URL for a game, with the image failure fallback from the custom covers
 * design: a chosen cover that fails falls back once to the game's default cover
 * (read from the shared unpersonalized game entry), then to the placeholder.
 * Search results have no repository entry to fall back to, so they go straight
 * to the placeholder. Failed URLs are not retried for the same incoming URL.
 */
export function useGameCoverImage(
  game: TGameOrSearchGame | undefined | null,
  size: ImageSize,
) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<CoverFailure | null>(null);
  const requestedFallbacks = useRef(new Set<string>());

  const sourceUrl = getSizedImageUrl(getCoverUrl(game), size);

  useEffect(() => {
    // A new incoming URL starts over: drop the failures of the previous one.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting local failure state is the purpose of this effect
    setFailure(null);
    requestedFallbacks.current.clear();
  }, [sourceUrl]);

  const activeFailure = failure?.url === sourceUrl ? failure : null;
  const activeUrl = activeFailure?.fallbackUrl ?? sourceUrl;
  const src =
    activeUrl != undefined && activeFailure?.failedUrls.includes(activeUrl)
      ? GAME_COVER_PLACEHOLDER
      : activeUrl;

  const onError = () => {
    if (!game || !sourceUrl) {
      return;
    }

    const current: CoverFailure =
      failure?.url === sourceUrl ? failure : { url: sourceUrl, failedUrls: [] };
    const failedUrl = current.fallbackUrl ?? sourceUrl;
    if (current.failedUrls.includes(failedUrl)) {
      return;
    }

    const failedUrls = [...current.failedUrls, failedUrl];
    const defaultCoverFailed = current.fallbackUrl != undefined;
    if (defaultCoverFailed || !isGameObject(game)) {
      // A search result's cover cannot be resolved to the default cover.
      setFailure({ ...current, failedUrls });
      return;
    }

    setFailure({ ...current, failedUrls });
    if (requestedFallbacks.current.has(sourceUrl)) {
      return;
    }
    requestedFallbacks.current.add(sourceUrl);

    const gameId = game.id;
    queryClient
      .fetchQuery<Game>({
        queryKey: ["game", gameId, DEFAULT_COVER_DTO],
        queryFn: () =>
          GameRepositoryService.gameRepositoryControllerFindOneByIdV1(
            gameId,
            DEFAULT_COVER_DTO,
          ),
        staleTime: FALLBACK_STALE_TIME,
      })
      .then((defaultGame) => {
        const fallbackUrl = getSizedImageUrl(getCoverUrl(defaultGame), size);
        if (!fallbackUrl || failedUrls.includes(fallbackUrl)) {
          return;
        }
        setFailure((latest) => {
          // The incoming URL changed while the read was in flight.
          if (latest?.url !== sourceUrl) {
            return latest;
          }
          return { ...latest, fallbackUrl };
        });
      })
      .catch(() => undefined);
  };

  return { src, onError };
}
