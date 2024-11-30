import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const userSchema = z.object({
  id: z.string().min(1, "O ID do usuário é obrigatório."),
  name: z.string().optional(),
  email: z.string().email("Insira um e-mail válido."),
  isStaff: z.boolean(),
});

async function validateBody(req: NextRequest) {
  const body = (await req.json()) as z.infer<typeof userSchema>;
  const result = userSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

export const PATCH = auth(async function PATCH(req) {
  const searchParams = new URL(req.url).searchParams;
  const id = searchParams.get("id");

  const validation = await validateBody(req);
  if (!validation.success || !validation.data) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 400, statusText: "Validation error" },
    );
  }
  const { email } = validation.data;

  if (!email) {
    return NextResponse.json({ error: "Invalid body" }, { status: 405 });
  }

  if (!id) {
    return NextResponse.json(
      { error: "Missing ID" },
      { status: 405, statusText: "Missing ID" },
    );
  }

  try {
    const user = await db.user.findFirst({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        isStaff: true,
      },
    });

    return NextResponse.json(
      {
        email: updatedUser.email,
        isStaff: updatedUser.isStaff,
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
});

export const DELETE = auth(async function DELETE(req) {
  const searchParams = new URL(req.url).searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 405 });
  }

  try {
    const user = await db.user.findFirst({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        email: user.email,
        isStaff: user.isStaff,
      },
      { status: 204 },
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
});
