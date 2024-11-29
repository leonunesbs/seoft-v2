import { describe, expect, it } from "vitest";

describe("Test status API", async () => {
  const response: {
    status: number;
    json: () => Promise<{
      updatedAt: string;
      dependencies: {
        database: {
          version: string;
          maxConnections: number;
          openedConnections: number;
        };
      };
    }>;
  } = await fetch("http://localhost:3000/api/status");

  it("should return 200", () => {
    expect(response.status).toEqual(200);
  });

  const data = await response.json();

  it("should validate database dependencies", () => {
    expect(data.updatedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    expect(data.dependencies.database.version).toEqual("16.0");
    expect(data.dependencies.database.maxConnections).toBeGreaterThan(0);
    expect(data.dependencies.database.openedConnections).toBeGreaterThanOrEqual(
      0,
    );
  });
});
