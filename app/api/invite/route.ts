import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, invitedById } = body || {};
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const invite = await prisma.invite.create({ data: { token, email, expiresAt, invitedById: invitedById || null } });
  // NOTE: no email sending implemented here. Return token for manual sharing.
  return NextResponse.json({ token, expiresAt });
}
