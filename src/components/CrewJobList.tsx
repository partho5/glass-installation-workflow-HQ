'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

type CrewJob = {
  id: string;
  orderId: string;
  clientName: string;
  unitNumber: string;
  truckModelName: string;
  glassPosition: string;
  scheduleDate: string;
};

type CrewJobListProps = {
  jobs: CrewJob[];
};

export function CrewJobList({ jobs }: CrewJobListProps) {
  const t = useTranslations('CrewJobList');
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-12 text-center">
        <span className="mb-4 block text-6xl">📋</span>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {t('no_jobs')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('no_jobs_message')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 md:p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('scheduled_work')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {jobs.length}
          {' '}
          {jobs.length === 1 ? t('pending_task') : t('pending_tasks')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.map(job => (
          <div
            key={job.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {job.orderId}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {job.clientName}
                </p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                {t('programmed')}
              </span>
            </div>

            {/* Job Details */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <span className="text-lg">🚛</span>
                <div>
                  <div className="text-xs text-gray-500">{t('unit')}</div>
                  <div className="font-medium text-gray-900">{job.unitNumber}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-lg">🔧</span>
                <div>
                  <div className="text-xs text-gray-500">{t('model')}</div>
                  <div className="font-medium text-gray-900">{job.truckModelName}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-lg">🪟</span>
                <div>
                  <div className="text-xs text-gray-500">{t('position')}</div>
                  <div className="font-medium text-gray-900">{job.glassPosition}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-lg">📅</span>
                <div>
                  <div className="text-xs text-gray-500">{t('programmed')}</div>
                  <div className="font-medium text-gray-900">
                    {job.scheduleDate
                      ? new Date(job.scheduleDate).toLocaleString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'Sin fecha'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Link
              href={`/crew-dashboard/${job.id}/execute`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800"
            >
              <span className="text-xl">▶️</span>
              <span>{t('start_work')}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
