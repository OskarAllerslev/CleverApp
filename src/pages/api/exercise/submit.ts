import type { APIRoute } from 'astro';
import prisma from '../../../lib/db/client';
import { calculateRewardXP, getLevelFromXP } from '../../../lib/xpService';
import { verifySession } from '../../../lib/db/auth-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const sessionToken = cookies.get('clevermat_session')?.value;
    const verifiedUserId = verifySession(sessionToken);

    if (!verifiedUserId) {
      return new Response(
        JSON.stringify({ error: 'Uautoriseret adgang. Log venligst ind.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { exerciseId, folder, attempts, question, solution, isHard, isPremium } = body;

    if (!exerciseId || !folder || attempts === undefined) {
      return new Response(
        JSON.stringify({ error: 'Manglende exerciseId, folder eller attempts.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = verifiedUserId;

    // 1. Calculate earned XP
    const xpEarned = calculateRewardXP(attempts);

    // 2. Perform database transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // Check if user exists
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Bruger ikke fundet i databasen.');
      }

      // Backend Premium Guard
      if ((isPremium || exerciseId.includes('premium')) && user.membershipType !== 'PREMIUM') {
        const error = new Error('Forbidden');
        (error as any).status = 403;
        throw error;
      }

      // Upsert ExerciseLog
      const log = await tx.exerciseLog.upsert({
        where: {
          userId_exerciseId_folder: {
            userId,
            exerciseId,
            folder,
          },
        },
        create: {
          userId,
          exerciseId,
          folder,
          attempts,
          completed: true,
          xpEarned,
        },
        update: {
          attempts: { increment: attempts },
          completed: true,
          xpEarned: { increment: xpEarned },
        },
      });

      // Get or create UserStats
      const existingStats = await tx.userStats.findUnique({
        where: { userId },
      });

      let newXp = xpEarned;
      let currentLevel = 1;
      let skillRatingAlgebra = 1000.0;
      let skillRatingCalculus = 1000.0;

      if (existingStats) {
        newXp += existingStats.totalXp;
        currentLevel = existingStats.level;
        skillRatingAlgebra = existingStats.skillRatingAlgebra;
        skillRatingCalculus = existingStats.skillRatingCalculus;
      }

      // Determine new level using the XP threshold helper
      const levelInfo = getLevelFromXP(newXp);
      const newLevel = levelInfo.level;
      const leveledUp = newLevel > currentLevel;

      // Update UserStats
      const updatedStats = await tx.userStats.upsert({
        where: { userId },
        create: {
          userId,
          level: newLevel,
          totalXp: newXp,
          skillRatingAlgebra,
          skillRatingCalculus,
        },
        update: {
          level: newLevel,
          totalXp: newXp,
        },
      });

      // 3. Add to AnkiMemory if attempts > 2 OR marked as hard
      let ankiAdded = false;
      if (attempts > 2 || isHard) {
        const docTitle = folder.replace(/-/g, ' ');
        const cardQuestion = question || `Opgaver i ${docTitle} - ${exerciseId}`;
        const cardSolution = solution || 'Se teorien for at løse opgaven.';

        await tx.ankiMemory.upsert({
          where: { cardId: exerciseId },
          create: {
            userId,
            cardId: exerciseId,
            question: cardQuestion,
            solution: cardSolution,
            interval: 0,
            easeFactor: 2.5,
            nextReview: new Date(),
          },
          update: {
            interval: 0,
            nextReview: new Date(),
          },
        });
        ankiAdded = true;
      }

      return {
        xpEarned,
        totalXp: updatedStats.totalXp,
        level: updatedStats.level,
        leveledUp,
        ankiAdded,
      };
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error submitting exercise:', error);
    let status = 500;
    if (error.message?.includes('ikke fundet')) {
      status = 404;
    } else if (error.message === 'Forbidden' || error.status === 403) {
      status = 403;
      return new Response(
        JSON.stringify({ error: 'Adgang nægtet. Denne opgave kræver PREMIUM medlemskab.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: error.message || 'Internt serverfejl.' }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
