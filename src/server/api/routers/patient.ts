import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const patientRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const patients = await ctx.db.patient.findMany({
        take: 10,
        orderBy: { name: "asc" },
      });

      return patients.map((patient) => ({
        refId: patient.refId,
        name: patient.name,
        birthDate: new Date(patient.birthDate).toISOString(),
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar pacientes. Tente novamente mais tarde.",
        cause: error,
      });
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        refId: z.string(),
        name: z.string(),
        birthDate: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const existingPatient = await ctx.db.patient.findUnique({
          where: { refId: input.refId },
        });

        if (existingPatient) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Paciente já existe com este número de prontuário.",
          });
        }

        const newPatient = await ctx.db.patient.create({
          data: {
            refId: input.refId,
            name: input.name,
            birthDate: new Date(input.birthDate).toISOString(),
          },
        });

        return {
          refId: newPatient.refId,
          name: newPatient.name,
          birthDate: newPatient.birthDate.toISOString(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao criar paciente. Verifique os dados e tente novamente.",
          cause: error,
        });
      }
    }),

  get: protectedProcedure
    .input(
      z.object({
        refId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const patient = await ctx.db.patient.findUnique({
          where: { refId: input.refId },
        });

        if (!patient) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Paciente não encontrado.",
          });
        }

        return {
          refId: patient.refId,
          name: patient.name,
          birthDate: patient.birthDate.toISOString(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao buscar paciente. Verifique os dados e tente novamente.",
          cause: error,
        });
      }
    }),

  search: protectedProcedure
    .input(z.string().optional())
    .query(async ({ input, ctx }) => {
      try {
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
          id: patient.id,
          refId: patient.refId,
          name: patient.name,
          birthDate: patient.birthDate.toISOString(),
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar pacientes. Tente novamente mais tarde.",
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        refId: z.string(),
        name: z.string(),
        birthDate: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
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
          birthDate: patient.birthDate.toISOString(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar paciente. Tente novamente mais tarde.",
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const patient = await ctx.db.patient.delete({
          where: { id: input },
        });

        return {
          refId: patient.refId,
          name: patient.name,
          birthDate: patient.birthDate.toISOString(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro ao excluir paciente. Verifique os dados e tente novamente.",
          cause: error,
        });
      }
    }),

  getEvaluationHistory: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.patient.findUnique({
        where: { id: input },
        include: {
          evaluations: {
            where: { done: true },
            orderBy: { createdAt: "desc" },
            include: {
              eyes: {
                include: {
                  leftEye: {
                    include: {
                      refraction: { orderBy: { recordedAt: "desc" } },
                      surgeries: { orderBy: { date: "desc" } },
                      logs: true,
                    },
                  },
                  rightEye: {
                    include: {
                      refraction: { orderBy: { recordedAt: "desc" } },
                      surgeries: { orderBy: { date: "desc" } },
                      logs: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),
});
