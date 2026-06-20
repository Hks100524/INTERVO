import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProfileFromCode, linkOrCreateUserFromGoogleProfile } from '@/lib/oauth/google';
import { generateToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json({ success: false, message: 'Missing code or state' }, { status: 400 });
    }

    const storedState = (await cookies()).get('oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.json({ success: false, message: 'Invalid state' }, { status: 400 });
    }

    // exchange code for profile
    const profile = await getProfileFromCode(code);

    const user = await linkOrCreateUserFromGoogleProfile(profile);

    const token = generateToken(user._id.toString(), user.email);

    // set token cookie (match signin behavior)
    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // clear oauth_state
    (await cookies()).set('oauth_state', '', { maxAge: 0, path: '/' });

    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('Google OAuth callback error', error);
    return NextResponse.json({ success: false, message: 'OAuth callback error' }, { status: 500 });
  }
}
