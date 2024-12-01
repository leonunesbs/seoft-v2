import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { z } from "zod";

const staffSchema = z.object({
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

export const staffRouter = createTRPCRouter({
  create: protectedProcedure
    .input(staffSchema)
    .mutation(async ({ input, ctx }) => {
      const staff = await ctx.db.collaborator.create({
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
        id: staff.id,
        name: staff.name,
        crm: staff.crm,
        role: staff.role,
      };
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const staff = await ctx.db.collaborator.findMany({
      include: {
        clinics: true,
      },
      where: {
        role: "STAFF",
      },
    });

    return staff.map((staff) => ({
      id: staff.id,
      name: staff.name,
      crm: staff.crm,
      role: staff.role,
      clinics: staff.clinics.map((clinic) => clinic.clinicId),
    }));
  }),
  get: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const staff = await ctx.db.collaborator.findUnique({
      where: { id: input },
      include: {
        clinics: true,
      },
    });

    if (!staff) {
      throw new Error("Staff not found");
    }

    return {
      id: staff.id,
      name: staff.name,
      crm: staff.crm,
      role: staff.role,
    };
  }),
  search: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const staff = await ctx.db.collaborator.findMany({
      where: {
        OR: [
          { name: { contains: input, mode: "insensitive" } },
          { crm: { contains: input, mode: "insensitive" } },
        ],
      },
    });

    return staff.map((staff) => ({
      id: staff.id,
      name: staff.name,
      crm: staff.crm,
      role: staff.role,
    }));
  }),
  update: protectedProcedure
    .input(staffSchema)
    .mutation(async ({ input, ctx }) => {
      const staff = await ctx.db.$transaction(async (tx) => {
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
        id: staff.id,
        name: staff.name,
        crm: staff.crm,
        role: staff.role,
      };
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const staff = await ctx.db.collaborator.delete({
        where: { id: input },
      });

      return {
        id: staff.id,
        name: staff.name,
        crm: staff.crm,
        role: staff.role,
      };
    }),
});
