import { createTRPCRouter, protectedProcedure } from "../trpc";

import { z } from "zod";
import { db } from "~/server/db";

const refractionSchema = z.object({
  leftEyeId: z.string({
    message: "O ID do olho esquerdo é obrigatório e deve ser um ID válido.",
  }),
  rightEyeId: z.string({
    message: "O ID do olho direito é obrigatório e deve ser um ID válido.",
  }),
  leftEyeData: z
    .object({
      spherical: z.number().nullable().optional(),
      cylinder: z.number().nullable().optional(),
      axis: z.number().min(0).max(180).nullable().optional(),
      visualAcuity: z.string(),
    })
    .optional(),
  rightEyeData: z
    .object({
      spherical: z.number().nullable().optional(),
      cylinder: z.number().nullable().optional(),
      axis: z.number().min(0).max(180).nullable().optional(),
      visualAcuity: z.string(),
    })
    .optional(),
});

export const refractionRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        leftEyeId: z.string({
          message:
            "O ID do olho esquerdo é obrigatório e deve ser um ID válido.",
        }),
        rightEyeId: z.string({
          message:
            "O ID do olho direito é obrigatório e deve ser um ID válido.",
        }),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [leftEyeRefractions, rightEyeRefractions] = await db.$transaction([
        ctx.db.refraction.findMany({
          where: { eyeId: input.leftEyeId },
          orderBy: { recordedAt: "desc" },
        }),
        ctx.db.refraction.findMany({
          where: { eyeId: input.rightEyeId },
          orderBy: { recordedAt: "desc" },
        }),
      ]);
      return {
        leftEye: leftEyeRefractions,
        rightEye: rightEyeRefractions,
      };
    }),

  create: protectedProcedure
    .input(refractionSchema)
    .mutation(async ({ input, ctx }) => {
      const refractions = await ctx.db.$transaction(async (tx) => {
        const results = [];

        if (input.leftEyeData) {
          const leftEyeRefraction = await tx.refraction.create({
            data: {
              eyeId: input.leftEyeId,
              ...input.leftEyeData,
            },
          });
          results.push({ eye: "OS", refraction: leftEyeRefraction });
        }

        if (input.rightEyeData) {
          const rightEyeRefraction = await tx.refraction.create({
            data: {
              eyeId: input.rightEyeId,
              ...input.rightEyeData,
            },
          });
          results.push({ eye: "OD", refraction: rightEyeRefraction });
        }

        return results;
      });

      return refractions;
    }),
  update: protectedProcedure
    .input(refractionSchema)
    .mutation(async ({ input, ctx }) => {
      const refractions = await ctx.db.$transaction(async (tx) => {
        const results = [];

        if (input.leftEyeData) {
          const existingLeftRefraction = await tx.refraction.findFirst({
            where: { eyeId: input.leftEyeId },
            orderBy: { recordedAt: "desc" },
          });

          const updatedLeftEyeRefraction = existingLeftRefraction
            ? await tx.refraction.update({
                where: { id: existingLeftRefraction.id },
                data: input.leftEyeData,
              })
            : await tx.refraction.create({
                data: {
                  eyeId: input.leftEyeId,
                  ...input.leftEyeData,
                },
              });
          results.push({ eye: "OS", refraction: updatedLeftEyeRefraction });
        }

        if (input.rightEyeData) {
          const existingRightRefraction = await tx.refraction.findFirst({
            where: { eyeId: input.rightEyeId },
            orderBy: { recordedAt: "desc" },
          });

          const updatedRightEyeRefraction = existingRightRefraction
            ? await tx.refraction.update({
                where: { id: existingRightRefraction.id },
                data: input.rightEyeData,
              })
            : await tx.refraction.create({
                data: {
                  eyeId: input.rightEyeId,
                  ...input.rightEyeData,
                },
              });
          results.push({ eye: "OD", refraction: updatedRightEyeRefraction });
        }

        return results;
      });

      return refractions;
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.refraction.delete({
        where: { id: input },
      });
    }),
});
