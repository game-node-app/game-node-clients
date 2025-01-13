import { Game } from "@/wrapper/server";
import { schema_SearchGame } from "@/wrapper/search";

export type TGameOrSearchGame = Game | schema_SearchGame;
