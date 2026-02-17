# Glass Installation Workflow System

A production-ready workflow management system for glass installation businesses, built with Next.js 16, Notion as a database, and real-time collaboration features.

## 🚀 Features

### Phase 1-2: Order Management
- **Order Intake Form** with real-time price preview from Notion Pricing table
- **Automated Pricing** based on Client + Truck Model + Glass Position (3-way match)
- **Inventory Check** with status updates (En Stock / Sin Stock)
- **Order Tracking** with status workflow: Pendiente → En Stock → Programado → Completado → Facturado

### Phase 3-4: Crew Management & Field Operations
- **Crew Assignment** interface for admin dashboard
- **Mobile-Friendly Crew Dashboard** for field technicians
- **Job Execution Wizard** with step-by-step guidance
- **Photo Capture** for before/after evidence (3 before photos, 1 after photo)
- **Digital Signature Collection** with touch support
- **GPS Location Tracking** with timestamp recording
- **Real-time Progress Saving** with Cloudinary uploads

### Phase 6: Monthly Billing & Invoicing
- **PDF Invoice Generation** using React components
- **WhatsApp Invoice Delivery** via Twilio Business API
- **Cloudinary PDF Storage** for secure invoice archiving
- **Billing Dashboard** with client filtering and date range selection
- **Bulk Invoice Generation** for multiple completed orders
- **Automated Status Updates** to "Facturado" after invoicing

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Notion API v5 (as backend)
- **Authentication**: Clerk
- **File Storage**: Cloudinary
- **Messaging**: Twilio (WhatsApp Business API)
- **PDF Generation**: @react-pdf/renderer
- **Internationalization**: next-intl (Spanish/English)

## 📋 Prerequisites

- Node.js 22+ and npm
- Notion workspace with integration access
- Clerk account for authentication
- Cloudinary account for file storage
- Twilio account for WhatsApp messaging

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/partho5/glass-installation-workflow-HQ.git
cd glass-installation-workflow-HQ
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- **Notion**: `NOTION_API_KEY` and 7 database IDs
- **Cloudinary**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- **Twilio**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`

### 4. Set up Notion Workspace

Create the following databases in your Notion workspace:

1. **Orders** - Main order tracking database
2. **Clients** - Customer information
3. **Truck Models** - Vehicle specifications
4. **Glass Parts** - Glass inventory catalog
5. **Inventory** - Current stock levels
6. **Crews** - Field technician teams
7. **Pricing** - Client-specific pricing matrix

Each database needs to be shared with your Notion integration. Copy the database IDs from the URLs and add them to your `.env` file.

### 5. Configure Cloudinary

1. Create a Cloudinary account at https://cloudinary.com
2. Set up an **unsigned upload preset** for browser uploads:
   - Go to Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Set **Signing Mode** to "Unsigned"
   - Set **Folder** to `glass-orders` (optional but recommended)
   - Copy the preset name to `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### 6. Configure Twilio WhatsApp

1. Create a Twilio account at https://console.twilio.com
2. Set up WhatsApp Sandbox for testing:
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to connect your test phone
   - Copy the sandbox number to `TWILIO_WHATSAPP_NUMBER`
3. For production, apply for WhatsApp Business approval

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/(auth)/          # Authenticated pages
│   │   ├── dashboard/            # Main admin dashboard
│   │   ├── crew-dashboard/       # Crew field operations
│   │   └── crew-management/      # Crew assignment
│   └── api/                      # API routes
│       ├── orders/               # Order management
│       ├── crew/                 # Crew operations
│       └── admin/                # Admin actions
├── components/                   # React components
│   ├── OrderIntakeForm.tsx       # Order creation form
│   ├── OrdersList.tsx            # Order tracking table
│   ├── BillingTab.tsx            # Invoice generation UI
│   ├── JobExecutionWizard.tsx    # Field operation workflow
│   ├── InvoicePDF.tsx            # PDF invoice template
│   └── ...
├── libs/                         # Services and utilities
│   ├── NotionService.ts          # Notion API client
│   ├── CloudinaryService.ts      # File upload service
│   └── ...
├── locales/                      # i18n translations
│   ├── es.json                   # Spanish (primary)
│   └── en.json                   # English
└── utils/                        # Helper functions
```

## 🔄 Workflow Overview

```
1. Admin creates order → 2. Check inventory → 3. Assign to crew
                ↓
4. Crew receives job → 5. Capture before photos → 6. Replace glass
                ↓
7. Capture after photo → 8. Collect signature → 9. Mark completed
                ↓
10. Admin generates invoice → 11. Send via WhatsApp → 12. Mark as "Facturado"
```

## 🌍 Internationalization

The system supports Spanish (primary) and English. Language can be switched via the dashboard settings.

All user-facing text is managed through `src/locales/` JSON files.

## 🔒 Security

- Environment variables for sensitive credentials (never committed to Git)
- Clerk authentication for user access control
- Unsigned Cloudinary uploads (client-side) for photos
- Server-side Cloudinary uploads (authenticated) for PDFs
- WhatsApp message validation and rate limiting

## 📱 Mobile Support

- Responsive design with Tailwind CSS
- Touch-optimized signature pad
- Mobile camera integration for photo capture
- GPS geolocation for timestamp verification
- Progressive Web App (PWA) capabilities

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables from `.env.example` in your hosting provider's dashboard.

## 📝 Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting errors
npm run check:types  # TypeScript type checking
```

## 🐛 Troubleshooting

### Notion API Errors

- Verify your `NOTION_API_KEY` has access to all databases
- Check that database IDs are correct (copy from URL after `/` and before `?`)
- Ensure database properties match exactly (case-sensitive)

### Cloudinary Upload Errors

- Verify upload preset is set to "Unsigned"
- Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- Test uploads in Cloudinary Media Library

### WhatsApp Not Sending

- For sandbox: Ensure test phone is connected via "join [code]"
- For production: Verify WhatsApp Business approval status
- Check Twilio console for error logs

---

Built with ❤️ for glass installation businesses
