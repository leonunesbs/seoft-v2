import { describe, expect, it } from "vitest";

import { type Patient } from "@prisma/client";

describe("Test patient POST API", async () => {
  it("should return 200 if POST with valid body", async () => {
    const response: {
      status: number;
      json: () => Promise<Patient>;
    } = await fetch("http://localhost:3000/api/v1/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refId: "555012337",
        name: "john doe",
        birthDate: new Date("1998-02-12").toISOString(),
      }),
    });

    expect(response.status).toEqual(200);

    const data = await response.json();

    expect(data.refId).toEqual("555012337");
    expect(data.name).toEqual("JOHN DOE");
    expect(data.birthDate).toEqual(new Date("1998-02-12").toISOString());
  });

  it("should return 200 if GET to search patient", async () => {
    const response: {
      status: number;
      json: () => Promise<Patient>;
    } = await fetch("http://localhost:3000/api/v1/patients?refId=555012337");

    expect(response.status).toEqual(200);

    const data = await response.json();

    expect(data.refId).toEqual("555012337");
    expect(data.name).toEqual("JOHN DOE");
    expect(data.birthDate).toEqual("12/02/1998");
  });
});

describe("Test patient GET API", async () => {
  it("should return 200 and list of patients if GET with no search params", async () => {
    const response: {
      status: number;
      json: () => Promise<Patient[]>;
    } = await fetch("http://localhost:3000/api/v1/patients");

    expect(response.status).toEqual(200);
    const data = await response.json();
    expect(data.length).toBeGreaterThanOrEqual(0);

    const patient = data.find((p) => p.refId === "555012337");
    expect(patient).toBeDefined();
    expect(patient?.name).toEqual("JOHN DOE");
  });

  it("should return 200 when search by refId", async () => {
    const response: {
      status: number;
      json: () => Promise<Patient>;
    } = await fetch("http://localhost:3000/api/v1/patients?refId=555012337");
    expect(response.status).toEqual(200);
    const data = await response.json();
    expect(data.refId).toEqual("555012337");
    expect(data.name).toEqual("JOHN DOE");
  });
});

describe("Test patient PATCH API", async () => {
  it("should return 405 if PATCH with no refId", async () => {
    const response: {
      status: number;
      json: () => Promise<{
        name: string;
        birthDate: string;
      }>;
    } = await fetch("http://localhost:3000/api/v1/patients", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toEqual(400);
  });

  it("should return 404 if PATCH with invalid refId", async () => {
    const response: {
      status: number;
      json: () => Promise<{
        name: string;
      }>;
    } = await fetch("http://localhost:3000/api/v1/patients?refId=123456", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "john doe",
        birthDate: new Date("1998-02-12").toISOString(),
      }),
    });

    expect(response.status).toEqual(404);
  });

  it("should return 200 if PATCH with valid refId", async () => {
    const response: {
      status: number;
      json: () => Promise<Patient>;
    } = await fetch("http://localhost:3000/api/v1/patients?refId=555012337", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "LEONARDO NUNES",
        birthDate: new Date("1998-02-12").toISOString(),
      }),
    });

    expect(response.status).toEqual(200);

    const data = await response.json();

    expect(data.refId).toEqual("555012337");
    expect(data.name).toEqual("LEONARDO NUNES");
    expect(data.birthDate).toEqual("12/02/1998");
  });
});

describe("Test patient DELETE API", async () => {
  it("should return 405 if DELETE with no search params", async () => {
    const response: {
      status: number;
      json: () => Promise<{
        name: string;
      }>;
    } = await fetch("http://localhost:3000/api/v1/patients", {
      method: "DELETE",
    });

    expect(response.status).toEqual(405);
  });

  it("should return 404 if DELETE with invalid refId", async () => {
    const response: {
      status: number;
      json: () => Promise<{
        name: string;
      }>;
    } = await fetch("http://localhost:3000/api/v1/patients?refId=123456", {
      method: "DELETE",
    });

    expect(response.status).toEqual(404);
  });

  it("should return 200 if DELETE with valid refId", async () => {
    const response: {
      status: number;
      json: () => Promise<Patient>;
    } = await fetch("http://localhost:3000/api/v1/patients?refId=555012337", {
      method: "DELETE",
    });

    expect(response.status).toEqual(200);

    const data = await response.json();

    expect(data.refId).toEqual("555012337");
    expect(data.name).toEqual("LEONARDO NUNES");
  });

  it("should return 404 if DELETE with already deleted refId", async () => {
    const response: {
      status: number;
      json: () => Promise<{
        name: string;
      }>;
    } = await fetch("http://localhost:3000/api/v1/patients?refId=555012337", {
      method: "DELETE",
    });

    expect(response.status).toEqual(404);
  });
});
