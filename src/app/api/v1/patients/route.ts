import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      name: "patients",
    },
    {
      status: 200,
    },
  );
}
