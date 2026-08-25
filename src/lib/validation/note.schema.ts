import z from "zod"

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),

  content: z
    .string()
    .trim()
    .min(1, "Content is required"),
});