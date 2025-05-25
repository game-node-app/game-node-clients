import { UserConnectionDto } from "@repo/wrapper/server";
import { match } from "ts-pattern";
import type = UserConnectionDto.type;

export function getConnectionProfileURL(connection: UserConnectionDto) {
  return match(connection.type)
    .with(
      type.STEAM,
      () => `https://steamcommunity.com/profiles/${connection.sourceUserId}`,
    )
    .with(
      type.PSN,
      () => `https://psnprofiles.com/${connection.sourceUsername}`,
    )
    .with(
      type.XBOX,
      () =>
        `https://www.trueachievements.com/gamer/${connection.sourceUsername}`,
    )
    .exhaustive();
}
