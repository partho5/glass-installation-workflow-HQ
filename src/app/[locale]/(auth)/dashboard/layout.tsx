import { SignOutButton } from '@clerk/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href={`/${locale}/dashboard`} className="text-xl font-bold text-gray-900 hover:text-blue-600">
            Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <SignOutButton>
              <button
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                type="button"
              >
                {t('sign_out')}
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {props.children}
      </main>
    </div>
  );
}
