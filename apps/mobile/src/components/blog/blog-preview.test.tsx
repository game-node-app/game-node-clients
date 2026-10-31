// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Preview, {
  getServerSideProps,
} from "../../../../admin/src/pages/dashboard/blog/preview/[postId]";
import { draft } from "./fixtures";
const state = vi.hoisted(() => ({
  userId: "editor" as string | undefined,
  roles: ["editor"],
  query: { postId: "article", locale: "pt-BR" },
}));
vi.mock("next/router", () => ({ useRouter: () => ({ query: state.query }) }));
vi.mock("next/head", () => ({ default: () => null }));
vi.mock("@mantine/core", () => ({
  Text: ({ children }: import("react").PropsWithChildren) => (
    <span>{children}</span>
  ),
}));
vi.mock("@repo/locales", () => ({
  I18nProvider: ({ children }: import("react").PropsWithChildren) => children,
}));
vi.mock("@repo/ui", () => ({
  useUserId: () => state.userId,
  useUserRoles: () => state.roles,
  EUserRoles: { ADMIN: "admin", MOD: "mod", EDITOR: "editor" },
  BlogArticleView: ({
    post,
  }: {
    post: import("@repo/wrapper/server").BlogPreviewDto;
  }) => <article>{post.title}</article>,
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  state.userId = "editor";
  state.roles = ["editor"];
  state.query.locale = "pt-BR";
});
it("excludes drafts from SSR props and forbids storage and indexing", () => {
  const setHeader = vi.fn();
  expect(
    getServerSideProps({
      res: { setHeader },
    } as unknown as import("next").GetServerSidePropsContext),
  ).toEqual({
    props: {},
  });
  expect(setHeader).toHaveBeenCalledWith("Cache-Control", "private, no-store");
  expect(setHeader).toHaveBeenCalledWith("X-Robots-Tag", "noindex, nofollow");
});
it("denies unauthorized reads and clears prior content on logout, locale changes and authorization failure", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => draft });
  vi.stubGlobal("fetch", fetch);
  const view = render(<Preview />);
  await screen.findByText(draft.title);
  expect(fetch.mock.calls[0][1]).toMatchObject({
    cache: "no-store",
    credentials: "include",
  });
  state.userId = undefined;
  view.rerender(<Preview />);
  expect(screen.queryByText(draft.title)).toBeNull();
  expect(screen.getByText("Access denied")).toBeTruthy();
  expect(fetch).toHaveBeenCalledTimes(1);
  state.userId = "other-editor";
  fetch.mockResolvedValue({ ok: false });
  state.query.locale = "en";
  view.rerender(<Preview />);
  expect(screen.queryByText(draft.title)).toBeNull();
  await screen.findByText("Preview unavailable");
  state.roles = [];
  view.rerender(<Preview />);
  expect(screen.getByText("Access denied")).toBeTruthy();
});
