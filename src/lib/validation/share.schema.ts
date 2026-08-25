import { z } from "zod";

export const createShareSchema = z
  .object({
    shareType: z.enum(["ONE_TIME", "TIME_BASED"]),
    accessType: z.enum(["PUBLIC", "PASSWORD"]),
    expiresAt: z.string().datetime().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.shareType === "TIME_BASED" && !data.expiresAt) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Expiry date/time is required for time-based links",
      });
    }

    if (data.expiresAt) {
      const expiryDate = new Date(data.expiresAt);

      if (expiryDate <= new Date()) {
        ctx.addIssue({
          code: "custom",
          path: ["expiresAt"],
          message: "Expiry date/time must be in the future",
        });
      }
    }
  });

  export const unlockSchema = z.object({
  accessKey: z.string().min(1, "Access key is required"),
});