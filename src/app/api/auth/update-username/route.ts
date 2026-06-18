import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { toAuthUser } from '@/lib/auth';

interface DecodedToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const decoded = verifyToken(token) as DecodedToken;

    await connectDB();

    const body = await req.json();

    const { username } = body || {};

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    const clean = username.trim();

    if (clean.length < 3 || clean.length > 30) {
      return NextResponse.json(
        { success: false, message: 'Username must be 3-30 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Username may only contain letters, numbers and underscores',
        },
        { status: 400 }
      );
    }

    // ensure uniqueness (exclude current user)
    const existing = await User.findOne({ username: clean });
    if (existing && existing._id.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Username already taken' },
        { status: 409 }
      );
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { username: clean },
      { new: true }
    ).select('firstName lastName email username image provider');

    if (!user) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: toAuthUser(user.toObject()) });
  } catch (error) {
    console.error('Update Username Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
