'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { uploadToCloudinary } from '@/libs/CloudinaryService';

type PhotoCaptureProps = {
  orderId: string;
  photoType: string;
  label: string;
  onPhotoCapture: (url: string) => void;
  existingPhoto?: string;
};

export function PhotoCapture({
  orderId,
  photoType,
  label,
  onPhotoCapture,
  existingPhoto,
}: PhotoCaptureProps) {
  const t = useTranslations('PhotoCapture');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [photoUrl, setPhotoUrl] = useState(existingPhoto || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const url = await uploadToCloudinary(file, orderId, photoType);
      setPhotoUrl(url);
      onPhotoCapture(url);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(t('upload_failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Camera Input */}
      {!photoUrl && (
        <div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`photo-${photoType}`}
          />
          <label
            htmlFor={`photo-${photoType}`}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-base font-medium transition-colors ${
              uploading
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            {uploading ? (
              <>
                <span className="text-xl">⏳</span>
                <span className="text-gray-600">{t('uploading')}</span>
              </>
            ) : (
              <>
                <span className="text-xl">📸</span>
                <span className="text-gray-700">{t('upload_photo')}</span>
              </>
            )}
          </label>
        </div>
      )}

      {/* Photo Preview */}
      {photoUrl && (
        <div className="relative">
          <img
            src={photoUrl}
            alt={label}
            className="h-48 w-full rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={() => {
              setPhotoUrl('');
              onPhotoCapture('');
            }}
            className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white shadow-lg hover:bg-red-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
