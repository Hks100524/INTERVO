import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

function envOrThrow(key: string) {
  const v = process.env[key];
  if (!v) throw new Error(`${key} is not set`);
  return v;
}

export function getAuthorizationUrl(state: string, redirectUri?: string) {
  const clientId = envOrThrow('GOOGLE_CLIENT_ID');
  const redirect = redirectUri || envOrThrow('GOOGLE_REDIRECT_URI');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForTokens(code: string, redirectUri?: string) {
  const clientId = envOrThrow('GOOGLE_CLIENT_ID');
  const clientSecret = envOrThrow('GOOGLE_CLIENT_SECRET');
  const redirect = redirectUri || envOrThrow('GOOGLE_REDIRECT_URI');

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirect,
    grant_type: 'authorization_code',
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return res.json();
}

async function fetchGoogleProfile(accessToken: string) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch userinfo: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getProfileFromCode(code: string, redirectUri?: string) {
  const tokens = await exchangeCodeForTokens(code, redirectUri);
  const accessToken = tokens.access_token;
  if (!accessToken) throw new Error('No access_token received from Google');

  const profile = await fetchGoogleProfile(accessToken);
  return {
    id: profile.sub || profile.id,
    email: profile.email,
    email_verified: profile.email_verified,
    given_name: profile.given_name || profile.givenName || '',
    family_name: profile.family_name || profile.familyName || '',
    name: profile.name || '',
    picture: profile.picture || '',
  } as any;
}

async function generateUniqueUsername(base: string) {
  let candidate = base.replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase();
  if (!candidate) candidate = 'user';

  let exists = await User.findOne({ username: candidate });
  let suffix = 1;
  while (exists) {
    const tryName = `${candidate}${suffix}`;
    exists = await User.findOne({ username: tryName });
    if (!exists) return tryName;
    suffix += 1;
  }

  return candidate;
}

export async function linkOrCreateUserFromGoogleProfile(profile: any) {
  await connectDB();

  const googleId = profile.id;
  const email = profile.email;
  const emailVerified = !!profile.email_verified;

  if (!email || !emailVerified) {
    throw new Error('Google email not present or not verified');
  }

  // Try find by googleId first
  let user = await User.findOne({ googleId });
  if (user) {
    // ensure provider set
    if (user.provider !== 'google') {
      user.provider = 'google';
      user.googleId = googleId;
      await user.save();
    }
    return user;
  }

  // Try find by verified email
  user = await User.findOne({ email });
  if (user) {
    // attach googleId to existing user per project policy
    // Preserve existing `provider` value; do not overwrite it.
    user.googleId = googleId;
    if (!user.image && profile.picture) user.image = profile.picture;
    if (!user.firstName && profile.given_name) user.firstName = profile.given_name;
    if (!user.lastName && profile.family_name) user.lastName = profile.family_name;
    await user.save();
    return user;
  }

  // Create new user
  const firstName = profile.given_name || profile.name || '';
  const lastName = profile.family_name || '';
  const baseUsername = (email || '').split('@')[0];
  const username = await generateUniqueUsername(baseUsername);

  const newUser = await User.create({
    firstName: firstName || 'First',
    lastName: lastName || 'Last',
    username,
    email,
    password: '',
    provider: 'google',
    googleId,
    image: profile.picture || '',
    isVerified: true,
  });

  return newUser;
}
