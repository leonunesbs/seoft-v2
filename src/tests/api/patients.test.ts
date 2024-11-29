import { describe, expect, it } from "vitest";

describe("Test patients API", async () => {
  const response: {
    status: number;
    json: () => Promise<{
      name: string;
    }>;
  } = await fetch("http://localhost:3000/api/v1/patients");

  it("response should return 200", async () => {
    expect(response.status).toEqual(200);
  });
});
