import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { z } from "zod";

const clinicSchema = z.object({
  id: z.string().optional(), // Opcional para novos registros
  name: z.string().min(1, { message: "O nome do ambulatório é obrigatório." }),
  collaborators: z.array(z.string()).optional(), // IDs dos colaboradores associados
});

export const clinicRouter = createTRPCRouter({
  create: protectedProcedure
    .input(clinicSchema)
    .mutation(async ({ input, ctx }) => {
      const clinic = await ctx.db.clinic.create({
        data: {
          name: input.name,
          collaborators: {
            create: input.collaborators?.map((collaboratorId) => ({
              collaborator: { connect: { id: collaboratorId } },
            })),
          },
        },
        include: {
          collaborators: true,
        },
      });

      return {
        id: clinic.id,
        name: clinic.name,
        collaborators: clinic.collaborators.map(
          (collaborator) => collaborator.collaboratorId,
        ),
      };
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const clinics = await ctx.db.clinic.findMany({
      include: {
        collaborators: true,
      },
    });

    return clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      collaborators: clinic.collaborators.map(
        (collaborator) => collaborator.collaboratorId,
      ),
    }));
  }),
  get: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const clinic = await ctx.db.clinic.findUnique({
      where: { id: input },
      include: {
        collaborators: true,
      },
    });

    if (!clinic) {
      throw new Error("Staff not found");
    }

    return {
      id: clinic.id,
      name: clinic.name,
      collaborators: clinic.collaborators.map(
        (collaborator) => collaborator.collaboratorId,
      ),
    };
  }),
  search: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const clinics = await ctx.db.clinic.findMany({
      where: {
        OR: [{ name: { contains: input, mode: "insensitive" } }],
      },
      include: {
        collaborators: true,
      },
    });

    return clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      collaborators: clinic.collaborators.map(
        (collaborator) => collaborator.collaboratorId,
      ),
    }));
  }),
  update: protectedProcedure
    .input(clinicSchema)
    .mutation(async ({ input, ctx }) => {
      const clinic = await ctx.db.$transaction(async (tx) => {
        await tx.clinicCollaborator.deleteMany({
          where: { clinicId: input.id },
        });

        return tx.clinic.update({
          where: { id: input.id },
          data: {
            name: input.name,
            collaborators: {
              create: input.collaborators?.map((collaboratorId) => ({
                collaborator: { connect: { id: collaboratorId } },
              })),
            },
          },
        });
      });

      return {
        id: clinic.id,
        name: clinic.name,
      };
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const clinic = await ctx.db.clinic.delete({
        where: { id: input },
      });

      return {
        id: clinic.id,
        name: clinic.name,
      };
    }),
});
