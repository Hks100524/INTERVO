import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { toAuthUser } from '@/lib/auth';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

interface DecodedToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

function getBase64Size(base64String: string) {
  // approximate size in bytes
  const padding = (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0);
  return (base64String.length * 3) / 4 - padding;
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
    const { image } = body || {};

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ success: false, message: 'Image data is required' }, { status: 400 });
    }

    // validate data URI
    const match = image.match(/^data:(image\/(jpeg|jpg|png|webp));base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ success: false, message: 'Invalid image format' }, { status: 415 });
    }

    const mime = match[1];
    const base64Data = match[3];

    const size = getBase64Size(base64Data);
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: 'Image exceeds size limit (5MB)' }, { status: 400 });
    }

    // upload to Cloudinary
    const result = await uploadImageToCloudinary(image);

    if (!result || !result.secure_url) {
      return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { image: result.secure_url },
      { new: true }
    ).select('firstName lastName email username image provider');

    if (!user) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: toAuthUser(user.toObject()) });
  } catch (error) {
    console.error('Upload Profile Image Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
