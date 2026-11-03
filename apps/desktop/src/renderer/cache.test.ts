import { it, expect } from "vitest";
import { accountStorage } from "./cache";
it("prevents queued persistence writes after sign-out or an account switch", () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  } as unknown as Storage;
  const account = accountStorage(storage, "alice");
  storage.setItem("gamenode-identity", JSON.stringify({ userId: "alice" }));
  account.setItem("cache:alice", "games");
  expect(account.getItem("cache:alice")).toBe("games");
  account.removeItem("cache:alice");
  storage.removeItem("gamenode-identity");
  account.setItem("cache:alice", "late write");
  expect(account.getItem("cache:alice")).toBeNull();
  storage.setItem("gamenode-identity", JSON.stringify({ userId: "bob" }));
  account.setItem("cache:alice", "wrong account");
  expect(account.getItem("cache:alice")).toBeNull();
});
