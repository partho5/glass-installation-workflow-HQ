# Glass Installation Workflow System - User Guide

**Complete Guide - From Setup to Invoicing**

---

## 📋 ONE-TIME SETUP (15 minutes)

### 1. Create Notion Databases

Create 7 databases in Notion with these exact names:

| Database | Purpose | Icon |
|----------|---------|------|
| **Orders** | Track all jobs | 📝 |
| **Clients** | Customer list | 👥 |
| **Truck Models** | Vehicle types (Ford F-150, Chevy Silverado) | 🚚 |
| **Pricing** | Price per client/truck/glass combination | 💰 |
| **Inventory** | Glass stock tracking | 📦 |
| **Crews** | Field technician teams | 👷 |
| **Glass Parts** | Available glass types (Parabrisas, Lateral Izq, Lateral Der, Trasero) | 🪟 |

**Important:** Share all databases with your Notion integration → Copy database IDs to `.env` file

### 2. Add Sample Data

- **👥 Clients:** Add 2-3 customers (Name, Phone, Company)
- **🚚 Truck Models:** Add common trucks (Model name)
- **💰 Pricing:** Select Client + Truck Model + Glass Position → Enter price
- **👷 Crews:** Add field teams (Crew name)

---

## 🚀 DAILY WORKFLOW

### 💼 ADMIN DASHBOARD (Office Staff)

**URL:** `yourapp.com/dashboard`

#### Tab 1: ORDERS (Create & Track)

1. Click **"Nueva Orden"** button

2. **Fill form:**
   - Select Client → Select Truck Model → Select Glass Position
   - 💡 **Price shows automatically** (from Pricing database)
   - Enter Unit Number

3. Click **"Crear Orden"** → Order appears in table with status **"Pendiente"**

4. **Check Inventory:**
   - Click order row → Modal opens
   - Click **"En Stock"** (have glass) or **"Sin Stock"** (need to order)
   - Status changes automatically

5. **Assign to Crew** (when stock ready):
   - Go to **Tab 3: CREW MANAGEMENT**
   - Find order with status **"En Stock"**
   - Click **"Assign Crew"** → Select team
   - Status becomes **"Programado"**

---

### 📱 CREW DASHBOARD (Field Technicians - Mobile)

**URL:** `yourapp.com/crew-dashboard`

1. See list of assigned jobs
2. Click **"Start Job"** → Opens wizard with 4 steps:

#### Step 1: Before Photos 📸
- Take 3 photos of damaged glass
- Photos auto-upload to Cloudinary

#### Step 2: Installation 🔧
- Replace glass (offline work)
- GPS location recorded automatically

#### Step 3: After Photo ✅
- Take 1 photo of new glass
- Uploaded to Cloudinary

#### Step 4: Customer Signature ✍️
- Customer signs on screen with finger
- Click **"Complete Job"**
- Status automatically changes to **"Completado"** in admin dashboard

---

### 💰 BILLING TAB (Month-End Invoicing)

**URL:** `Dashboard → Tab 2: BILLING`

1. Select client from dropdown
2. See all **"Completado"** orders for that client
3. Check boxes for orders to invoice
4. Click **"Generate Invoice"**
   - PDF created with logo, order details, prices
   - Uploaded to Cloudinary
   - Status changes to **"Facturado"**

5. **Send via WhatsApp** (optional):
   - Click **"Send WhatsApp"**
   - Invoice PDF sent to client's phone automatically

---

## 🎯 STATUS FLOW

```
Pendiente → En Stock → Programado → Completado → Facturado
   ↓           ↓           ↓            ↓            ↓
Created    Inventory   Assigned    Job Done    Invoiced
          Checked     to Crew     by Crew    & Sent
```

---

## 📊 What Happens Where

| Action | Data Stored In | Files Stored In |
|--------|---------------|-----------------|
| Create order | Notion Orders DB | - |
| Check inventory | Status updated in Notion | - |
| Assign crew | Notion (Crew relation) | - |
| Take photos | Notion (URLs) | Cloudinary `/photos/` |
| Customer signature | Notion (URL) | Cloudinary `/signatures/` |
| Generate invoice | Notion (PDF URL + Invoice #) | Cloudinary `/invoices/` |

---

## ✅ BUSINESS BENEFITS

### ✨ No manual pricing
Auto-calculated from your pricing table

### 📸 Photo evidence
Before/after saved forever in Cloudinary

### 📱 Mobile-first
Crew works from phone, no paperwork

### 💰 Instant invoicing
PDF generated in 2 clicks

### 📲 WhatsApp delivery
Invoice sent directly to customer

### 🔍 Full tracking
See every order status in real-time

---

## 🎉 Summary

**Create order → Assign crew → Complete job → Invoice customer**

All in one system. Simple. Fast. Professional.

---

Built with ❤️ for glass installation businesses
