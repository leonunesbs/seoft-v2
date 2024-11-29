import { describe, expect, it } from "vitest";

describe("Test patient API", async () => {
  const response: {
    status: number;
    json: () => Promise<{
      name: string;
    }>;
  } = await fetch("http://localhost:3000/api/v1/patient");

  it("response should return 200", async () => {
    expect(response.status).toEqual(200);
  });

  const data = await response.json();

  it("response name", () => {
    expect(data.name).toEqual("patient");
  });
});
