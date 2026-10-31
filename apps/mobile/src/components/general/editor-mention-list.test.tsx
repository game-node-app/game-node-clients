// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { act, cleanup, render } from "@testing-library/react";
import { ComponentProps, createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  EditorMentionList,
  SuggestionListRef,
} from "../../../../../packages/ui/src/components/general/editor/EditorMentionList";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("resets keyboard selection when mention results change and ignores an empty list", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const ref = createRef<SuggestionListRef>();
  const command = vi.fn();
  const props = (items: { id: string; label: string }[]) =>
    ({ items, command }) as unknown as ComponentProps<typeof EditorMentionList>;
  const key = (value: string) =>
    act(() => {
      ref.current?.onKeyDown({
        event: new KeyboardEvent("keydown", { key: value }),
      } as Parameters<SuggestionListRef["onKeyDown"]>[0]);
    });
  const view = render(
    <EditorMentionList
      {...props([
        { id: "one", label: "One" },
        { id: "two", label: "Two" },
      ])}
      ref={ref}
    />,
    { wrapper: MantineProvider },
  );
  key("ArrowDown");
  key("Enter");
  expect(command).toHaveBeenLastCalledWith({ id: "two", label: "Two" });
  view.rerender(
    <EditorMentionList {...props([{ id: "new", label: "New" }])} ref={ref} />,
  );
  key("Enter");
  expect(command).toHaveBeenLastCalledWith({ id: "new", label: "New" });
  command.mockClear();
  view.rerender(<EditorMentionList {...props([])} ref={ref} />);
  key("Enter");
  expect(command).not.toHaveBeenCalled();
});
