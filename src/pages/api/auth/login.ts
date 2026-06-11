import type { APIRoute } from 'astro';
import prisma from '../../../lib/db/client';
import { hashPassword, signSession } from '../../../lib/db/auth-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Manglende e-mail eller adgangskode.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        stats: true,
        exerciseLogs: {
          where: { completed: true },
        },
      },
    });

    if (!user || user.passwordHash !== hashPassword(password)) {
      return new Response(
        JSON.stringify({ error: 'Forkert e-mail eller adgangskode.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = signSession(user.id);

    // Set cookie
    cookies.set('clevermat_session', token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const xp = user.stats?.totalXp ?? 0;
    const level = user.stats?.level ?? 1;
    const completedTopics = user.exerciseLogs.map(log => `${log.folder}/${log.exerciseId}`);

    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        level: level === 1 ? 'C' : level === 2 ? 'B' : 'A', // standard mock mappings or just the level number
        xp,
        completed_topics: completedTopics,
        membershipType: user.membershipType,
      },
    };

    return new Response(JSON.stringify({ session: sessionData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Kunne ikke logge ind.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
