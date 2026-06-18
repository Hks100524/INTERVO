import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.warn('Cloudinary environment variables are not fully configured. Image uploads will fail without CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(dataUri: string, folder?: string) {
  // dataUri should be a data:<mime>;base64,<data> string
  const opts: any = {
    folder: folder || process.env.CLOUDINARY_FOLDER || 'profiles',
    resource_type: 'image',
    overwrite: true,
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  };

  return await cloudinary.uploader.upload(dataUri, opts);
}

export default cloudinary;
