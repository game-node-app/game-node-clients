// @vitest-environment node
import React from "react";
import { describe, expect, it } from "vitest";
import { renderToReadableStream } from "react-dom/server";
import {
  AppThemeProvider,
  useAppExperience,
} from "../../../../packages/ui/src/theme/AppThemeProvider";
import {
  UIProvider,
  usePresenter,
} from "../../../../packages/ui/src/context/UIProvider";
import { createThemePackStore } from "../../../../packages/ui/src/theme/packs/store";
import type { ThemePack } from "../../../../packages/ui/src/theme/packs/types";
import {
  getThemeCatalogEntry,
  type ThemeCatalogEntry,
  type ThemeId,
} from "../../../../packages/ui/src/theme/generated/catalog";
import type { ThemeCatalog } from "../../../../packages/ui/src/theme/runtime";

const consoleEntry: ThemeCatalogEntry = {
  ...getThemeCatalogEntry("gamenode"),
  id: "test-console" as ThemeId,
  labelKey: "settings.appearance.theme.console",
  isDefault: false,
  experience: "console",
  screens: "xbox",
};

const testCatalog: ThemeCatalog = {
  defaultId: "gamenode",
  isThemeId: (value): value is ThemeId =>
    value === "gamenode" || value === "test-console",
  get: (id) =>
    id === "test-console" ? consoleEntry : getThemeCatalogEntry("gamenode"),
};

const hooks = {
  useRouter: () => ({
    pathname: "/",
    back: () => {},
    push: async () => {},
    query: new URLSearchParams(),
  }),
};

const ExperienceDetails = () => <span>presenter:experience-details</span>;
const ExperienceCollection = () => <span>presenter:experience-collection</span>;
const ScreensActivity = () => <span>presenter:screens-activity</span>;
const AppDetails = () => <span>presenter:app-details</span>;

const experiencePack: ThemePack = {
  presenters: {
    DetailsBox: ExperienceDetails,
    CollectionThumbnailCard: ExperienceCollection,
  },
};

const screensPack: ThemePack = {
  presenters: {
    ActivityItem: ScreensActivity,
  },
};

function ServerProbe() {
  const experience = useAppExperience();
  const Details = usePresenter("DetailsBox") as React.ComponentType | undefined;
  const Activity = usePresenter("ActivityItem") as
    | React.ComponentType
    | undefined;
  const Collection = usePresenter("CollectionThumbnailCard") as
    | React.ComponentType
    | undefined;

  return (
    <div data-experience={experience}>
      {Details ? <Details /> : <span>presenter:none-details</span>}
      {Activity ? <Activity /> : <span>presenter:none-activity</span>}
      {Collection ? <Collection /> : <span>presenter:none-collection</span>}
    </div>
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("AppThemeProvider SSR", () => {
  it("suspends until the selected theme packs resolve, so allReady waits", async () => {
    const experience = deferred<ThemePack>();
    const screens = deferred<ThemePack>();
    const store = createThemePackStore({
      experience: { console: () => experience.promise },
      screens: { xbox: () => screens.promise },
    });
    const errors: unknown[] = [];

    const stream = await renderToReadableStream(
      <UIProvider hooks={hooks} presenters={{ DetailsBox: AppDetails }}>
        <AppThemeProvider
          catalog={testCatalog}
          packStore={store}
          initialTheme="test-console"
          themeStorage={null}
        >
          <ServerProbe />
        </AppThemeProvider>
      </UIProvider>,
      {
        onError(error) {
          errors.push(error);
        },
      },
    );

    let ready = false;
    const allReady = stream.allReady.then(() => {
      ready = true;
    });

    await sleep(25);
    expect(ready).toBe(false);

    experience.resolve(experiencePack);
    screens.resolve(screensPack);
    await allReady;

    expect(errors).toEqual([]);
    expect(ready).toBe(true);

    const html = await new Response(stream).text();
    expect(html).toContain('data-experience="console"');
    expect(html).toContain("presenter:app-details");
    expect(html).toContain("presenter:screens-activity");
    expect(html).toContain("presenter:experience-collection");
    expect(html).not.toContain("presenter:none");
  });
});
