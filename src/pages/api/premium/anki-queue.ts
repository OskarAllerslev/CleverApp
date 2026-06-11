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

    // Retrieve all due cards
    const now = new Date();
    const queue = await prisma.ankiMemory.findMany({
      where: {
        userId,
        nextReview: {
          lte: now,
        },
      },
      orderBy: {
        nextReview: 'asc',
      },
    });

    return new Response(JSON.stringify(queue), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching Anki queue:', error);
    return new Response(
      JSON.stringify({ error: 'Kunne ikke hente din Anki-kø.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
