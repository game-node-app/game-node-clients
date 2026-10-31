// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ComponentProps, PropsWithChildren } from "react";
import { afterEach, expect, it, vi } from "vitest";
import ReportHandleConfirmModal from "../../../../admin/src/components/report/modal/ReportHandleConfirmModal";

const handleReport = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock("@repo/wrapper/server", async () => ({
  ...(await vi.importActual<typeof import("@repo/wrapper/server")>(
    "@repo/wrapper/server",
  )),
  ReportService: { reportControllerHandleV1: handleReport },
}));
vi.mock("@repo/ui", () => ({ useReports: () => ({ invalidate: vi.fn() }) }));
vi.mock("@mantine/notifications", () => ({ notifications: { show: vi.fn() } }));
vi.mock("@tanstack/react-query", () => ({
  useMutation: (options: { mutationFn: () => Promise<void> }) => ({
    mutate: options.mutationFn,
    isPending: false,
  }),
}));
vi.mock("@mantine/core", () => {
  function Box({ children }: PropsWithChildren) {
    return <div>{children}</div>;
  }
  return {
    Stack: Box,
    Text: Box,
    Group: Box,
    Modal: Object.assign(Box, { Body: Box }),
    Button: ({ children, onClick, disabled }: ComponentProps<"button">) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
    Checkbox: ({
      label,
      ...props
    }: ComponentProps<"input"> & { label: string }) => (
      <label>
        {label}
        <input type="checkbox" {...props} />
      </label>
    ),
    Select: ({
      data,
      onChange,
    }: {
      data: { value: string; label: string }[];
      onChange: (value: string) => void;
    }) => (
      <select
        aria-label="Action"
        onChange={(event) => onChange(event.target.value)}
      >
        {data.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    ),
  };
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("never deletes reported content when discarding and resets deletion when the action changes", async () => {
  render(<ReportHandleConfirmModal opened onClose={vi.fn()} reportId={42} />);
  const checkbox = screen.getByRole("checkbox", {
    name: "Remove reported content",
  }) as HTMLInputElement;
  expect(checkbox.checked).toBe(true);
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "discard" },
  });
  expect(checkbox.checked).toBe(false);
  expect(checkbox.disabled).toBe(true);
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "alert" },
  });
  expect(checkbox.checked).toBe(true);
  expect(checkbox.disabled).toBe(false);
  fireEvent.click(checkbox);
  expect(checkbox.checked).toBe(false);
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "suspend" },
  });
  expect(checkbox.checked).toBe(true);
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "discard" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  await waitFor(() =>
    expect(handleReport).toHaveBeenCalledWith(42, {
      action: "discard",
      deleteReportedContent: false,
    }),
  );
});
