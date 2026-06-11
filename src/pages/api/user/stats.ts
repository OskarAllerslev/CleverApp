import type { APIRoute } from 'astro';
import prisma from '../../../lib/db/client';
import { verifySession } from '../../../lib/db/auth-server';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get('clevermat_session')?.value;
    const verifiedUserId = verifySession(sessionToken);

    if (!verifiedUserId) {
      return new Response(
        JSON.stringify({ error: 'Uautoriseret adgang. Log venligst ind.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = verifiedUserId;

    const stats = await prisma.userStats.findUnique({
      where: { userId },
      select: {
        level: true,
        totalXp: true,
      },
    });

    if (!stats) {
      return new Response(
        JSON.stringify({ level: 1, totalXp: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return new Response(
      JSON.stringify({ error: 'Internt serverfejl.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
