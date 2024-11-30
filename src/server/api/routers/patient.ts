import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { z } from "zod";

export const patientRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const patients = await ctx.db.patient.findMany({
      take: 10,
      orderBy: { name: "asc" },
    });

    return patients.map((patient) => ({
      refId: patient.refId,
      name: patient.name,
      birthDate: patient.birthDate.toLocaleDateString("pt-br", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      }),
    }));
  }),
  create: publicProcedure
    .input(
      z.object({
        refId: z.string(),
        name: z.string(),
        birthDate: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const patient = await ctx.db.patient.create({
        data: {
          refId: input.refId,
          name: input.name,
          birthDate: new Date(input.birthDate),
        },
      });

      return {
        refId: patient.refId,
        name: patient.name,
        birthDate: patient.birthDate.toLocaleDateString("pt-br", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "UTC",
        }),
      };
    }),
  get: publicProcedure
    .input(
      z.object({
        refId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { refId: input.refId },
      });

      if (!patient) {
        throw new Error("Patient not found");
      }

      return {
        refId: patient.refId,
        name: patient.name,
        birthDate: patient.birthDate.toLocaleDateString("pt-br", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "UTC",
        }),
      };
    }),
});
