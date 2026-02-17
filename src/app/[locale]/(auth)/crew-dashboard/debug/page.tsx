import { auth, currentUser } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCrews } from '@/libs/NotionService';

// Convert UUID without hyphens to standard UUID format
function formatNotionId(id: string): string {
  if (id.includes('-')) {
    return id;
  } // Already formatted
  if (id.length !== 32) {
    return id;
  } // Invalid length

  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

export default async function CrewDebugPage() {
  const t = await getTranslations('CrewDebug');
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const crewIdRaw = user?.unsafeMetadata?.notion_crew_id as string | undefined;
  const crewId = crewIdRaw ? formatNotionId(crewIdRaw) : undefined;

  // Fetch all crews to show which one matches
  const allCrews = await getCrews();

  // Find matching crew
  const matchingCrew = allCrews.find(crew => crew.id === crewId);

  return (
    <div className="space-y-6 rounded-lg bg-white p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <h2 className="mb-2 font-semibold">
            {t('user_info')}
            :
          </h2>
          <p className="text-sm">
            <strong>
              {t('name')}
              :
            </strong>
            {' '}
            {user?.firstName}
            {' '}
            {user?.lastName}
          </p>
          <p className="text-sm">
            <strong>
              {t('email')}
              :
            </strong>
            {' '}
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <h2 className="mb-2 font-semibold">
            {t('crew_id_clerk')}
            :
          </h2>
          {crewId
            ? (
                <div className="space-y-2">
                  {crewIdRaw !== crewId && (
                    <>
                      <p className="text-xs text-orange-600">
                        ⚠️
                        {' '}
                        {t('original_no_hyphens')}
                        :
                        {' '}
                        <code>{crewIdRaw}</code>
                      </p>
                      <p className="text-xs text-green-600">
                        ✓
                        {' '}
                        {t('auto_formatted')}
                        :
                        {' '}
                        <code>{crewId}</code>
                      </p>
                    </>
                  )}
                  {crewIdRaw === crewId && (
                    <p className="font-mono text-sm break-all">{crewId}</p>
                  )}
                  {matchingCrew
                    ? (
                        <div className="mt-2 rounded border border-green-600 bg-green-100 p-2">
                          <p className="text-sm font-semibold text-green-800">
                            ✅
                            {' '}
                            {t('match_found')}
                          </p>
                          <p className="text-sm text-green-700">
                            {t('crew_name')}
                            :
                            {' '}
                            {matchingCrew.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {t('lead')}
                            :
                            {' '}
                            {matchingCrew.leadInstaller}
                          </p>
                        </div>
                      )
                    : (
                        <p className="text-sm text-red-600">
                          ❌
                          {' '}
                          {t('no_match')}
                        </p>
                      )}
                </div>
              )
            : (
                <p className="text-sm text-red-600">
                  ❌
                  {t('no_crew_id')}
                </p>
              )}
        </div>

        <div className="rounded-lg bg-purple-50 p-4">
          <h2 className="mb-2 font-semibold">
            {t('available_crews')}
            :
          </h2>
          <div className="space-y-2">
            {allCrews.map(crew => (
              <div key={crew.id} className="rounded border border-purple-200 bg-white p-2 text-sm">
                <p className="font-semibold">{crew.name}</p>
                <p className="text-xs text-gray-600">
                  {t('lead')}
                  :
                  {' '}
                  {crew.leadInstaller}
                </p>
                <p className="font-mono text-xs break-all text-gray-500">
                  ID:
                  {' '}
                  {crew.id}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-yellow-50 p-4">
          <h2 className="mb-2 font-semibold">
            {t('action_required')}
            :
          </h2>
          {!matchingCrew && crewId && (
            <div className="space-y-2 text-sm">
              <p className="text-red-700">
                ❌
                {' '}
                {t('fix_message')}
              </p>
              <p className="font-semibold">{t('fix_instruction')}</p>
              <pre className="rounded bg-white p-2 text-xs">
                {JSON.stringify({ notion_crew_id: crewId }, null, 2)}
              </pre>
            </div>
          )}
          {matchingCrew && (
            <p className="text-sm text-green-700">
              ✅
              {' '}
              {t('correctly_configured')}
              {' '}
              <strong>{matchingCrew.name}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
