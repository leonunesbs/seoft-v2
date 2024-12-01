import { createCallerFactory, createTRPCRouter } from "../../server/api/trpc";

import { clinicRouter } from "./routers/clinic";
import { evaluationRouter } from "./routers/evaluation";
import { patientRouter } from "./routers/patient";
import { residentRouter } from "./routers/resident";
import { staffRouter } from "./routers/staff";
import { userRouter } from "./routers/users";
import { utilsRouter } from "./routers/utils";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  staff: staffRouter,
  patient: patientRouter,
  clinic: clinicRouter,
  resident: residentRouter,
  evaluation: evaluationRouter,
  utils: utilsRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
