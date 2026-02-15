# **Hnos. Rodríguez - Glass Installation Workflow System**

## **PROJECT CONTEXT**

You are building a digital workflow system for a Mexican glass installation business that services corporate truck fleets. The business currently operates entirely on paper, WhatsApp messages, and manual processes. This system will digitize their 6-phase workflow from order intake to payment collection.

**Critical Success Factor:** The business owner must be able to modify business data (clients, pricing, inventory, truck models, etc.) WITHOUT calling a developer. All business data lives in Notion and is fetched dynamically - NEVER hardcoded.

---

## **CORE PHILOSOPHY - READ CAREFULLY**

### **What This System IS:**
- A workflow automation tool that replaces paper receipts (talonarios)
- A liability protection system (photo documentation before/after)
- A cash flow accelerator (automated monthly billing)
- An operational knowledge repository (Enrique's glass expertise)

### **What This System IS NOT:**
- A fancy UI for the sake of design
- Over-engineered with unnecessary features
- Rigid and requiring developer changes for simple data updates
- A generic CRUD app - every feature must map to documented workflow pain points

### **Golden Rule:**
Every single feature you build must trace back to a specific pain point documented in the workflow. If you can't identify which Phase and which Risk it solves, don't build it.

---

## **THE 6-PHASE WORKFLOW (This is what you're automating)**

### **Phase 1: Order Initiation**
**Current pain:** Orders exist only as WhatsApp messages, easily lost
**What you build:**
- Order intake form (Assistant fills manually from WhatsApp)
- Required fields: Client (dropdown from Notion), Unit Number, Truck Model (dropdown), Glass Position (dropdown), Notes (optional)
- Auto-generate unique Order ID (e.g., ORD-2024-0001)
- Auto-timestamp order creation
- Default status: "Pendiente" (Pending)

### **Phase 2: Inventory Check**
**Current pain:** No visibility into stock, reactive purchasing
**What you build:**
- Inventory lookup system (fetch from Notion "Inventory" table)
- Action buttons:
  - "✅ En Stock" → Status: En Stock, adds inventory note
  - "🔴 Sin Stock - Pedir" → Status: Sin Stock, prompts for supplier/delivery date
- When glass arrives: "📦 Material Recibido" button → Status: En Stock
- Low stock alerts (when quantity < minimum threshold from Notion)

### **Phase 3: Scheduling & Dispatch**
**Current pain:** No crew visibility, forgotten materials, no tracking
**What you build:**
- Crew assignment (dropdown from Notion "Crews" table)
- Schedule date/time picker
- Material checklist generator (glass + uretano + molduras for that vehicle)
- "📅 Programar Cuadrilla" button → Status: Programado
- Send notification to assigned crew (method: TBD)

### **Phase 4: Field Execution** ⚠️ HIGHEST LIABILITY RISK
**Current pain:** No pre-installation documentation = legal exposure
**What you build:**
- **CRITICAL:** Crew mobile interface with photo capture:
  1. **BEFORE photos (mandatory):**
     - Dashboard with engine RUNNING (proves pre-existing sensor warnings)
     - VIN plate
     - Damaged glass
  2. Installation happens (offline)
  3. **AFTER photos:**
     - Completed installation
  4. Digital signature capture (touch screen)
     - Client name + signature + timestamp
- "🏁 Trabajo Completado" button → Status: Completado
- All photos/signature linked to Order ID

### **Phase 5: Archiving**
**Current pain:** Lost paper receipts = lost revenue
**What you build:**
- Digital archive (all data in Notion)
- Status tracking dashboard
- Filter by: Client, Status, Date Range
- NO manual filing - system does it automatically

### **Phase 6: Monthly Billing**
**Current pain:** Assistant spends full day manually counting papers
**What you build:**
- "Generate Monthly Invoice" function
- Filter: Status = "Completado" + Client + Date Range
- Auto-generate PDF invoice with:
  - Client info (from Notion)
  - List of completed orders (Order ID, Unit #, Glass, Date, Price)
  - Total amount
  - Payment terms (from Notion "Clients" table)
- "Send Invoice" button → Email PDF to client billing contact
- Mark orders as "Facturado" (Invoiced)

---

## **NOTION DATABASE STRUCTURE (Client manages this)**

You will read/write to these Notion tables via API:

### **1. Orders** (main workflow table)
- Order ID (auto-generated)
- Client (relation to Clients table)
- Unit Number (text)
- Truck Model (relation to Truck_Models table)
- Glass Position (select: Parabrisas, Lateral Izq, Lateral Der, Trasero)
- Status (select: Pendiente, En Stock, Sin Stock, Programado, Completado, Facturado)
- Assigned Crew (relation to Crews table)
- Schedule Date (date)
- Inventory Note (text)
- Photos (files - before/after)
- Signature (file)
- Price (formula from Clients pricing table)
- Created Date (timestamp)
- Notes (text)

### **2. Clients**
- Company Name (text)
- Contact Person (text)
- Email (email)
- WhatsApp (phone)
- Payment Terms (text, e.g., "Net-30")
- Credit Limit (number)
- Current Balance (rollup from unpaid Orders)
- Pricing Table (relation to Pricing table)

### **3. Truck_Models**
- Model Name (text, e.g., "Kenworth T680")
- Manufacturer (select)
- Common Glass Parts (relation to Glass_Parts)

### **4. Glass_Parts** (Enrique's knowledge base)
- Part Number (text, e.g., "DW2038")
- Description (text)
- Fits Vehicles (multi-select or text)
- Compatible Substitutes (text - Enrique's interchangeability notes)
- Requires Sensor Bracket (checkbox)
- Calquing Notes (text - special techniques)

### **5. Inventory**
- Part Number (relation to Glass_Parts)
- Quantity in Stock (number)
- Minimum Threshold (number)
- Location (text, e.g., "Warehouse A")
- Last Restocked (date)

### **6. Crews**
- Crew Name (text)
- Lead Installer (text)
- Phone (phone)
- Status (select: Available, On Job, Off)

### **7. Pricing**
- Client (relation to Clients)
- Glass Position (select)
- Truck Model (relation to Truck_Models)
- Price (number)

---

## **USER ROLES & ACCESS**

### **Assistant (Irene/Mayira)**
**Can do:**
- Create orders
- Check inventory
- Schedule crews
- Generate invoices
- View all orders

### **Crew Members**
**Can do:**
- View ONLY their assigned orders
- Upload photos
- Capture signatures
- Mark job complete
**Cannot do:**
- See other crews' jobs
- Create orders
- Access billing

### **Owner (Enrique)**
**Can do:**
- Everything (full access)
- Manage glass parts knowledge base

### **Inventory Manager**
**Can do:**
- Update inventory quantities
- View stock alerts
**Cannot do:**
- Process orders
- Access billing

---

## **CRITICAL REQUIREMENTS**

### **1. Dynamic Data (NEVER hardcode)**
❌ **WRONG:**
```
const clients = ["Trancasa", "Unim", "Link"];
const statuses = ["Pending", "In Stock"];
```

✅ **CORRECT:**
```
const clients = await fetchFromNotion("Clients");
const statuses = await fetchFromNotion("Order_Statuses");
```

**Why:** Business owner adds new clients/models/statuses in Notion without developer.

### **2. Mobile-First for Crews**
- Photo capture must use device camera
- Signature must work on touch screens
- Works offline (photos sync when online)
- Large touch targets (field workers wear gloves)

### **3. Liability Protection**
- **BEFORE photos are MANDATORY** - cannot proceed without them
- Dashboard photo must show "engine running" instruction
- VIN photo auto-extracts VIN if possible
- All photos timestamped and GPS-tagged

### **4. Performance**
- Dashboard loads in <2 seconds
- Photo upload shows progress bar
- Works on slow Mexican mobile networks

### **5. Language**
- All UI in Spanish
- Date format: DD/MMM/YYYY (e.g., 13/Feb/2024)
- Currency: MXN (Mexican Pesos)

---

## **WHAT NOT TO BUILD (Common Mistakes)**

❌ User registration system (roles are assigned, not self-registered)
❌ Complex analytics dashboards (not needed for MVP)
❌ Real-time chat (they use WhatsApp)
❌ Inventory forecasting algorithms (future feature)
❌ Automated WhatsApp sending (manual for MVP)
❌ Payment processing (they use bank transfers)
❌ Multi-language support (Spanish only)
❌ Custom reporting builder (PDF invoices sufficient)

---

## **SUCCESS CRITERIA**

The system succeeds when:
1. ✅ Assistant can process an order in <2 minutes (vs 10 minutes on paper)
2. ✅ Zero lost paper receipts (all digital)
3. ✅ Every job has before/after photos (legal protection)
4. ✅ Monthly invoicing takes <1 hour (vs full day)
5. ✅ Business owner can add new client without calling developer
6. ✅ Crew can complete workflow on phone in field with gloves

---

## **DEPLOYMENT & HANDOFF**

- Deploy to production-ready hosting
- Provide client with:
  - Notion database templates (pre-configured)
  - GitHub repository access
  - Deployment credentials
  - 1-page user guide (Spanish)
- Code must be clean enough that another developer can take over

---

## **MVP TIMELINE EXPECTATION**

**Week 1:** Order intake + inventory check + Notion integration
**Week 2:** Crew workflow + photo capture + signatures
**Week 3:** Invoicing + PDF generation + testing
**Week 4:** Polish + bug fixes + client training

---

## **WHEN IN DOUBT**

Ask yourself:
1. "Which Phase of the workflow does this feature support?"
2. "Which documented pain point does this solve?"
3. "Can the business owner modify this data themselves?"

If you can't answer all three, reconsider the feature.

---

**NOW BUILD. Every line of code must serve the workflow documented above.**
