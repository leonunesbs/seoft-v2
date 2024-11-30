import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { z } from "zod";

export const staffRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});
