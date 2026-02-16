'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Crew = {
  id: string;
  name: string;
  leadInstaller: string;
  phone: string;
  status: string;
};

type CrewAssignmentManagerProps = {
  crews: Crew[];
};

export function CrewAssignmentManager({ crews }: CrewAssignmentManagerProps) {
  const t = useTranslations('CrewManagement');
  const [userEmail, setUserEmail] = useState('');
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/assign-crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          crewId: selectedCrewId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign crew');
      }

      const crewName = crews.find(c => c.id === selectedCrewId)?.name || 'Unknown';
      setMessage({
        type: 'success',
        text: t('assign_success', { email: userEmail, crew: crewName }),
      });
      setUserEmail('');
      setSelectedCrewId('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || t('assign_error'),
      });
    } finally {
      setLoading(false);
    }
  };

  // Unused function - kept for future use if needed
  // const handleRemove = async (email: string) => {
  //   if (!window.confirm(t('remove_confirm', { email }))) return;

  //   setLoading(true);
  //   setMessage(null);

  //   try {
  //     const response = await fetch('/api/admin/assign-crew', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         userEmail: email,
  //         crewId: null, // Remove assignment
  //       }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error || 'Failed to remove crew');
  //     }

  //     setMessage({
  //       type: 'success',
  //       text: t('remove_success', { email }),
  //     });
  //   } catch (error: any) {
  //     setMessage({
  //       type: 'error',
  //       text: error.message || t('remove_error'),
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {t('assign_title')}
        </h2>

        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">
              {t('user_email_label')} *
            </label>
            <input
              type="email"
              id="userEmail"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              placeholder={t('user_email_placeholder')}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('user_email_hint')}
            </p>
          </div>

          <div>
            <label htmlFor="crewId" className="block text-sm font-medium text-gray-700">
              {t('select_crew_label')} *
            </label>
            <select
              id="crewId"
              value={selectedCrewId}
              onChange={e => setSelectedCrewId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
              required
            >
              <option value="">{t('select_crew_placeholder')}</option>
              {crews.map(crew => (
                <option key={crew.id} value={crew.id}>
                  {crew.name}
                  {' '}
                  - {t('crew_lead')}:
                  {' '}
                  {crew.leadInstaller}
                  {' '}
                  (
                  {crew.status}
                  )
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div
              className={`rounded-lg p-4 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t('assigning') : t('assign_button')}
          </button>
        </form>
      </div>

      {/* Available Crews Reference */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {t('available_crews')}
        </h2>

        <div className="space-y-3">
          {crews.map(crew => (
            <div
              key={crew.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{crew.name}</h3>
                  <p className="text-sm text-gray-600">
                    {t('crew_lead')}:
                    {' '}
                    {crew.leadInstaller}
                  </p>
                  {crew.phone && (
                    <p className="text-sm text-gray-600">
                      {t('crew_phone')}:
                      {' '}
                      {crew.phone}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {t('crew_status')}:
                    {' '}
                    {crew.status}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    crew.status === 'Available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {crew.status}
                </span>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                  {t('crew_id_advanced')}
                </summary>
                <code className="mt-1 block break-all rounded bg-gray-100 p-2 text-xs text-gray-700">
                  {crew.id}
                </code>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">
          📋 {t('how_to_use')}
        </h3>
        <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
          {(t.raw('instructions') as string[]).map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
