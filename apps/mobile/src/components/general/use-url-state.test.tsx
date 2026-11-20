// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUrlState } from "../../../../../packages/ui/src/components/general/hooks/useUrlState";

const state = vi.hoisted(() => ({ search: "" }));
vi.mock("../../../../../packages/ui/src/util", () => ({
  useRouter: () => ({
    query: new URLSearchParams(state.search),
    pathname: "/x",
    push: vi.fn(),
  }),
}));

it("keeps string params as strings instead of JSON-parsing them", () => {
  state.search = "search=123&flag=true&other=null&page=3";
  const { result } = renderHook(() =>
    useUrlState({ search: "", other: "", flag: false, page: 1 }),
  );

  expect(result.current[0]).toEqual({
    search: "123",
    other: "null",
    flag: true,
    page: 3,
  });
});
