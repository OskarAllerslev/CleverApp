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

    // Update user to PREMIUM
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { membershipType: 'PREMIUM' },
      select: { id: true, email: true, membershipType: true },
    });

    return new Response(JSON.stringify({ success: true, user: updatedUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error upgrading user:', error);
    return new Response(
      JSON.stringify({ error: 'Kunne ikke opgradere til premium.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
