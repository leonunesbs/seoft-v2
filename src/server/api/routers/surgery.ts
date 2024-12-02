import { createTRPCRouter, protectedProcedure } from "../trpc";

import { z } from "zod";

const surgerySchema = z.object({
  eyeId: z.string(),
  procedure: z.string(),
  date: z.string(),
  notes: z.string().optional(),
});

export const surgeryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(surgerySchema)
    .mutation(async ({ input, ctx }) => {
      const surgery = await ctx.db.eyeSurgery.create({
        data: {
          eyeId: input.eyeId,
          procedure: input.procedure,
          date: new Date(input.date),
          notes: input.notes,
        },
      });

      return surgery;
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const surgery = await ctx.db.eyeSurgery.delete({
        where: { id: input },
      });

      return surgery;
    }),
});
