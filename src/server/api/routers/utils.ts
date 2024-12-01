import { createTRPCRouter, publicProcedure } from "../trpc";

import { cookies } from "next/headers";
import { z } from "zod";

export const utilsRouter = createTRPCRouter({
  currentCollaborator: publicProcedure.query(async ({}) => {
    const cookieStore = await cookies();
    const collaboratorId =
      cookieStore.get("selected-collaborator")?.value ?? null;
    return { collaboratorId };
  }),
  selectCollaborator: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const cookieStore = await cookies();
      cookieStore.set("switcher:selected-collaborator", input, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      return { collaboratorId: input };
    }),
});
