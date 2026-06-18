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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    const decoded =
      verifyToken(token) as DecodedToken;

    await connectDB();

    const user = await User.findById(
      decoded.userId
    ).select(
      'firstName lastName email username image provider'
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      user: toAuthUser(
        user.toObject()
      ),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 401,
      }
    );
  }
}
