import type { APIRoute } from 'astro';
import prisma from '../../../lib/db/client';
import { verifySession } from '../../../lib/db/auth-server';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
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

    // Reset user progress in database transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete all exercise logs
      await tx.exerciseLog.deleteMany({
        where: { userId },
      });

      // 2. Delete all SRS/Anki cards
      await tx.ankiMemory.deleteMany({
        where: { userId },
      });

      // 3. Reset user stats
      await tx.userStats.upsert({
        where: { userId },
        create: {
          userId,
          level: 1,
          totalXp: 0,
          skillRatingAlgebra: 1000.0,
          skillRatingCalculus: 1000.0,
        },
        update: {
          level: 1,
          totalXp: 0,
          skillRatingAlgebra: 1000.0,
          skillRatingCalculus: 1000.0,
        },
      });
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Alt brugerdata er blevet nulstillet.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error resetting user stats:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internt serverfejl.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
