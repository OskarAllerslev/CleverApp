import type { APIRoute } from 'astro';
import prisma from '../../../lib/db/client';
import { hashPassword, signSession } from '../../../lib/db/auth-server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password || password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Ugyldig e-mail eller adgangskode (min. 6 tegn).' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'En bruger med denne e-mail findes allerede.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const passwordHash = hashPassword(password);

    // Create user and UserStats in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          membershipType: 'FREE', // Default is FREE
        },
      });

      await tx.userStats.create({
        data: {
          userId: user.id,
          level: 1,
          totalXp: 0,
          skillRatingAlgebra: 1000.0,
          skillRatingCalculus: 1000.0,
        },
      });

      return user;
    });

    const token = signSession(newUser.id);

    // Set cookie
    cookies.set('clevermat_session', token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const sessionData = {
      user: {
        id: newUser.id,
        email: newUser.email,
        level: 'C',
        xp: 0,
        completed_topics: [],
        membershipType: newUser.membershipType,
      },
    };

    return new Response(JSON.stringify({ session: sessionData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ error: 'Kunne ikke oprette profil.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
