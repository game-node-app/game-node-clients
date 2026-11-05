import en from "../../../../../../packages/locales/src/translations/json/en.json";
import pt from "../../../../../../packages/locales/src/translations/json/pt-BR.json";
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

  it("names GOG", () =>
    expect(getConnectionName(UserConnectionDto.type.GOG)).toBe("GOG"));

  it("notification providers are all connection types", () => {
    const types: string[] = Object.values(UserConnectionDto.type);
    for (const provider of [
      ...Object.values(NotificationConnectionTargetDto.provider),
      ...Object.values(NotificationImporterTargetDto.provider),
    ]) {
      expect(types).toContain(provider);
    }
  });

  it.each([UserConnectionDto.type.NINTENDO, UserConnectionDto.type.GOG])(
    "has no profile link for %s",
    (type) => {
      expect(
        getConnectionProfileURL({
          type,
        } as UserConnectionDto),
      ).toBeUndefined();
    },
  );
});

it("resolves every GOG instruction in both locales", () => {
  const enCopy = en.preferences.delegatedCode.gog;
  const ptCopy = pt.preferences.delegatedCode.gog;
  expect(Object.keys(enCopy)).toEqual(Object.keys(ptCopy));
  for (const text of [...Object.values(enCopy), ...Object.values(ptCopy)])
    expect(text.length).toBeGreaterThanOrEqual(10);
  expect(enCopy.coverage).toMatch(/unplayed.*PC.*Galaxy.*cumulative.*offline/);
  expect(ptCopy.coverage).toMatch(
    /nunca jogados.*PC.*Galaxy.*cumulativa.*offline/,
  );
});
