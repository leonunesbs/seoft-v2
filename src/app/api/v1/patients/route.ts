import { NextResponse, type NextRequest } from "next/server";
import { db } from "~/server/db";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const refId = searchParams.get("refId");

  if (!refId) {
    const patients = await db.patient.findMany({
      take: 10,
    });

    return NextResponse.json(
      patients.map((patient) => ({
        refId: patient.refId,
        name: patient.name,
        birthDate: patient.birthDate.toLocaleDateString("pt-br", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "UTC",
        }),
      })),
      { status: 200 },
    );
  }

  try {
    const patient = await db.patient.findFirst({
      where: { refId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        refId: patient.refId,
        name: patient.name,
        birthDate: patient.birthDate.toLocaleDateString("pt-br", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "UTC",
        }),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const refId = searchParams.get("refId");

  if (!refId) {
    return NextResponse.json({ error: "ID is required" }, { status: 405 });
  }

  const body = (await req.json()) as {
    name: string;
    birthDate: string;
  };

  if (!body) {
    return NextResponse.json({ error: "Body is required" }, { status: 405 });
  }

  if (!body.name || !body.birthDate) {
    return NextResponse.json({ error: "Invalid body" }, { status: 405 });
  }

  try {
    const patient = await db.patient.findFirst({
      where: { refId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    await db.patient.update({
      where: { refId },
      data: {
        name: body.name,
        birthDate: body.birthDate,
      },
    });

    return NextResponse.json(
      {
        refId: patient.refId,
        name: body.name,
        birthDate: new Date(body.birthDate).toLocaleDateString("pt-br", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "UTC",
        }),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    refId: string;
    name: string;
    birthDate: string;
  };

  if (!body) {
    return NextResponse.json({ error: "Body is required" }, { status: 405 });
  }

  if (!body.refId || !body.name || !body.birthDate) {
    return NextResponse.json({ error: "Invalid body" }, { status: 405 });
  }

  try {
    const patient = await db.patient.findFirst({
      where: { refId: body.refId },
    });

    if (patient) {
      return NextResponse.json(
        { error: "Patient already exists" },
        { status: 405 },
      );
    }

    const newPatient = await db.patient.create({
      data: {
        refId: body.refId,
        name: body.name,
        birthDate: body.birthDate,
      },
    });

    return NextResponse.json(
      {
        refId: newPatient.refId,
        name: newPatient.name,
        birthDate: newPatient.birthDate,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const refId = searchParams.get("refId");

  if (!refId) {
    return NextResponse.json({ error: "ID is required" }, { status: 405 });
  }

  try {
    const patient = await db.patient.findFirst({
      where: { refId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    await db.patient.delete({
      where: { refId },
    });

    return NextResponse.json(
      { refId: patient.refId, name: patient.name },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
