import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { z } from "zod";

const residentSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, { message: "O nome do colaborador é obrigatório." })
    .toUpperCase(),
  crm: z
    .string()
    .min(1, { message: "O CRM do colaborador é obrigatório." })
    .regex(/^\d+$/, { message: "O CRM deve conter apenas números." }),
  role: z.enum(
    ["I1", "I2", "I3", "I4", "R1", "R2", "R3", "F1", "F2", "F3", "STAFF"],
    {
      errorMap: () => ({ message: "O cargo selecionado é inválido." }),
    },
  ),
  clinics: z.array(z.string()).optional(),
});

export const residentRouter = createTRPCRouter({
  create: publicProcedure
    .input(residentSchema)
    .mutation(async ({ input, ctx }) => {
      const resident = await ctx.db.collaborator.create({
        data: {
          name: input.name,
          crm: input.crm,
          role: input.role,
          clinics: {
            create: input.clinics?.map((clinicId) => ({
              clinic: { connect: { id: clinicId } },
            })),
          },
        },
        include: {
          clinics: true,
        },
      });

      return {
        id: resident.id,
        name: resident.name,
        crm: resident.crm,
        role: resident.role,
      };
    }),
  list: publicProcedure.query(async ({ ctx }) => {
    const residents = await ctx.db.collaborator.findMany({
      include: {
        clinics: true,
      },
      where: {
        role: {
          in: ["R1", "R2", "R3", "F1", "F2", "F3"],
        },
      },
    });

    return residents.map((resident) => ({
      id: resident.id,
      name: resident.name,
      crm: resident.crm,
      role: resident.role,
      clinics: resident.clinics.map((clinic) => clinic.clinicId),
    }));
  }),
  get: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const resident = await ctx.db.collaborator.findUnique({
      where: { id: input },
      include: {
        clinics: true,
      },
    });

    if (!resident) {
      throw new Error("Staff not found");
    }

    return {
      id: resident.id,
      name: resident.name,
      crm: resident.crm,
      role: resident.role,
    };
  }),
  search: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const resident = await ctx.db.collaborator.findMany({
      where: {
        OR: [
          { name: { contains: input, mode: "insensitive" } },
          { crm: { contains: input, mode: "insensitive" } },
        ],
      },
    });

    return resident.map((resident) => ({
      id: resident.id,
      name: resident.name,
      crm: resident.crm,
      role: resident.role,
    }));
  }),
  update: publicProcedure
    .input(residentSchema)
    .mutation(async ({ input, ctx }) => {
      const resident = await ctx.db.$transaction(async (tx) => {
        await tx.clinicCollaborator.deleteMany({
          where: { collaboratorId: input.id },
        });

        return tx.collaborator.update({
          where: { id: input.id },
          data: {
            name: input.name,
            crm: input.crm,
            role: input.role,
            clinics: {
              create: input.clinics?.map((clinicId) => ({
                clinic: { connect: { id: clinicId } },
              })),
            },
          },
        });
      });

      return {
        id: resident.id,
        name: resident.name,
        crm: resident.crm,
        role: resident.role,
      };
    }),
  delete: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const resident = await ctx.db.collaborator.delete({
      where: { id: input },
    });

    return {
      id: resident.id,
      name: resident.name,
      crm: resident.crm,
      role: resident.role,
    };
  }),
});
