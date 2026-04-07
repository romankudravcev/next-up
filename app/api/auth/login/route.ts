import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { signToken, createSessionCookie } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body || {};
  if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  const jwt = signToken({ userId: user.id });
  const cookie = createSessionCookie(jwt);
  const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  res.headers.set('Set-Cookie', cookie);
  return res;
}
