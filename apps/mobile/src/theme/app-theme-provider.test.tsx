// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  AppThemeProvider,
  useAppExperience,
  useAppTheme,
  useIsAppExperiencePending,
  type AppThemeProviderProps,
} from "../../../../packages/ui/src/theme/AppThemeProvider";
import {
  UIProvider,
  usePresenter,
} from "../../../../packages/ui/src/context/UIProvider";
import { buildPresenterComponent } from "../../../../packages/ui/src/context/utils/buildPresenterComponent";
import {
  createThemePackStore,
  type ThemePackLoaders,
} from "../../../../packages/ui/src/theme/packs/store";
import type { ThemePack } from "../../../../packages/ui/src/theme/packs/types";
import {
  getThemeCatalogEntry,
  type ThemeCatalogEntry,
  type ThemeId,
} from "../../../../packages/ui/src/theme/generated/catalog";
import type { ThemeCatalog } from "../../../../packages/ui/src/theme/runtime";
import type { UIPresenterRegistry } from "../../../../packages/ui/src/context/registry";

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

const appPresenters: Partial<UIPresenterRegistry> = {
  DetailsBox: AppDetails,
};

function PresenterProbe() {
  const Details = usePresenter("DetailsBox") as React.ComponentType | undefined;
  const Activity = usePresenter("ActivityItem") as
    | React.ComponentType
    | undefined;
  const Collection = usePresenter("CollectionThumbnailCard") as
    | React.ComponentType
    | undefined;

  return (
    <div>
      {Details ? <Details /> : <span>presenter:none-details</span>}
      {Activity ? <Activity /> : <span>presenter:none-activity</span>}
      {Collection ? <Collection /> : <span>presenter:none-collection</span>}
    </div>
  );
}

function ThemeHarness() {
  const [theme, setTheme] = useAppTheme();
  const experience = useAppExperience();
  const pending = useIsAppExperiencePending();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="experience">{experience}</span>
      <span data-testid="pending">{String(pending)}</span>
      <button type="button" onClick={() => setTheme("test-console" as ThemeId)}>
        to-console
      </button>
      <button type="button" onClick={() => setTheme("gamenode")}>
        to-default
      </button>
      <PresenterProbe />
    </div>
  );
}

function renderApp({
  props = {},
  presenters = {},
}: {
  props?: Omit<AppThemeProviderProps, "children">;
  presenters?: Partial<UIPresenterRegistry>;
} = {}) {
  return render(
    <UIProvider hooks={hooks} presenters={presenters}>
      <AppThemeProvider catalog={testCatalog} {...props}>
        <ThemeHarness />
      </AppThemeProvider>
    </UIProvider>,
  );
}

function fakeStorage(initial: string | null) {
  const storage = {
    value: initial,
    get: () => storage.value,
    set: vi.fn((next: string) => {
      storage.value = next;
    }),
  };
  return storage;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function storeWith(loaders: ThemePackLoaders = {}) {
  return createThemePackStore(loaders);
}

beforeEach(() => {
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.experience;
  delete document.documentElement.dataset.themeSsr;
});

afterEach(() => {
  cleanup();
});

describe("AppThemeProvider", () => {
  it("defaults to gamenode and publishes data-theme/data-experience", async () => {
    const storage = fakeStorage(null);
    renderApp({
      props: {
        packStore: storeWith(),
        themeStorage: storage,
      },
    });

    expect(screen.getByTestId("theme").textContent).toBe("gamenode");
    expect(screen.getByTestId("experience").textContent).toBe("default");
    expect(screen.getByTestId("pending").textContent).toBe("false");

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("gamenode");
      expect(document.documentElement.dataset.experience).toBe("default");
    });
    expect(storage.get()).toBeNull();
  });

  it("sets and persists a theme through the injected storage", async () => {
    const storage = fakeStorage(null);
    const store = storeWith({
      experience: { console: async () => experiencePack },
      screens: { xbox: async () => screensPack },
    });

    renderApp({
      props: { packStore: store, themeStorage: storage },
      presenters: appPresenters,
    });

    fireEvent.click(screen.getByText("to-console"));

    await waitFor(() => {
      expect(screen.getByTestId("theme").textContent).toBe("test-console");
      expect(screen.getByTestId("experience").textContent).toBe("console");
    });

    expect(storage.set).toHaveBeenCalledWith("test-console");
    expect(storage.get()).toBe("test-console");
    expect(document.documentElement.dataset.theme).toBe("test-console");
    expect(document.documentElement.dataset.experience).toBe("console");
  });

  it("renders the experience of the initial (server) theme", async () => {
    const store = storeWith({
      experience: { console: async () => experiencePack },
      screens: { xbox: async () => screensPack },
    });

    renderApp({
      props: {
        initialTheme: "test-console",
        packStore: store,
        themeStorage: null,
      },
      presenters: appPresenters,
    });

    await waitFor(() => {
      expect(screen.getByTestId("theme").textContent).toBe("test-console");
      expect(screen.getByTestId("experience").textContent).toBe("console");
    });
    expect(screen.getByText("presenter:screens-activity")).toBeTruthy();
  });

  it("restores a stored theme after hydration", async () => {
    const store = storeWith({
      experience: { console: async () => experiencePack },
      screens: { xbox: async () => screensPack },
    });
    const storage = fakeStorage("test-console");
    const root = document.documentElement;
    root.dataset.theme = "test-console";
    const observer = new MutationObserver(() => {});
    observer.observe(root, {
      attributeFilter: ["data-theme"],
      attributeOldValue: true,
    });
    renderApp({ props: { packStore: store, themeStorage: storage } });
    const previousThemes = observer
      .takeRecords()
      .map((record) => record.oldValue);
    observer.disconnect();

    // The first render uses the default (what the server would have sent).
    expect(screen.getByTestId("experience").textContent).toBe("default");
    expect(previousThemes).not.toContain("gamenode");
    expect(root.dataset.theme).toBe("test-console");
    await waitFor(() => {
      expect(screen.getByTestId("theme").textContent).toBe("test-console");
      expect(screen.getByTestId("experience").textContent).toBe("console");
    });
  });

  it("falls back to gamenode for an unknown stored value", async () => {
    const storage = fakeStorage("removed-theme");
    renderApp({
      props: {
        packStore: storeWith(),
        themeStorage: storage,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId("theme").textContent).toBe("gamenode");
    });
    expect(storage.set).not.toHaveBeenCalled();
  });

  it("renders the restored palette with the default layout on a slow client start", async () => {
    const experience = deferred<ThemePack>();
    const screens = deferred<ThemePack>();
    const store = storeWith({
      experience: { console: () => experience.promise },
      screens: { xbox: () => screens.promise },
    });

    renderApp({
      props: {
        initialTheme: "test-console",
        packStore: store,
        suspendOnInitialPack: false,
      },
    });

    expect(screen.getByTestId("theme").textContent).toBe("test-console");
    expect(document.documentElement.dataset.theme).toBe("test-console");
    expect(screen.getByTestId("experience").textContent).toBe("default");
    expect(screen.getByTestId("pending").textContent).toBe("true");

    experience.resolve(experiencePack);
    screens.resolve(screensPack);
    await waitFor(() => {
      expect(screen.getByTestId("experience").textContent).toBe("console");
      expect(screen.getByTestId("pending").textContent).toBe("false");
    });
  });

  it("keeps the current presenters while the next pack loads", async () => {
    const experience = deferred<ThemePack>();
    const screens = deferred<ThemePack>();
    const store = storeWith({
      experience: { console: () => experience.promise },
      screens: { xbox: () => screens.promise },
    });

    renderApp({
      props: { packStore: store, themeStorage: fakeStorage(null) },
      presenters: appPresenters,
    });

    fireEvent.click(screen.getByText("to-console"));

    // Colors change immediately; layout/presenters stay on the current ones.
    expect(screen.getByTestId("theme").textContent).toBe("test-console");
    expect(screen.getByTestId("experience").textContent).toBe("default");
    expect(screen.getByTestId("pending").textContent).toBe("true");
    expect(screen.getByText("presenter:app-details")).toBeTruthy();
    expect(screen.queryByText("presenter:screens-activity")).toBeNull();
    expect(screen.queryByText("presenter:experience-collection")).toBeNull();

    experience.resolve(experiencePack);
    await waitFor(() => {
      // Screens are still loading, so the experience must not switch yet.
      expect(screen.getByTestId("experience").textContent).toBe("default");
    });
    expect(screen.queryByText("presenter:experience-collection")).toBeNull();

    screens.resolve(screensPack);
    await waitFor(() => {
      expect(screen.getByTestId("experience").textContent).toBe("console");
      expect(screen.getByTestId("pending").textContent).toBe("false");
    });

    // experience -> screens -> app
    expect(screen.getByText("presenter:app-details")).toBeTruthy();
    expect(screen.getByText("presenter:screens-activity")).toBeTruthy();
    expect(screen.getByText("presenter:experience-collection")).toBeTruthy();
  });

  it("falls back to the default layout and presenters when the experience import rejects", async () => {
    const store = storeWith({
      experience: {
        console: async () => {
          throw new Error("offline");
        },
      },
      screens: { xbox: async () => screensPack },
    });

    const storage = fakeStorage(null);
    renderApp({
      props: { packStore: store, themeStorage: storage },
      presenters: appPresenters,
    });

    fireEvent.click(screen.getByText("to-console"));

    await waitFor(() => {
      expect(screen.getByTestId("theme").textContent).toBe("test-console");
      expect(screen.getByTestId("pending").textContent).toBe("false");
    });

    // Theme colors apply, but the failed experience never becomes active.
    expect(screen.getByTestId("experience").textContent).toBe("default");
    expect(document.documentElement.dataset.theme).toBe("test-console");
    expect(document.documentElement.dataset.experience).toBe("default");
    expect(screen.getByText("presenter:app-details")).toBeTruthy();
    expect(screen.queryByText("presenter:experience-collection")).toBeNull();
    expect(screen.queryByText("presenter:screens-activity")).toBeNull();
  });

  it("keeps the experience but skips screens when only the screens import rejects", async () => {
    const store = storeWith({
      experience: { console: async () => experiencePack },
      screens: {
        xbox: async () => {
          throw new Error("offline");
        },
      },
    });

    renderApp({
      props: { packStore: store, themeStorage: fakeStorage(null) },
      presenters: appPresenters,
    });

    fireEvent.click(screen.getByText("to-console"));

    await waitFor(() => {
      expect(screen.getByTestId("experience").textContent).toBe("console");
    });

    expect(screen.getByText("presenter:app-details")).toBeTruthy();
    expect(screen.getByText("presenter:experience-collection")).toBeTruthy();
    expect(screen.queryByText("presenter:screens-activity")).toBeNull();
  });

  it("ignores a stale pack that resolves after switching back", async () => {
    const experience = deferred<ThemePack>();
    const screens = deferred<ThemePack>();
    const store = storeWith({
      experience: { console: () => experience.promise },
      screens: { xbox: () => screens.promise },
    });

    renderApp({
      props: { packStore: store, themeStorage: fakeStorage(null) },
      presenters: appPresenters,
    });

    fireEvent.click(screen.getByText("to-console"));
    fireEvent.click(screen.getByText("to-default"));
    expect(screen.getByTestId("theme").textContent).toBe("gamenode");

    experience.resolve(experiencePack);
    screens.resolve(screensPack);

    await waitFor(() => {
      expect(screen.getByTestId("experience").textContent).toBe("default");
    });
    expect(screen.getByText("presenter:app-details")).toBeTruthy();
    expect(screen.queryByText("presenter:screens-activity")).toBeNull();
    expect(screen.queryByText("presenter:experience-collection")).toBeNull();
  });

  it("does not persist or change a pinned theme", async () => {
    const storage = fakeStorage("test-console");
    renderApp({
      props: {
        packStore: storeWith(),
        themeStorage: storage,
        pinned: true,
      },
    });

    expect(screen.getByTestId("theme").textContent).toBe("gamenode");
    fireEvent.click(screen.getByText("to-console"));
    expect(screen.getByTestId("theme").textContent).toBe("gamenode");
    expect(storage.set).not.toHaveBeenCalled();
  });
});

describe("theme pack store", () => {
  it("deduplicates concurrent loads", async () => {
    const loader = vi.fn(async () => experiencePack);
    const store = storeWith({ experience: { console: loader } });

    await Promise.all([
      store.load("experience", "console"),
      store.load("experience", "console"),
      store.load("experience", "console"),
    ]);

    expect(loader).toHaveBeenCalledTimes(1);
    expect(store.isLoaded("experience", "console")).toBe(true);
    expect(store.getError("experience", "console")).toBeNull();
  });

  it("caches the fallback pack and the error when an import rejects", async () => {
    const error = new Error("offline");
    const store = storeWith({
      screens: {
        xbox: async () => {
          throw error;
        },
      },
    });

    const pack = await store.load("screens", "xbox");

    expect(pack).toEqual({ presenters: {} });
    expect(store.isLoaded("screens", "xbox")).toBe(true);
    expect(store.getError("screens", "xbox")).toBe(error);
  });

  it("resolves the default experience and missing screens synchronously", () => {
    const store = storeWith();

    expect(store.isLoaded("experience", "default")).toBe(true);
    expect(store.isLoaded("screens", null)).toBe(true);
    expect(store.peek("experience", "default")).toEqual({ presenters: {} });
    expect(store.peek("screens", undefined)).toEqual({ presenters: {} });
  });
});

describe("buildPresenterComponent defaults", () => {
  const FallbackDetails = ({ title }: { title: string }) => (
    <span>fallback-{title}</span>
  );
  const DetailsPresenter = buildPresenterComponent(
    "DetailsBox",
    FallbackDetails,
  );

  it("renders the fallback without an override and the override when present", () => {
    const { unmount } = render(
      <UIProvider hooks={hooks}>
        <DetailsPresenter title="details" />
      </UIProvider>,
    );

    expect(screen.getByText("fallback-details")).toBeTruthy();
    unmount();

    render(
      <UIProvider hooks={hooks} presenters={appPresenters}>
        <DetailsPresenter title="details" />
      </UIProvider>,
    );
    expect(screen.getByText("presenter:app-details")).toBeTruthy();
  });
});
