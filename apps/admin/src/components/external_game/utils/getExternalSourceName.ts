import { EGameExternalGameCategory } from "@/components/external_game/constants";

export function getExternalSourceName(category: number) {
  const key = EGameExternalGameCategory[category as never];
  if (!key) return "Unknown Store";

  // Convert PascalCase / camelCase to a human-readable string
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase boundaries
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // Handle ALLCAPS followed by CamelCase
    .replace(/\bUs\b/, "US") // Capitalize 'US'
    .trim();
}
