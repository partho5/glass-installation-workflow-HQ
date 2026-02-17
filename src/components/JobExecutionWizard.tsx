'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PhotoCapture } from './PhotoCapture';
import { SignaturePad } from './SignaturePad';

type JobExecutionWizardProps = {
  order: {
    id: string;
    orderId: string;
    clientName: string;
    unitNumber: string;
    truckModelName: string;
    glassPosition: string;
    jobProgress?: any;
  };
};

export function JobExecutionWizard({ order }: JobExecutionWizardProps) {
  const router = useRouter();
  const t = useTranslations('JobExecutionWizard');

  // Initialize state from saved progress or defaults
  const progress = order.jobProgress;
  const [currentStep, setCurrentStep] = useState(progress?.currentStep || 1);
  const [beforePhotos, setBeforePhotos] = useState<string[]>(
    progress?.beforePhotos || ['', '', ''],
  );
  const [afterPhotos, setAfterPhotos] = useState<string[]>(
    progress?.afterPhotos || [''],
  );
  const [signatureUrl, setSignatureUrl] = useState(progress?.signatureUrl || '');
  const [customerName, setCustomerName] = useState(progress?.customerName || '');
  const [gpsLocation, setGpsLocation] = useState(
    progress?.gpsLocation || { lat: 0, lng: 0 },
  );
  const [gpsError, setGpsError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Capture GPS when reaching step 4
  useEffect(() => {
    if (currentStep === 4 && gpsLocation.lat === 0) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setGpsError('');
          },
          (err) => {
            console.error('GPS error:', err);
            setGpsError(t('gps_failed'));
          },
        );
      } else {
        setGpsError(t('gps_failed'));
      }
    }
  }, [currentStep, gpsLocation.lat]);

  // Auto-save progress when state changes (debounced)
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await fetch('/api/crew/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            currentStep,
            beforePhotos,
            afterPhotos,
            signatureUrl,
            customerName,
            gpsLocation,
          }),
        });
      } catch (err) {
        console.error('Failed to auto-save progress:', err);
        // Don't show error to user - it's a background operation
      }
    };

    // Debounce: save 2 seconds after last change
    const timeoutId = setTimeout(saveProgress, 2000);

    return () => clearTimeout(timeoutId);
  }, [currentStep, beforePhotos, afterPhotos, signatureUrl, customerName, gpsLocation, order.id]);

  const canProceed = () => {
    switch (currentStep) {
      case 1: // 3 before photos required
        return beforePhotos.every(url => url !== '');
      case 2: // Instructions page - always can proceed
        return true;
      case 3: // 1 after photo required
        return afterPhotos[0] !== '';
      case 4: // Signature + customer name required
        return signatureUrl !== '' && customerName.trim() !== '';
      case 5: // Review page
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/crew/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          beforePhotos,
          afterPhotos,
          signatureUrl,
          customerName,
          gpsLocation,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete job');
      }

      // Success - redirect to crew dashboard
      router.push('/crew-dashboard?success=true');
    } catch (err) {
      console.error('Error completing job:', err);
      setError(t('error_message'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {t('step1_title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('step1_description')}
              </p>
            </div>

            <PhotoCapture
              orderId={order.orderId}
              photoType="before_1"
              label={t('photo1_label')}
              onPhotoCapture={(url) => {
                const newPhotos = [...beforePhotos];
                newPhotos[0] = url;
                setBeforePhotos(newPhotos);
              }}
              existingPhoto={beforePhotos[0]}
            />

            <PhotoCapture
              orderId={order.orderId}
              photoType="before_2"
              label={t('photo2_label')}
              onPhotoCapture={(url) => {
                const newPhotos = [...beforePhotos];
                newPhotos[1] = url;
                setBeforePhotos(newPhotos);
              }}
              existingPhoto={beforePhotos[1]}
            />

            <PhotoCapture
              orderId={order.orderId}
              photoType="before_3"
              label={t('photo3_label')}
              onPhotoCapture={(url) => {
                const newPhotos = [...beforePhotos];
                newPhotos[2] = url;
                setBeforePhotos(newPhotos);
              }}
              existingPhoto={beforePhotos[2]}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {t('step2_title')}
              </h3>
            </div>

            <div className="rounded-lg bg-blue-50 p-6">
              <h4 className="mb-4 text-base font-semibold text-blue-900">
                {t('materials_checklist')}
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>
                    {order.glassPosition}
                    {' '}
                    -
                    {order.truckModelName}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>{t('urethane')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>{t('moldings')}</span>
                </li>
              </ul>

              <h4 className="mt-6 mb-3 text-base font-semibold text-blue-900">
                {t('installation_steps')}
              </h4>
              <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800">
                <li>{t('installation_step_1')}</li>
                <li>{t('installation_step_2')}</li>
                <li>{t('installation_step_3')}</li>
                <li>{t('installation_step_4')}</li>
                <li>{t('installation_step_5')}</li>
                <li>{t('installation_step_6')}</li>
                <li>{t('installation_step_7')}</li>
              </ol>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm font-medium text-yellow-800">
                ⚠️
                {' '}
                {t('curing_time_reminder')}
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {t('step3_title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('step3_description')}
              </p>
            </div>

            <PhotoCapture
              orderId={order.orderId}
              photoType="after_1"
              label={t('photo_after_label')}
              onPhotoCapture={(url) => {
                setAfterPhotos([url]);
              }}
              existingPhoto={afterPhotos[0]}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {t('step4_title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('step4_description')}
              </p>
            </div>

            {/* Customer Name */}
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                {t('customer_name_label')}
                {' '}
                *
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder={t('customer_name_placeholder')}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
                required
              />
            </div>

            {/* Signature Pad */}
            <SignaturePad
              orderId={order.orderId}
              onSignatureSave={setSignatureUrl}
              existingSignature={signatureUrl}
            />

            {/* GPS Status */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                📍
                {' '}
                {t('gps_location_label')}
              </h4>
              {gpsLocation.lat !== 0
                ? (
                    <p className="text-sm text-green-700">
                      ✓
                      {' '}
                      {t('gps_captured')}
                      :
                      {' '}
                      {gpsLocation.lat.toFixed(6)}
                      ,
                      {gpsLocation.lng.toFixed(6)}
                    </p>
                  )
                : gpsError
                  ? (
                      <p className="text-sm text-yellow-700">
                        ⚠️
                        {' '}
                        {gpsError}
                      </p>
                    )
                  : (
                      <p className="text-sm text-gray-600">
                        {t('gps_capturing')}
                      </p>
                    )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {t('step5_title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('step5_description')}
              </p>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h4 className="mb-3 font-semibold text-gray-900">
                {t('job_details')}
                :
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t('order')}
                    :
                  </span>
                  <span className="font-medium">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t('customer')}
                    :
                  </span>
                  <span className="font-medium">{order.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t('unit')}
                    :
                  </span>
                  <span className="font-medium">{order.unitNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t('glass')}
                    :
                  </span>
                  <span className="font-medium">{order.glassPosition}</span>
                </div>
              </div>
            </div>

            {/* Evidence Summary */}
            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="mb-3 font-semibold text-green-900">
                {t('evidence_captured')}
                :
              </h4>
              <ul className="space-y-1 text-sm text-green-800">
                <li>
                  ✓
                  {t('before_photos_check')}
                </li>
                <li>
                  ✓
                  {t('after_photo_check')}
                </li>
                <li>
                  ✓
                  {t('signature_check')}
                  {' '}
                  (
                  {customerName}
                  )
                </li>
                <li>
                  ✓
                  {' '}
                  {t('gps_check')}
                  {gpsLocation.lat !== 0 ? '' : ` ${t('gps_optional')}`}
                </li>
              </ul>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      {/* Modal */}
      <div className="w-full max-w-2xl rounded-t-2xl bg-white sm:rounded-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{order.orderId}</h2>
              <p className="text-sm text-gray-600">
                {t('step_of', { current: currentStep, total: 5 })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          {renderStep()}
        </div>

        {/* Footer - Navigation */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('previous')}
              </button>
            )}

            {currentStep < 5
              ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                    className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t('next')}
                  </button>
                )
              : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !canProceed()}
                    className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? t('completing') : t('complete_job')}
                  </button>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}
