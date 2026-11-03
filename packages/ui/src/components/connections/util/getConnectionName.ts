import { UserConnectionDto } from "@repo/wrapper/server";
import { match } from "ts-pattern";

export const getConnectionName = (type: UserConnectionDto.type) => {
  return match(type)
    .with(UserConnectionDto.type.STEAM, () => "Steam")
    .with(UserConnectionDto.type.PSN, () => "Playstation Network")
    .with(UserConnectionDto.type.XBOX, () => "Xbox Live")
    .with(UserConnectionDto.type.EPICGAMES, () => "Epic Games")
    .with(UserConnectionDto.type.NINTENDO, () => "Nintendo")
    .with(UserConnectionDto.type.GOG, () => "GOG")
    .exhaustive();
};
