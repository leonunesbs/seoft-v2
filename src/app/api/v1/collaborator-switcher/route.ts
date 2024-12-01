import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const collaboratorId = cookieStore.get('selected-collaborator')?.value ?? null;
  return NextResponse.json({ collaboratorId });
}

export async function POST(req: Request) {
  const { collaboratorId } = await req.json();
  const response = NextResponse.json({ success: true });
  response.cookies.set('selected-collaborator', collaboratorId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return response;
}
