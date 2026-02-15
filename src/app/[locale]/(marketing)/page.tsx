import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { HomeNavigation } from '@/components/HomeNavigation';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Glass Installation Workflow System - Hnos. Rodríguez',
  description: 'Digital workflow management system for glass installation business',
};

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          Glass Installation Workflow System
        </h1>
        <p className="text-xl text-gray-600">
          Hnos. Rodríguez - Sistema de Gestión de Instalación de Vidrios
        </p>
      </div>

      {/* Quick Actions */}
      <HomeNavigation />

      {/* About Section */}
      <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">About This System</h2>
        <p className="mb-4 text-gray-700">
          A production-ready digital workflow system designed for Mexican glass installation businesses
          that service corporate truck fleets. This system replaces paper-based processes with a complete
          digital workflow from order intake to payment collection.
        </p>
      </div>

      {/* Features Section */}
      <div className="mb-12 rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Features</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
              <span className="text-xl">📋</span>
              Order Management
            </h3>
            <p className="text-sm text-gray-600">
              Create and track orders with auto-generated IDs, client management, and truck model database
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
              <span className="text-xl">📦</span>
              Inventory Check
            </h3>
            <p className="text-sm text-gray-600">
              Real-time stock verification with automated ordering workflows for out-of-stock items
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
              <span className="text-xl">📅</span>
              Crew Scheduling
            </h3>
            <p className="text-sm text-gray-600">
              Assign crews, schedule jobs, and generate material checklists automatically
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
              <span className="text-xl">📱</span>
              Mobile-First Design
            </h3>
            <p className="text-sm text-gray-600">
              Responsive interface works seamlessly on phones, tablets, and desktop computers
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
              <span className="text-xl">🔒</span>
              Role-Based Access
            </h3>
            <p className="text-sm text-gray-600">
              Secure authentication with different permissions for assistants, crews, and owners
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
              <span className="text-xl">🗂️</span>
              Notion Integration
            </h3>
            <p className="text-sm text-gray-600">
              All business data managed in Notion - no developer needed for updates
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Complete Workflow</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-800">1</span>
            <span className="font-medium">Order Initiation</span>
            <span className="text-gray-400">→ Pendiente</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-800">2</span>
            <span className="font-medium">Inventory Check</span>
            <span className="text-gray-400">→ En Stock / Sin Stock</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-800">3</span>
            <span className="font-medium">Crew Scheduling</span>
            <span className="text-gray-400">→ Programado</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-800">4</span>
            <span className="font-medium">Field Execution</span>
            <span className="text-gray-400">→ Completado</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-800">5</span>
            <span className="font-medium">Monthly Billing</span>
            <span className="text-gray-400">→ Facturado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
