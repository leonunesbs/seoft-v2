import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
// Schema de validação para colaborador
const staffSchema = z.object({
  id: z.string().optional(), // Opcional para novos registros
  name: z
    .string()
    .min(1, { message: "O nome do colaborador é obrigatório." })
    .toUpperCase(),
  crm: z
    .string()
    .min(1, { message: "O CRM do colaborador é obrigatório." })
    .regex(/^\d+$/, { message: "O CRM deve conter apenas números." }),
  role: z.enum(
    ["I1", "I2", "I3", "I4", "R1", "R2", "R3", "F1", "F2", "F3", "STAFF"],
    {
      errorMap: () => ({ message: "O cargo selecionado é inválido." }),
    },
  ),
  clinics: z.array(z.string()).optional(), // IDs das clínicas associadas
});

// Função para validar os dados de entrada
async function validateBody(req: Request) {
  const body = (await req.json()) as z.infer<typeof staffSchema>;
  const result = staffSchema.safeParse(body);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

export const POST = auth(async function POST(req) {
  const validation = await validateBody(req);

  if (!validation.success || !validation.data) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 422, statusText: "Unprocessable Entity" },
    );
  }

  const { id, name, crm, role, clinics } = validation.data;

  const newStaff = await db.collaborator.create({
    data: {
      id,
      name,
      crm,
      role,
      clinics: {
        create: clinics?.map((clinicId) => ({
          clinic: { connect: { id: clinicId } },
        })),
      },
    },
  });

  return NextResponse.json(newStaff, { status: 201 });
});

export const GET = auth(async function GET(req) {
  const searchParams = new URL(req.url).searchParams;
  const id = searchParams.get("id");

  if (id) {
    const staff = await db.collaborator.findUnique({
      where: { id },
      include: { clinics: true },
    });

    if (!staff) {
      return NextResponse.json(
        { message: "Colaborador não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(staff, { status: 200 });
  }

  const staffs = await db.collaborator.findMany({
    select: { name: true, crm: true, role: true },
  });

  return NextResponse.json(staffs, { status: 200 });
});

export const PUT = auth(async function PUT(req) {
  const searchParams = new URL(req.url).searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      {},
      { status: 400, statusText: "Collaborator CRM is required" },
    );
  }

  const validation = await validateBody(req);

  if (!validation.success || !validation.data) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 422, statusText: "Unprocessable Entity" },
    );
  }

  const { name, crm: newCrm, role, clinics } = validation.data;

  const updatedStaff = await db.$transaction(async (tx) => {
    // Remove as associações antigas
    await tx.clinicCollaborator.deleteMany({
      where: { collaboratorId: id },
    });

    // Atualiza o colaborador e cria novas associações
    return tx.collaborator.update({
      where: { id },
      data: {
        name,
        crm: newCrm,
        role,
        clinics: {
          create: clinics?.map((clinicId) => ({
            clinic: { connect: { id: clinicId } },
          })),
        },
      },
    });
  });

  return NextResponse.json(updatedStaff, { status: 200 });
});

export const DELETE = auth(async function DELETE(req) {
  const searchParams = new URL(req.url).searchParams;
  const crm = searchParams.get("crm");

  if (!crm) {
    return NextResponse.json(
      {},
      { status: 400, statusText: "Collaborator CRM is required" },
    );
  }

  const staff = await db.collaborator.findUnique({
    where: { crm },
  });

  if (!staff) {
    return NextResponse.json(
      { message: "Colaborador não encontrado." },
      { status: 404 },
    );
  }

  await db.collaborator.delete({
    where: { crm },
  });

  return NextResponse.json(
    { message: "Colaborador excluído com sucesso." },
    { status: 200 },
  );
});
