import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'User Guide - Glass Installation Workflow System',
  description: 'Complete guide to managing your glass installation business workflow',
};

export default function UserGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white shadow-2xl">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-5xl font-bold">
            Glass Installation Workflow System
          </h1>
          <p className="text-center text-xl text-blue-100">
            Complete User Guide - From Setup to Invoicing
          </p>
          {/* Back to Dashboard Link */}
          <div className="mt-4 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-700 shadow-lg transition-all hover:scale-105 hover:bg-purple-50"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Setup Section */}
        <section className="mb-16">
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white shadow-xl">
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold">
              <span className="text-4xl">📋</span>
              ONE-TIME SETUP (15 minutes)
            </h2>
          </div>

          {/* Step 1: Notion */}
          <div className="mb-8 rounded-xl border-l-8 border-blue-500 bg-white p-8 shadow-lg">
            <h3 className="mb-4 text-2xl font-bold text-blue-900">
              1. Create Notion Databases
            </h3>
            <p className="mb-4 text-gray-700">
              Create 7 databases in Notion with these exact names:
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { name: 'Orders', desc: 'Track all jobs', icon: '📝' },
                { name: 'Clients', desc: 'Customer list', icon: '👥' },
                { name: 'Truck Models', desc: 'Vehicle types', icon: '🚚' },
                { name: 'Pricing', desc: 'Price matrix', icon: '💰' },
                { name: 'Inventory', desc: 'Glass stock', icon: '📦' },
                { name: 'Crews', desc: 'Field teams', icon: '👷' },
                { name: 'Glass Parts', desc: 'Glass types', icon: '🪟' },
              ].map(db => (
                <div
                  key={db.name}
                  className="flex items-center gap-3 rounded-lg bg-blue-50 p-4"
                >
                  <span className="text-3xl">{db.icon}</span>
                  <div>
                    <div className="font-semibold text-blue-900">{db.name}</div>
                    <div className="text-sm text-blue-700">{db.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <strong>Important:</strong>
              {' '}
              Share all databases with your Notion
              integration → Copy database IDs to
              {' '}
              <code className="rounded bg-yellow-200 px-2 py-1">.env</code>
              {' '}
              file
            </div>
          </div>

          {/* Step 2: Sample Data */}
          <div className="mb-8 rounded-xl border-l-8 border-green-500 bg-white p-8 shadow-lg">
            <h3 className="mb-4 text-2xl font-bold text-green-900">
              2. Add Sample Data
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <strong>Clients:</strong>
                  {' '}
                  Add 2-3 customers (Name, Phone, Company)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🚚</span>
                <div>
                  <strong>Truck Models:</strong>
                  {' '}
                  Add common trucks (Ford F-150, Chevy Silverado)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <strong>Pricing:</strong>
                  {' '}
                  Select Client + Truck Model + Glass Position → Enter price
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">👷</span>
                <div>
                  <strong>Crews:</strong>
                  {' '}
                  Add field teams (Crew name)
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Daily Workflow */}
        <section className="mb-16">
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 pb-4 text-white shadow-xl">
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold">
              <span className="text-4xl"></span>
              DAILY WORKFLOW
            </h2>
          </div>

          {/* Admin Dashboard */}
          <div className="mb-12 rounded-xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-4 border-b-4 border-purple-500 pb-4">
              <span className="text-5xl">💼</span>
              <div>
                <h3 className="text-2xl font-bold text-purple-900">
                  ADMIN DASHBOARD (Office Staff)
                </h3>
                <code className="text-purple-700">yourapp.com/dashboard</code>
              </div>
            </div>

            {/* Tab 1: Orders */}
            <div className="mb-8">
              <h4 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
                <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                  Tab 1
                </span>
                ORDERS (Create & Track)
              </h4>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-500 font-bold text-white">
                    1
                  </span>
                  <div>
                    Click
                    {' '}
                    <strong className="text-purple-700">"Nueva Orden"</strong>
                    {' '}
                    button
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-500 font-bold text-white">
                    2
                  </span>
                  <div>
                    <strong>Fill form:</strong>
                    <ul className="mt-2 ml-4 list-disc space-y-1 text-gray-700">
                      <li>Select Client → Select Truck Model → Select Glass Position</li>
                      <li className="text-green-600">
                        💡
                        {' '}
                        <strong>Price shows automatically</strong>
                        {' '}
                        (from Pricing database)
                      </li>
                      <li>Enter Unit Number</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-500 font-bold text-white">
                    3
                  </span>
                  <div>
                    Click
                    {' '}
                    <strong>"Crear Orden"</strong>
                    {' '}
                    → Order appears with status
                    {' '}
                    <span className="rounded bg-yellow-200 px-2 py-1 text-sm font-semibold">
                      Pendiente
                    </span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-500 font-bold text-white">
                    4
                  </span>
                  <div>
                    <strong>Check Inventory:</strong>
                    <ul className="mt-2 ml-4 list-disc space-y-1 text-gray-700">
                      <li>Click order row → Modal opens</li>
                      <li>
                        Click
                        {' '}
                        <strong className="text-green-600">"En Stock"</strong>
                        {' '}
                        or
                        {' '}
                        <strong className="text-red-600">"Sin Stock"</strong>
                      </li>
                      <li>Status changes automatically</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-500 font-bold text-white">
                    5
                  </span>
                  <div>
                    <strong>Assign to Crew</strong>
                    {' '}
                    (when stock ready):
                    <ul className="mt-2 ml-4 list-disc space-y-1 text-gray-700">
                      <li>Go to Tab 3: CREW MANAGEMENT</li>
                      <li>Find order with status "En Stock"</li>
                      <li>
                        Click "Assign Crew" → Select team → Status becomes
                        {' '}
                        <span className="rounded bg-blue-200 px-2 py-1 text-sm font-semibold">
                          Programado
                        </span>
                      </li>
                    </ul>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Crew Dashboard */}
          <div className="mb-12 rounded-xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-4 border-b-4 border-blue-500 pb-4">
              <span className="text-5xl">📱</span>
              <div>
                <h3 className="text-2xl font-bold text-blue-900">
                  CREW DASHBOARD (Field Technicians - Mobile)
                </h3>
                <code className="text-blue-700">yourapp.com/crew-dashboard</code>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg bg-blue-50 p-6">
                <h4 className="mb-4 font-bold text-blue-900">
                  Job Execution - 4 Easy Steps:
                </h4>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold text-white">
                      1
                    </div>
                    <div className="flex-1 rounded-lg bg-white p-4">
                      <strong className="text-blue-900">Before Photos</strong>
                      <p className="text-sm text-gray-700">
                        Take 3 photos of damaged glass • Photos auto-upload to Cloudinary
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold text-white">
                      2
                    </div>
                    <div className="flex-1 rounded-lg bg-white p-4">
                      <strong className="text-blue-900">Installation</strong>
                      <p className="text-sm text-gray-700">
                        Replace glass (offline work) • GPS location recorded automatically
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold text-white">
                      3
                    </div>
                    <div className="flex-1 rounded-lg bg-white p-4">
                      <strong className="text-blue-900">After Photo</strong>
                      <p className="text-sm text-gray-700">
                        Take 1 photo of new glass • Uploaded to Cloudinary
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold text-white">
                      4
                    </div>
                    <div className="flex-1 rounded-lg bg-white p-4">
                      <strong className="text-blue-900">Customer Signature</strong>
                      <p className="text-sm text-gray-700">
                        Customer signs on screen • Click "Complete Job" • Status →
                        {' '}
                        <span className="font-semibold text-green-600">Completado</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="mb-12 rounded-xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-4 border-b-4 border-green-500 pb-4">
              <span className="text-5xl">💰</span>
              <div>
                <h3 className="text-2xl font-bold text-green-900">
                  BILLING TAB (Month-End Invoicing)
                </h3>
                <code className="text-green-700">Dashboard → Tab 2: BILLING</code>
              </div>
            </div>

            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                  1
                </span>
                <div>Select client from dropdown</div>
              </li>
              <li className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                  2
                </span>
                <div>
                  See all
                  {' '}
                  <strong className="text-green-600">"Completado"</strong>
                  {' '}
                  orders for that client
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                  3
                </span>
                <div>Check boxes for orders to invoice</div>
              </li>
              <li className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                  4
                </span>
                <div>
                  Click
                  {' '}
                  <strong>"Generate Invoice"</strong>
                  :
                  <ul className="mt-2 ml-4 list-disc space-y-1 text-gray-700">
                    <li>PDF created with logo, order details, prices</li>
                    <li>Uploaded to Cloudinary</li>
                    <li>
                      Status changes to
                      {' '}
                      <span className="rounded bg-purple-200 px-2 py-1 text-sm font-semibold">
                        Facturado
                      </span>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                  5
                </span>
                <div>
                  <strong className="text-blue-600">Send via WhatsApp</strong>
                  {' '}
                  (optional):
                  <p className="mt-1 text-gray-700">
                    Click "Send WhatsApp" → Invoice PDF sent to client's phone
                    automatically
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Status Flow */}
        <section className="mb-16">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 p-8 text-white shadow-xl">
            <h2 className="mb-6 text-center text-3xl font-bold">
              STATUS FLOW
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              <div className="rounded-lg bg-blue-900/80 px-6 py-4 backdrop-blur">
                <div className="text-2xl font-bold">Pendiente</div>
                <div className="text-sm">Created</div>
              </div>
              <div className="text-3xl">→</div>
              <div className="rounded-lg bg-blue-900/80 px-6 py-4 backdrop-blur">
                <div className="text-2xl font-bold">En Stock</div>
                <div className="text-sm">Inventory Checked</div>
              </div>
              <div className="text-3xl">→</div>
              <div className="rounded-lg bg-blue-900/80 px-6 py-4 backdrop-blur">
                <div className="text-2xl font-bold">Programado</div>
                <div className="text-sm">Assigned to Crew</div>
              </div>
              <div className="text-3xl">→</div>
              <div className="rounded-lg bg-blue-900/80 px-6 py-4 backdrop-blur">
                <div className="text-2xl font-bold">Completado</div>
                <div className="text-sm">Job Done</div>
              </div>
              <div className="text-3xl">→</div>
              <div className="rounded-lg bg-blue-900/80 px-6 py-4 backdrop-blur">
                <div className="text-2xl font-bold">Facturado</div>
                <div className="text-sm">Invoiced</div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Storage */}
        <section className="mb-16">
          <div className="rounded-xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
              <span className="text-3xl">📊</span>
              What Happens Where
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">Data Stored In</th>
                    <th className="p-3 text-left">Files Stored In</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3">Create order</td>
                    <td className="p-3 font-semibold text-blue-600">Notion Orders DB</td>
                    <td className="p-3 text-gray-500">-</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3">Check inventory</td>
                    <td className="p-3 font-semibold text-blue-600">Status in Notion</td>
                    <td className="p-3 text-gray-500">-</td>
                  </tr>
                  <tr>
                    <td className="p-3">Assign crew</td>
                    <td className="p-3 font-semibold text-blue-600">Notion (Crew relation)</td>
                    <td className="p-3 text-gray-500">-</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3">Take photos</td>
                    <td className="p-3 font-semibold text-blue-600">Notion (URLs)</td>
                    <td className="p-3 font-semibold text-orange-600">
                      Cloudinary
                      {' '}
                      <code className="text-xs">/photos/</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">Customer signature</td>
                    <td className="p-3 font-semibold text-blue-600">Notion (URL)</td>
                    <td className="p-3 font-semibold text-orange-600">
                      Cloudinary
                      {' '}
                      <code className="text-xs">/signatures/</code>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3">Generate invoice</td>
                    <td className="p-3 font-semibold text-blue-600">
                      Notion (PDF URL + Invoice #)
                    </td>
                    <td className="p-3 font-semibold text-orange-600">
                      Cloudinary
                      {' '}
                      <code className="text-xs">/invoices/</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <div className="rounded-2xl bg-gradient-to-r from-teal-700 to-green-900 p-8 text-white shadow-xl">
            <h2 className="mb-6 text-center text-3xl font-bold">
              BUSINESS BENEFITS
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-white/20 p-6 backdrop-blur">
                <div className="mb-2 text-2xl">✨</div>
                <strong className="text-lg">No manual pricing</strong>
                <p className="text-sm text-green-100">
                  Auto-calculated from your pricing table
                </p>
              </div>
              <div className="rounded-lg bg-white/20 p-6 backdrop-blur">
                <div className="mb-2 text-2xl">📸</div>
                <strong className="text-lg">Photo evidence</strong>
                <p className="text-sm text-green-100">
                  Before/after saved forever in Cloudinary
                </p>
              </div>
              <div className="rounded-lg bg-white/20 p-6 backdrop-blur">
                <div className="mb-2 text-2xl">📱</div>
                <strong className="text-lg">Mobile-first</strong>
                <p className="text-sm text-green-100">
                  Crew works from phone, no paperwork
                </p>
              </div>
              <div className="rounded-lg bg-white/20 p-6 backdrop-blur">
                <div className="mb-2 text-2xl">💰</div>
                <strong className="text-lg">Instant invoicing</strong>
                <p className="text-sm text-green-100">PDF generated in 2 clicks</p>
              </div>
              <div className="rounded-lg bg-white/20 p-6 backdrop-blur">
                <div className="mb-2 text-2xl">📲</div>
                <strong className="text-lg">WhatsApp delivery</strong>
                <p className="text-sm text-green-100">
                  Invoice sent directly to customer
                </p>
              </div>
              <div className="rounded-lg bg-white/20 p-6 backdrop-blur">
                <div className="mb-2 text-2xl">🔍</div>
                <strong className="text-lg">Full tracking</strong>
                <p className="text-sm text-green-100">
                  See every order status in real-time
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="text-center">
          <div className="rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-12 text-white shadow-2xl">
            <h2 className="mb-4 text-4xl font-bold">That's It !</h2>
            <p className="mb-6 text-2xl">
              Create order → Assign crew → Complete job → Invoice customer
            </p>
            <p className="text-xl text-purple-100">
              All in one system. Simple. Fast. Professional.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-gray-900 py-8 text-center text-white">
        <p className="text-lg">
          Built with ❤️ for glass installation businesses
        </p>
      </footer>
    </div>
  );
}
