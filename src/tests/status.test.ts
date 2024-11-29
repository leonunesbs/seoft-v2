import { describe, expect, it } from "vitest";

import { db } from "../server/db";

describe("Tests database connection", () => {
  it("should return the correct database name", async () => {
    const results: {
      current_database: string;
    }[] = await db.$queryRaw`SELECT current_database()`;
    const dbName = results[0]?.current_database;

    expect(dbName).toBe("postgres");
  });
  it("should return max connections", async () => {
    const result: {
      max_connections: string;
    }[] = await db.$queryRaw`SHOW max_connections`;
    if (result && result.length > 0 && result[0]?.max_connections) {
      const maxConnections = parseInt(result[0].max_connections, 10);
      expect(maxConnections).toBeGreaterThan(0);
    } else {
      throw new Error("Failed to retrieve max_connections");
    }
  });
  it("should return current connections", async () => {
    const result: {
      current_connections: string;
    }[] =
      await db.$queryRaw`SELECT COUNT(*) AS current_connections FROM pg_stat_activity`;
    if (result && result.length > 0 && result[0]?.current_connections) {
      const currentConnections = parseInt(result[0].current_connections, 10);
      expect(currentConnections).toBeGreaterThan(0);
    } else {
      throw new Error("Failed to retrieve current_connections");
    }
  });
  it("should return the correct database version", async () => {
    const result: {
      server_version: string;
    }[] = await db.$queryRaw`SHOW server_version`;
    console.log(result);
    if (result && result.length > 0 && result[0]?.server_version) {
      const dbVersion = result[0].server_version.split(" ")[0];
      expect(dbVersion).toBe("16.0");
    } else {
      throw new Error("Failed to retrieve database version");
    }
  });
});
