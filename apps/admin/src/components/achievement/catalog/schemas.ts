import { z } from "zod";

export const tierSchema = z.object({
  threshold: z.number().int().min(1),
  expReward: z.number().int().min(0).max(5000),
});

export const tiersSchema = z
  .array(tierSchema)
  .min(1)
  .max(10)
  .refine(
    (tiers) =>
      tiers.every((t, i) => i === 0 || t.threshold > tiers[i - 1].threshold),
    { message: "Thresholds must be strictly increasing" },
  );

const iconSchema = z.object({
  kind: z.enum(["glyph", "game_cover", "image"]),
  name: z.string().optional(),
  gameId: z.number().optional(),
});

export const definitionFormSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes"),
  name: z.string().min(1),
  description: z.string().min(1),
  metric: z.string().min(1),
  criteria: z.record(z.string(), z.any()),
  startsAt: z.date().nullable(),
  endsAt: z.date().nullable(),
  eventId: z.string().nullable(),
  icon: iconSchema,
  isHidden: z.boolean(),
  tiers: tiersSchema,
});

export type DefinitionFormValues = z.infer<typeof definitionFormSchema>;

export const eventFormSchema = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes"),
    name: z.string().min(1),
    description: z.string().min(1),
    startsAt: z.date(),
    endsAt: z.date(),
  })
  .refine((v) => v.endsAt > v.startsAt, {
    message: "End must be after start",
    path: ["endsAt"],
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;
