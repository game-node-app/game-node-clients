/** @jest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { SimulatePanel } from "./SimulatePanel";

const searchUsers = jest.fn();
const simulate = jest.fn();
jest.mock("@repo/wrapper/server", () => ({
  SearchService: {
    searchControllerSearchUsers0V1: (...args: unknown[]) =>
      searchUsers(...args),
  },
  AchievementsAdminService: {
    achievementsAdminControllerSimulateDefinitionV1: (...args: unknown[]) =>
      simulate(...args),
  },
}));
jest.mock("@repo/ui", () => ({ createErrorNotification: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({
  useQuery: (options: any) => {
    if (options.enabled) options.queryFn();
    return {
      data: { data: { items: [{ userId: "u1", username: "player" }] } },
    };
  },
  useMutation: (options: any) => ({ mutate: options.mutationFn }),
}));
jest.mock("@mantine/core", () => ({
  Paper: ({ children }: any) => React.createElement("div", null, children),
  Stack: ({ children }: any) => React.createElement("div", null, children),
  Group: ({ children }: any) => React.createElement("div", null, children),
  Text: ({ children }: any) => React.createElement("div", null, children),
  Button: ({ children, onClick, disabled }: any) =>
    React.createElement("button", { onClick, disabled }, children),
  Select: ({ onSearchChange, onChange, data }: any) =>
    React.createElement(
      "div",
      null,
      React.createElement("input", {
        "aria-label": "User search",
        onChange: (e: any) => onSearchChange(e.target.value),
      }),
      data.map((item: any) =>
        React.createElement(
          "button",
          { key: item.value, onClick: () => onChange(item.value) },
          item.label,
        ),
      ),
    ),
}));

test("an editor searches public users and simulates the selected user", () => {
  render(React.createElement(SimulatePanel, { definitionId: "d1" }));
  fireEvent.change(screen.getByLabelText("User search"), {
    target: { value: "pla" },
  });
  expect(searchUsers).toHaveBeenCalledWith({ query: "pla", limit: 20 });
  fireEvent.click(screen.getByText("player"));
  fireEvent.click(screen.getByRole("button", { name: "Simulate" }));
  expect(simulate).toHaveBeenCalledWith("d1", { userId: "u1" });
});
