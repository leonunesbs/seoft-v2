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
  search: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const patients = await ctx.db.patient.findMany({
      where: {
        OR: [
          {
            name: {
              contains: input,
              mode: "insensitive",
            },
          },
          {
            refId: {
              contains: input,
              mode: "insensitive",
            },
          },
        ],
      },
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
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        refId: z.string(),
        name: z.string(),
        birthDate: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const patient = await ctx.db.patient.update({
        where: { id: input.id },
        data: {
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
});
