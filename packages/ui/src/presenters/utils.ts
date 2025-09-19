import { PresenterRegistry } from "#@/presenters/UIProvider.tsx";

/**
 * Build a PresenterRegistry incrementally. You can pass only the keys you override.
 * Returned object is frozen to keep identity stable and prevent accidental mutation.
 */
export function buildPresenterRegistry(
  overrides: Partial<PresenterRegistry>,
): Partial<PresenterRegistry> {
  return Object.freeze({ ...overrides });
}
