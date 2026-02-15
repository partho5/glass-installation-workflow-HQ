'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export function HomeNavigation() {
  const { userId } = useAuth();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
      {!userId
        ? (
            <>
              <Link
                href={`/${locale}/sign-in`}
                className="rounded-lg border-2 border-blue-600 bg-blue-600 px-6 py-4 text-center font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                href={`/${locale}/sign-up`}
                className="rounded-lg border-2 border-blue-600 px-6 py-4 text-center font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                Sign Up
              </Link>
            </>
          )
        : (
            <>
              <Link
                href={`/${locale}/dashboard`}
                className="rounded-lg border-2 border-blue-600 bg-blue-600 px-6 py-4 text-center font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
              <Link
                href={`/${locale}/user-profile`}
                className="rounded-lg border-2 border-gray-300 px-6 py-4 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Profile Settings
              </Link>
            </>
          )}
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border-2 border-gray-300 px-6 py-4 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        Documentation
      </a>
    </div>
  );
}
