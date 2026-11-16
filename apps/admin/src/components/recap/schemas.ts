import { z } from "zod";

/**
 * Mirrors `RecapWindowService.setRecapEdition`: `opensAt` must fall inside the
 * UTC edition year, otherwise the server answers 400.
 */
export const recapEditionFormSchema = z
  .object({
    year: z.number().int(),
    opensAt: z.date().nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.opensAt == null) {
      ctx.addIssue({
        code: "custom",
        path: ["opensAt"],
        message: "Opening date is required.",
      });
      return;
    }

    if (values.opensAt.getUTCFullYear() !== values.year) {
      ctx.addIssue({
        code: "custom",
        path: ["opensAt"],
        message: "Opening date must fall inside the edition year (UTC).",
      });
    }
  });

export type RecapEditionFormValues = z.infer<typeof recapEditionFormSchema>;

export interface RecapEditionRequest {
  year: number;
  body: { opensAt: string };
}

export function buildRecapEditionRequest(
  values: RecapEditionFormValues,
): RecapEditionRequest {
  if (values.opensAt == null) {
    throw new Error("Opening date is required.");
  }

  return {
    year: values.year,
    body: { opensAt: values.opensAt.toISOString() },
  };
}
