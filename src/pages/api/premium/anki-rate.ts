import type { APIRoute } from 'astro';
import prisma from '../../../lib/db/client';
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
    const { cardId, rating } = body; // rating: 1 = Hårdt, 2 = Okay, 3 = Nemt

    if (!cardId || !rating || ![1, 2, 3].includes(rating)) {
      return new Response(
        JSON.stringify({ error: 'Manglende eller ugyldig cardId eller rating (skal være 1, 2 eller 3).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = verifiedUserId;

    // Retrieve user and check membership type
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { membershipType: true },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Bruger ikke fundet.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (user.membershipType !== 'PREMIUM') {
      return new Response(
        JSON.stringify({ error: 'Adgang nægtet. Denne funktion kræver et PREMIUM medlemskab.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve the card
    const card = await prisma.ankiMemory.findUnique({
      where: { cardId },
    });

    if (!card || card.userId !== userId) {
      return new Response(
        JSON.stringify({ error: 'Kort ikke fundet eller tilhører ikke denne bruger.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // SuperMemo-2 (SM2) Algorithm
    let interval = card.interval;
    let easeFactor = card.easeFactor;

    if (rating === 1) { // Hårdt (fail/re-learn)
      interval = 0; // Review in 10 minutes
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 2) { // Okay
      if (interval === 0) {
        interval = 1; // 1 day
      } else if (interval === 1) {
        interval = 3; // 3 days
      } else {
        interval = Math.round(interval * easeFactor);
      }
      // Ease factor remains unchanged
    } else if (rating === 3) { // Nemt
      if (interval === 0) {
        interval = 1; // 1 day
      } else if (interval === 1) {
        interval = 4; // 4 days
      } else {
        interval = Math.round(interval * easeFactor * 1.25);
      }
      easeFactor = Math.min(3.0, easeFactor + 0.15);
    }

    // Calculate next review timestamp
    const nextReviewDate = new Date();
    if (interval === 0) {
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
    } else {
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);
      nextReviewDate.setHours(0, 0, 0, 0); // Start of the day
    }

    // Update in database
    const updatedCard = await prisma.ankiMemory.update({
      where: { cardId },
      data: {
        interval,
        easeFactor,
        nextReview: nextReviewDate,
      },
    });

    return new Response(JSON.stringify(updatedCard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error rating card:', error);
    return new Response(
      JSON.stringify({ error: 'Kunne ikke opdatere kort-rating.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
