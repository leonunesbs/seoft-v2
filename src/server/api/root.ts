import { createCallerFactory, createTRPCRouter } from "../../server/api/trpc";

import { clinicRouter } from "./routers/clinic";
import { patientRouter } from "./routers/patient";
import { residentRouter } from "./routers/resident";
import { staffRouter } from "./routers/staff";
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
  utils: utilsRouter,
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
