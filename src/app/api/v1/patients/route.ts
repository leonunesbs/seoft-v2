import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// Schema de validação para paciente
const patientSchema = z.object({
  refId: z
    .string()
    .min(1, { message: "O ID do paciente não pode ser vazio." })
    .regex(/^\d+$/, { message: "O ID do paciente deve ser um número natural." })
    .transform((val) => val.replace(/^0+/, "")),
  name: z
    .string()
    .min(1, { message: "O nome do paciente é obrigatório." })
    .transform((val) => val.toUpperCase()),
  // o valor birthDate deve ser convertido para uma data e verificado se o valor original é o mesmo que a data em iso string
  birthDate: z.string().refine((val) => new Date(val).toISOString() === val, {
    message: "A data de nascimento deve ser uma data válida.",
  }),
});

async function validateBody(req: NextRequest) {
  const body = (await req.json()) as z.infer<typeof patientSchema>;

  const result = patientSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

export const GET = auth(async function GET(req) {
  // if (!req.auth)
  //   return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const searchParams = new URL(req.url).searchParams;
  const refId = searchParams.get("refId");

  if (!refId) {
    const patients = await db.patient.findMany({
      take: 10,
      orderBy: { name: "asc" },
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
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500, statusText: "Internal Server Error" },
    );
  }
});

export async function PUT(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const refId = searchParams.get("refId");

  if (!refId) {
    return NextResponse.json({}, { status: 400, statusText: "ID is required" });
  }

  const body = (await req.json()) as {
    name: string;
    birthDate: string;
  };

  if (!body?.name || !body.birthDate) {
    return NextResponse.json({}, { status: 405, statusText: "Invalid body" });
  }

  try {
    const patient = await db.patient.findFirst({
      where: { refId },
    });

    if (!patient) {
      return NextResponse.json(
        {},
        {
          status: 404,
          statusText: "Patient not found",
        },
      );
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
  const validation = await validateBody(req);
  if (!validation.success || !validation.data) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 400, statusText: "Validation error" },
    );
  }
  const { refId, name, birthDate } = validation.data;

  if (!refId || !name || !birthDate) {
    return NextResponse.json({ error: "Invalid body" }, { status: 405 });
  }

  try {
    const patient = await db.patient.findFirst({
      where: { refId },
    });

    if (patient) {
      return NextResponse.json(
        { error: "Patient already exists" },
        { status: 405 },
      );
    }

    const newPatient = await db.patient.create({
      data: {
        refId,
        name,
        birthDate,
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
