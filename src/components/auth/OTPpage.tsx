'use client';

interface OTPModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OTPModal({
  open,
  onClose,
}: OTPModalProps) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
          Verify OTP
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Enter the verification code sent to your email
        </p>

        <div className="flex justify-center gap-3 mb-8">

          <input className="w-14 h-14 border rounded-xl text-center text-xl font-bold" maxLength={1} />

          <input className="w-14 h-14 border rounded-xl text-center text-xl font-bold" maxLength={1} />

          <input className="w-14 h-14 border rounded-xl text-center text-xl font-bold" maxLength={1} />

          <input className="w-14 h-14 border rounded-xl text-center text-xl font-bold" maxLength={1} />

        </div>

        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 font-semibold hover:opacity-90 transition">
          Verify OTP
        </button>

      </div>

    </div>
  );
}