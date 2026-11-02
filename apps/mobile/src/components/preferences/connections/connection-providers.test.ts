import { describe, expect, it } from "vitest";
import {
  NotificationConnectionTargetDto,
  NotificationImporterTargetDto,
  UserConnectionDto,
} from "@repo/wrapper/server";
import { getConnectionName } from "../../../../../../packages/ui/src/components/connections/util/getConnectionName";
import { getConnectionProfileURL } from "../../../../../../packages/ui/src/components/connections/util/getConnectionProfileURL";

// The ts-pattern matches are exhaustive and throw at runtime on an unknown provider.
describe("every server connection provider is presented", () => {
  it.each(Object.values(UserConnectionDto.type))("%s", (type) => {
    expect(getConnectionName(type)).toBeTruthy();
    expect(() =>
      getConnectionProfileURL({ type, sourceUserId: "1" } as UserConnectionDto),
    ).not.toThrow();
  });

  it("notification providers are all connection types", () => {
    const types: string[] = Object.values(UserConnectionDto.type);
    for (const provider of [
      ...Object.values(NotificationConnectionTargetDto.provider),
      ...Object.values(NotificationImporterTargetDto.provider),
    ]) {
      expect(types).toContain(provider);
    }
  });

  it("has no profile link for nintendo", () => {
    expect(
      getConnectionProfileURL({
        type: UserConnectionDto.type.NINTENDO,
      } as UserConnectionDto),
    ).toBeUndefined();
  });
});
