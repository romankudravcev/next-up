import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { signToken, createSessionCookie } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const body = await request.json();
  const { token, name, password } = body || {};
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  if (invite.used) return NextResponse.json({ error: 'Token already used' }, { status: 400 });
  if (invite.expiresAt && invite.expiresAt < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 400 });
  // create user (hash password if provided)
  const hashed = password ? await bcrypt.hash(password, 10) : null;
  const user = await prisma.user.create({ data: { email: invite.email, name: name || null, password: hashed } });
  await prisma.invite.update({ where: { token }, data: { used: true } });
  const jwt = signToken({ userId: user.id });
  const cookie = createSessionCookie(jwt);
  const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  res.headers.set('Set-Cookie', cookie);
  return res;
}
