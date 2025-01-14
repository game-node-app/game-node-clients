import { Game } from "@/wrapper/server";
import { SearchGame } from "@/components/game/search/utils/types";

export type TGameOrSearchGame = Game | SearchGame;

export interface GameResourceFilter {
    /**
     * Resource name to be used in input labels
     */
    label: string;
    /**
     * Resource name to be used in the request endpoint
     */
    resource: string;
}
