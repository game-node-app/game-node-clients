import { ZodObject } from "zod";
import { UseFormReset } from "react-hook-form";

/**
 * Syncs an entity to a form. Especially useful for 'updating' forms.
 * Entity is usually the database value.
 * @param entity
 * @param schema
 * @param reset
 */
export function syncEntityToZodForm<S extends ZodObject>(
  entity: unknown | undefined,
  schema: S,
  reset: UseFormReset<ReturnType<S["parse"]>>,
) {
  if (entity == undefined) return;
  // Cleans/shapes with partial().parse() so
  // missing keys are allowed, and extra fields are ignored
  const cleaned = schema.partial().parse(entity);

  reset(cleaned as never);
}
