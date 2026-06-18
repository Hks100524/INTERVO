import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { toAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      firstName,
      lastName,
      username,
      email,
      password,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields are required',
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Email or Username already exists',
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      provider: 'credentials',
      isVerified: true,
    });

    const token = generateToken(
      user._id.toString(),
      user.email
    );

    const cookieStore = await cookies();

    cookieStore.set('token', token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Account created successfully',
        user: toAuthUser(
          user.toObject()
        ),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error('Signup Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}
