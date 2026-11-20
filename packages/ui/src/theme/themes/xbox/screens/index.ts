import type { ThemePackPresenters } from "#@/theme/packs/types";
// Side-effect import: the Xbox game-page focus scope is only downloaded with
// this lazy pack and only applies where the page sets the scope attribute.
import "./XboxFocus.module.css";
import { xboxCommunityPresenters } from "./XboxCommunityPresenters";
import { xboxGamePresenters } from "./XboxGamePresenters";

export const presenters: ThemePackPresenters = {
  ...xboxGamePresenters,
  ...xboxCommunityPresenters,
};
