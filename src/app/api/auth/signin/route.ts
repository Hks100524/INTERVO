import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

import { generateToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { toAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } =
      await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Email and Password are required',
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email,
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    const token = generateToken(
      user._id.toString(),
      user.email
    );

    (
      await cookies()
    ).set('token', token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: toAuthUser(
          user.toObject()
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
