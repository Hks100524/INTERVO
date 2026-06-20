import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthorizationUrl } from '@/lib/oauth/google';

export async function GET(req: Request) {
  try {
    const state = crypto.randomUUID();

    // set state cookie
    (await cookies()).set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5,
      path: '/',
    });

    const origin = req.headers.get('origin') || `${req.url}`;
    // build redirect URI from environment or rely on helper
    const authUrl = getAuthorizationUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth start error', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
