import { type PrismaClient } from "@prisma/client";
import { beforeEach, vi } from "vitest";
import { type DeepMockProxy, mockDeep, mockReset } from "vitest-mock-extended";
import { db } from "./db";

vi.mock("./db", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(dbMock);
});

export const dbMock = db as unknown as DeepMockProxy<PrismaClient>;
