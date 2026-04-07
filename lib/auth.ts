import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const COOKIE_NAME = 'nextup_session';

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export async function getUserFromRequest(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE_NAME + '='));
    if (!match) return null;
    const token = decodeURIComponent(match.split('=')[1]);
    const data = verifyToken(token);
    if (!data?.userId) return null;
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    return user;
  } catch (e) {
    return null;
  }
}

export function createSessionCookie(token: string) {
  // httpOnly cookie string
  // Next.js API routes will set this header
  const secure = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}; Max-Age=${7 * 24 * 60 * 60}`;
}
