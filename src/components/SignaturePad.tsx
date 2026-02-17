'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { uploadToCloudinary } from '@/libs/CloudinaryService';

type SignaturePadProps = {
  orderId: string;
  onSignatureSave: (url: string) => void;
  existingSignature?: string;
};

export function SignaturePad({
  orderId,
  onSignatureSave,
  existingSignature,
}: SignaturePadProps) {
  const t = useTranslations('SignaturePad');
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [signatureUrl, setSignatureUrl] = useState(existingSignature || '');

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const saveSignature = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      setError(t('sign_here'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Convert canvas to blob
      const canvas = sigCanvas.current.getCanvas();
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) {
            resolve(b);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      });

      // Upload to Cloudinary
      const url = await uploadToCloudinary(blob, orderId, 'signature');
      setSignatureUrl(url);
      onSignatureSave(url);
    } catch (err) {
      console.error('Error saving signature:', err);
      setError(t('saving'));
    } finally {
      setSaving(false);
    }
  };

  if (signatureUrl) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Firma del Cliente
        </label>
        <div className="relative">
          <img
            src={signatureUrl}
            alt="Firma del cliente"
            className="h-48 w-full rounded-lg border-2 border-gray-300 bg-white object-contain"
          />
          <button
            type="button"
            onClick={() => {
              setSignatureUrl('');
              onSignatureSave('');
            }}
            className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white shadow-lg hover:bg-red-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Firma del Cliente
      </label>

      {/* Signature Canvas */}
      <div className="rounded-lg border-2 border-gray-300 bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48 touch-none',
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={clearSignature}
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('clear')}
        </button>
        <button
          type="button"
          onClick={saveSignature}
          disabled={saving}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}
