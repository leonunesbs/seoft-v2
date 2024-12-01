import { createTRPCRouter, protectedProcedure } from "../trpc";

import { z } from "zod";

const userSchema = z.object({
  id: z.string().min(1, "O ID do usuário é obrigatório."),
  name: z.string().optional(),
  email: z.string().email("Insira um e-mail válido."),
  isStaff: z.boolean(),
});

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(userSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
          isStaff: input.isStaff,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isStaff: user.isStaff,
      };
    }),
});
