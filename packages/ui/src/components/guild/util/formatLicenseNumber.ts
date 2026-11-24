/**
 * Guild License numbers are displayed as `Nº` plus four zero-padded digits,
 * e.g. `Nº 0047`. The number itself is not localized by design.
 */
export function formatLicenseNumber(licenseNumber: number): string {
  const value = Number.isFinite(licenseNumber)
    ? Math.max(0, Math.trunc(licenseNumber))
    : 0;

  return `Nº ${String(value).padStart(4, "0")}`;
}
