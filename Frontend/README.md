# VendorBridge — Frontend

React SPA for the VendorBridge procurement platform. Provides role-aware screens for every stage of the procurement lifecycle.

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| Vite | 5.4 | Dev server + build tool |
| Material UI | 6.1 | Component library |
| Redux Toolkit | 2.3 | Auth state management |
| React Router | 6.27 | Client-side routing |
| Axios | 1.7 | HTTP client with JWT interceptor |
| Recharts | 2.13 | Dashboard & reports charts |
| React Hook Form | 7.53 | Login/signup form validation |
| Tailwind CSS | 3.4 | Utility classes (login page) |

---

## Project Structure

```
Frontend/
├── index.html
├── vite.config.js              ← /api proxy → localhost:8088
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                ← App entry, Redux Provider, BrowserRouter
    ├── App.jsx                 ← Route tree with ProtectedRoute + RoleRoute guards
    ├── styles.css              ← Global design tokens, component overrides
    │
    ├── config/
    │   └── access.js           ← ROLES enum, routeAccess map, getDefaultRoute()
    │
    ├── store/
    │   └── store.js            ← Redux auth slice (token, user, role → localStorage)
    │
    ├── services/
    │   └── api.js              ← Axios instance, JWT interceptor, downloadFile helper
    │
    ├── utils/
    │   └── formatters.js       ← formatCurrency (INR), formatDate (en-IN)
    │
    ├── routes/
    │   ├── ProtectedRoute.jsx  ← Redirects to /login if no token
    │   └── RoleRoute.jsx       ← Redirects to default route if role not allowed
    │
    ├── layouts/
    │   └── AppLayout.jsx       ← Sidebar + topbar shell, nav filtered by role
    │
    ├── components/
    │   ├── AnimatedNumber.jsx      ← Counts up to a value (dashboard KPI cards)
    │   ├── ChartTooltip.jsx        ← Dark tooltip for Recharts
    │   ├── CompareQuotations.jsx   ← Modal comparison table (legacy, replaced by page)
    │   ├── DataStates.jsx          ← TableState + StateContent (loading/empty/error)
    │   ├── PageHeader.jsx          ← Page title, subtitle, optional action button
    │   ├── PdfPreview.jsx          ← PDF viewer modal (iframe + print trigger)
    │   └── WorkflowTracker.jsx     ← Dark green pipeline card on Dashboard
    │
    └── pages/
        ├── LoginPage.jsx           ← Email/password + demo account buttons
        ├── SignupPage.jsx          ← Role-based registration (vendor fields conditional)
        ├── ForgotPasswordPage.jsx  ← Password reset email trigger
        ├── DashboardPage.jsx       ← KPIs, workflow tracker, chart, recent activity
        ├── VendorsPage.jsx         ← Vendor directory, search, status tabs, add/approve
        ├── RfqsPage.jsx            ← RFQ list + Create RFQ form + Submit Quotation form
        ├── QuotationsPage.jsx      ← Side-by-side vendor comparison table
        ├── ApprovalsPage.jsx       ← Per-quotation approval cards with stepper
        ├── DocumentsPage.jsx       ← POs + expandable invoice detail + PDF actions
        ├── ReportsPage.jsx         ← Coloured metric cards + bar chart + CSV export
        ├── NotificationsPage.jsx   ← Filtered activity timeline with event icons
        └── AdminPage.jsx           ← User list with role chips
```

---

## Local Setup

```bash
cd Frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. All `/api` requests are proxied to `http://localhost:8088` (configured in `vite.config.js`).

### Build for production
```bash
npm run build       # outputs to Frontend/dist/
npm run preview     # serve the production build locally
```

---

## Environment Variables

Create a `.env` file in the `Frontend/` directory if you need to override the API URL:

```env
VITE_API_URL=http://localhost:8088/api/v1
```

If not set, the Vite dev proxy handles `/api` automatically.

---

## Pages & Features

### LoginPage
- Email/password fields with show/hide toggle
- Demo account quick-fill buttons (Admin, Manager, Procurement, Vendor)
- Forgot password and signup links
- Dispatches `setCredentials` to Redux on success
- Navigates to role-appropriate default route

### SignupPage
- Role selector (Admin / Manager / Procurement Officer / Vendor)
- Vendor-specific fields appear conditionally (company name, category, GST, contact)

### DashboardPage *(Admin, Manager)*
- Personalised greeting with live date
- Quick action buttons: New RFQ, Add Vendor, Approvals
- 5 metric cards with animated counters
- `WorkflowTracker` — dark green pipeline card showing counts per stage
- Area chart: spending trend from recent POs
- Recent activity feed with green dot indicators

### VendorsPage *(Admin, Procurement)*
- Full-width search (name, GST, category)
- Filter tabs: All / Active / Pending / Blocked (with counts)
- Table: Vendor Name, Category, GST No., Contact, Status pill, Action
- "View" opens detail dialog with all vendor fields
- Admin: approve ✓ / block ✗ icon buttons — calls `PATCH /vendors/{id}/status`
- Admin: "+ Add Vendor" opens registration dialog

### RfqsPage *(All roles)*

**List view** (all roles):
- Table with title, product details, qty, deadline, assigned vendors, status chip
- "Create RFQ" button (Procurement only)
- "Submit quote" button per row (Vendor only — opens full-page form)

**Create RFQ form** (Procurement):
- 3-step stepper at top
- Left: title*, category, deadline*, description
- Right: multi-row line items (item/qty/unit + add/remove), vendor assignment typeahead with × tags
- Bottom: "Save & Send to Vendors" / "Save as Draft" buttons + drag-and-drop attachment zone

**Submit Quotation form** (Vendor):
- RFQ summary banner
- Itemised table: item / qty / unit price / auto-total / delivery days
- Left: GST rate, notes, payment terms
- Right: live cost breakdown (subtotal / GST 18% / grand total)
- "Submit Quotation" / "Save Draft" buttons

### QuotationsPage *(Manager, Procurement)*
- RFQ dropdown selector with quotation count chip
- Side-by-side column grid — one column per vendor
- Criteria rows: Grand Total, GST%, Delivery (days), Vendor rating, Payment terms
- Lowest-price vendor column highlighted green (header + cells)
- "Select & Approve" (filled, green column) / "Select" (outlined) buttons
- Selecting calls `POST /approvals/{id}` directly

### ApprovalsPage *(Manager)*
- One approval card per pending quotation
- 4-step stepper: Submitted (L1) → Review (L2) → Approval (L3, active) → Generate PO
- Left panel: approval chain with actor avatars + remarks textarea
- Right panel: quotation summary table + Approve/Reject buttons
- Remarks passed to API on decision

### DocumentsPage *(Admin, Manager, Procurement)*
- Purchase orders table (PO number, RFQ, total, date, status)
- Invoices table — click row to expand full detail panel:
  - Bill From / Vendor info
  - Line items (product / qty / unit price / total)
  - CGST/SGST or IGST breakdown
  - Grand total
- Per-invoice: Download PDF, Print (preview modal), Email to vendor

### ReportsPage *(Admin, Manager)*
- 4 coloured metric cards: Total Spend (green), Active Vendors (blue), Active Spend (amber), Confirmed Invoices (pink)
- Export button → generates and downloads `procurement-report.csv`
- Bar chart: invoice composition (base amount vs tax per invoice)

### NotificationsPage *(Admin, Manager, Procurement)*
- Filter pills: All / RFQ / Approvals / Invoices / Vendors
- Each event: coloured circle icon, bold event type in matching colour, entity badge, rich description, actor name + timestamp
- Events are immutable — no edit or delete

### AdminPage *(Admin only)*
- Per-role metric cards (count of each role)
- Full user table: ID, Email, Role chip

---

## Auth & Routing

```
/login          → LoginPage (public)
/signup         → SignupPage (public)
/forgot-password→ ForgotPasswordPage (public)
/               → DashboardPage   [Admin, Manager]
/vendors        → VendorsPage     [Admin, Procurement]
/rfqs           → RfqsPage        [All]
/quotations     → QuotationsPage  [Manager, Procurement]
/approvals      → ApprovalsPage   [Manager]
/documents      → DocumentsPage   [Admin, Manager, Procurement]
/reports        → ReportsPage     [Admin, Manager]
/notifications  → NotificationsPage [Admin, Manager, Procurement]
/admin          → AdminPage       [Admin]
```

`ProtectedRoute` — redirects to `/login` if no JWT token in Redux store.  
`RoleRoute` — redirects to the role's default route if the role is not in the allowed list.

---

## Screenshots

### Dashboard
![Dashboard](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/dashboard.png)

### Vendors
![Vendors](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/vendore.png)

### Create RFQ
![Create RFQ](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/rfq_creation.png)

### Submit Quotation
![Submit Quotation](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/quatation_submission.png)

### Quotation Comparison
![Comparison](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/quatation.png)

### Approval Workflow
![Approvals](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/approvals.png)

### PO & Invoices
![Documents](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/invoice.png)

### Reports
![Reports](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/report.png)

### Activity & Logs
![Activity](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/notification.png)
