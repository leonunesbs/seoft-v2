import { describe, expect, it } from "vitest";

import { type Collaborator } from "@prisma/client";

const defaultId = "4f20d09f-1934-4053-b293-498a491c5f67";

describe("Test staffs POST API", async () => {
  it("should return 200 if POST with valid body", async () => {
    const response: {
      status: number;
      json: () => Promise<Collaborator>;
    } = await fetch("http://localhost:3000/api/v1/staffs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: defaultId,
        name: "john doe",
        crm: "123456",
        role: "STAFF",
      }),
    });

    expect(response.status).toEqual(201);

    const body = await response.json();

    expect(body.id).toEqual(defaultId);
    expect(body.name).toEqual("JOHN DOE");
    expect(body.crm).toEqual("123456");
    expect(body.role).toEqual("STAFF");
  });
});

describe("Test staffs GET API", async () => {
  it("should return 200 if GET with valid id", async () => {
    const response: {
      status: number;
      json: () => Promise<Collaborator>;
    } = await fetch(`http://localhost:3000/api/v1/staffs?id=${defaultId}`);

    expect(response.status).toEqual(200);

    const body = await response.json();

    expect(body.name).toEqual("JOHN DOE");
    expect(body.crm).toEqual("123456");
    expect(body.role).toEqual("STAFF");
  });

  it("should return 200 and an array of staffs if GET without id", async () => {
    const response: {
      status: number;
      json: () => Promise<Collaborator[]>;
    } = await fetch("http://localhost:3000/api/v1/staffs");

    expect(response.status).toEqual(200);

    const body = await response.json();

    expect(body).toEqual([
      {
        name: "JOHN DOE",
        crm: "123456",
        role: "STAFF",
      },
    ]);

    expect(body.every((staff) => staff.role === "STAFF")).toBeTruthy();
  });
});

describe("Test staffs PUT API", async () => {
  it("should return 200 if PUT with valid id and body", async () => {
    const response: {
      status: number;
      json: () => Promise<Collaborator>;
    } = await fetch(`http://localhost:3000/api/v1/staffs?id=${defaultId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "jane doe",
        crm: "654321",
        role: "STAFF",
      }),
    });

    expect(response.status).toEqual(200);

    const body = await response.json();

    expect(body.name).toEqual("JANE DOE");
    expect(body.crm).toEqual("654321");
    expect(body.role).toEqual("STAFF");
  });
});

describe("Test staffs DELETE API", async () => {
  it("should return 204 if DELETE with valid id", async () => {
    const response: {
      status: number;
    } = await fetch("http://localhost:3000/api/v1/staffs?crm=654321", {
      method: "DELETE",
    });

    expect(response.status).toEqual(200);
  });
});
