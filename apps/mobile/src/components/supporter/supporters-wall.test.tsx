// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SupportersService,
  type PaginatedSupportersResponseDto,
} from "@repo/wrapper/server";
import { SupportersWall } from "../../../../../packages/ui/src/components/supporter/wall/SupportersWall";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import type { UIHookRegistry } from "../../../../../packages/ui/src/context/registry";

const mocks = vi.hoisted(() => ({
  session: { data: null as unknown, isPending: false },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        ({
          "supporter.wall.title": "Supporters wall",
          "supporter.wall.description": "The people keeping GameNode online.",
          "supporter.wall.showMore": "Show more",
          "supporter.wall.empty.title": "No supporters yet",
          "supporter.wall.empty.description":
            "Be the first to keep GameNode online.",
          "supporter.wall.empty.cta": "Become a Supporter",
          "supporter.wall.error": "We couldn't load the supporters wall.",
          "supporter.wall.retry": "Try again",
        }) as Record<string, string>
      )[key] ?? key,
  }),
  useI18nContext: () => ({ language: "en" }),
}));

function wallPage(
  usernames: string[],
  hasNextPage: boolean,
): PaginatedSupportersResponseDto {
  return {
    data: usernames.map((username) => ({
      userId: `id-${username}`,
      username,
      avatar: null,
    })),
    pagination: { totalItems: 100, totalPages: 3, hasNextPage },
  };
}

function createWrapper(hooks: Partial<UIHookRegistry> = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <MantineProvider>
        <QueryClientProvider client={client}>
          <UIProvider
            presenters={{
              Link: ({ href, children: linkChildren, ...others }) => (
                <a href={href} {...others}>
                  {linkChildren}
                </a>
              ),
            }}
            hooks={{
              useRouter: () => ({
                pathname: "/about",
                asPath: "/about",
                back: () => {},
                push: async () => {},
                query: new URLSearchParams(),
              }),
              ...hooks,
            }}
          >
            {children}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    );
  };
}

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SupportersWall", () => {
  it("invites the visitor to become the first supporter when the wall is empty", async () => {
    mocks.session = { data: { user: { id: "user-1" } }, isPending: false };
    vi.spyOn(
      SupportersService,
      "supportersControllerGetWallV1",
    ).mockResolvedValue(wallPage([], false));

    const { container } = render(<SupportersWall variant={"page"} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText("No supporters yet")).toBeTruthy();
    expect(
      screen.getByText("Be the first to keep GameNode online."),
    ).toBeTruthy();

    const cta = screen.getByRole("link", { name: "Become a Supporter" });
    expect(cta.getAttribute("href")).toBe("/home?settings=premium");
    expect(container.querySelector("section#supporters")).not.toBeNull();
  });

  it("points the settings variant at the app's Supporter route", async () => {
    mocks.session = { data: { user: { id: "user-1" } }, isPending: false };
    vi.spyOn(
      SupportersService,
      "supportersControllerGetWallV1",
    ).mockResolvedValue(wallPage([], false));

    render(<SupportersWall variant={"settings"} />, {
      wrapper: createWrapper({
        supporterSettingsHref: "/preferences/supporter",
      }),
    });

    expect(await screen.findByText("No supporters yet")).toBeTruthy();

    const cta = screen.getByRole("link", { name: "Become a Supporter" });
    expect(cta.getAttribute("href")).toBe("/preferences/supporter");
  });

  it("shows the error and loads the wall again when retrying", async () => {
    const request = vi
      .spyOn(SupportersService, "supportersControllerGetWallV1")
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(wallPage(["abby"], false));

    render(<SupportersWall variant={"page"} />, {
      wrapper: createWrapper(),
    });

    expect(
      await screen.findByText("We couldn't load the supporters wall."),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("abby")).toBeTruthy();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("appends the next page on Show more and links each item to its profile", async () => {
    const request = vi
      .spyOn(SupportersService, "supportersControllerGetWallV1")
      .mockImplementation(((offset = 0) =>
        Promise.resolve(
          offset === 0
            ? wallPage(["abby", "bruno"], true)
            : wallPage(["cassi"], false),
        )) as unknown as typeof SupportersService.supportersControllerGetWallV1);

    render(<SupportersWall variant={"page"} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText("abby")).toBeTruthy();
    expect(screen.queryByText("cassi")).toBeNull();
    expect(
      screen.getByTestId("supporters-wall-item-id-abby").getAttribute("href"),
    ).toBe("/profile/id-abby");

    fireEvent.click(screen.getByRole("button", { name: "Show more" }));

    expect(await screen.findByText("cassi")).toBeTruthy();
    expect(screen.getByText("abby")).toBeTruthy();
    expect(request).toHaveBeenLastCalledWith(48, 48);

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Show more" })).toBeNull(),
    );
  });
});
