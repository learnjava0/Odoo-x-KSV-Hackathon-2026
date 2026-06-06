# VendorBridge ERP

> End-to-end procurement and vendor management platform — from RFQ creation to invoice payment.

VendorBridge is a full-stack B2B procurement ERP that digitises the complete sourcing lifecycle: vendor onboarding, request for quotation, quotation comparison, multi-level approval, purchase order generation, tax-compliant invoicing, and audit trail logging — all in one workspace.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Who Uses It](#who-uses-it)
- [Core Workflow](#core-workflow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Screenshots](#screenshots)
- [Feature Checklist](#feature-checklist)
- [API Overview](#api-overview)
- [Role & Access Matrix](#role--access-matrix)

---

## What It Does

| Area | Capability |
|---|---|
| Vendor Management | Register vendors, track GST/contact details, approve or block registrations |
| RFQ Creation | Multi-line-item RFQs with vendor assignment, deadlines, and file attachments |
| Quotation Submission | Vendors submit itemised quotes with unit prices, delivery timelines, and notes |
| Quotation Comparison | Side-by-side vendor comparison with lowest-price highlight and price-performance score |
| Approval Workflow | 4-step procurement approval chain with per-quotation remarks and audit trail |
| PO & Invoice | Auto-generated purchase orders and GST-compliant invoices (CGST/SGST/IGST) on approval |
| PDF Export | Download or print invoice PDFs; email invoices directly to vendors |
| Activity Logs | Immutable chronological audit trail of every procurement event |
| Reports & Analytics | Spend metrics, invoice composition chart, CSV export |
| Admin Panel | User management and role overview for system administrators |

---

## Who Uses It

VendorBridge is designed for mid-to-large organisations with structured procurement operations. Real-world use cases include:

- **Manufacturing companies** managing raw material suppliers across multiple states (automatic IGST/CGST/SGST routing)
- **IT departments** sourcing hardware and services from pre-approved vendor pools
- **Construction firms** running RFQs for materials and comparing contractor quotes
- **Retail chains** managing packaging and logistics vendors with approval gates
- **Government or NGO procurement teams** needing immutable audit trails for compliance

---

## Core Workflow

```
Procurement Officer
        │
        ▼
  Create RFQ  ──────────────────────────────────────────┐
  (title, line items, deadline, assign vendors)          │
        │                                                 │
        ▼                                           Vendors notified
  Vendors submit Quotations
  (unit price, delivery timeline, notes)
        │
        ▼
  Quotation Comparison Page
  (lowest price highlighted, price-performance score, recommended badge)
        │
        ▼
  Manager Approval
  (4-step stepper: Submitted → Review → Approval → Generate PO)
  (approval remarks recorded to audit trail)
        │
        ├── REJECTED → Vendor notified, quotation closed
        │
        └── APPROVED
                │
                ▼
        Purchase Order auto-generated  (VB-PO-YYYY-XXXX)
                │
                ▼
        Invoice auto-generated  (VB-INV-YYYY-XXXX)
        Tax calculated: CGST+SGST (same state) or IGST (inter-state)
        PDF generated and emailed to vendor
                │
                ▼
        Activity Log updated (immutable append-only)
```

---

## Tech Stack

### Backend
| Component | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2.4 |
| Security | Spring Security 6 + JWT (JJWT 0.12.5) |
| ORM | Spring Data JPA + Hibernate |
| Database | PostgreSQL |
| PDF Generation | OpenPDF 1.3.32 |
| API Docs | SpringDoc OpenAPI 3 / Swagger UI |
| Build | Maven |

### Frontend
| Component | Technology |
|---|---|
| Language | JavaScript (ES2022+) |
| Framework | React 18 |
| UI Library | Material UI v6 |
| State Management | Redux Toolkit |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS + custom CSS |

---

## Project Structure

```
vendorbridge/
├── README.md                   ← this file
├── backend/                    ← Spring Boot API
│   ├── README.md
│   ├── pom.xml
│   ├── docker-compose.yml
│   └── src/main/java/com/vendorbridge/
│       ├── controller/         ← REST endpoints
│       ├── service/            ← Business logic
│       ├── model/              ← JPA entities
│       ├── dto/                ← Request/response DTOs
│       ├── repository/         ← Spring Data repositories
│       └── security/           ← JWT filter, SecurityConfig
└── Frontend/                   ← React SPA
    ├── README.md
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── pages/              ← One file per screen
        ├── components/         ← Reusable UI components
        ├── layouts/            ← AppLayout (sidebar + topbar)
        ├── services/           ← Axios API client
        ├── store/              ← Redux auth slice
        ├── config/             ← Role-based route access
        └── utils/              ← Currency & date formatters
```

---

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL running locally

### 1. Database
```sql
CREATE DATABASE vendorbridge;
```

### 2. Backend
```bash
cd backend
# Edit src/main/resources/application.yml if needed (default: localhost:5432, user: postgres, pass: password)
./mvnw spring-boot:run
# API available at http://localhost:8088
# Swagger UI at http://localhost:8088/swagger-ui.html
```

### 3. Frontend
```bash
cd Frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Demo Accounts (seeded on first run)

| Role | Email | Password |
|---|---|---|
| Admin | admin@vendorbridge.com | admin123 |
| Manager | manager@vendorbridge.com | manager123 |
| Procurement Officer | procurement@vendorbridge.com | procurement123 |
| Vendor | vendor@vendorbridge.com | vendor123 |

---

## Screenshots

### Dashboard
![Dashboard](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/assets/dashboard.png)
*Live procurement pipeline — metric cards, workflow tracker, spending trend chart, and recent activity feed.*

### Vendor Management
![Vendors](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/assets/vendore.png)
*Searchable vendor directory with status filter tabs (Active / Pending / Blocked), View button, and Admin approve/block actions.*

### Create RFQ
![Create RFQ](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/assets/rfq_creation.png)
*Full-page RFQ form with line items table, vendor assignment typeahead, and drag-and-drop file attachment.*

### Submit Quotation (Vendor View)
![Submit Quotation](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/assets/quatation_submission.png)
*Vendor quotation form with itemised pricing, auto-calculated GST breakdown (subtotal / GST 18% / grand total), and payment terms.*

### Quotation Comparison
![Quotation Comparison](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/assets/quatation.png)
*Side-by-side vendor comparison with lowest-price column highlighted green, price-performance score, and "Select & Approve" button.*

### Approval Workflow
![Approvals](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/assets/approvals.png)
*Per-quotation approval card with 4-step stepper, approval chain, remarks textarea, quotation summary, and Approve/Reject buttons.*

### Purchase Orders & Invoices
![Documents](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/assets/invoice.png)
*Expandable invoice rows showing full CGST/SGST/IGST breakdown, vendor details, line items, Download/Print/Email actions.*

### Activity & Logs
![Activity](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/notification.png)
*Immutable audit trail with filter tabs (All / RFQ / Approvals / Invoices / Vendors), timeline icons, and rich event descriptions.*

### Reports & Analytics
![Reports](https://raw.githubusercontent.com/learnjava0/Odoo-x-KSV-Hackathon-2026/main/Frontend/src/assets/report.png)
*Coloured metric cards (Total Spend / Active Vendors / Active Spend / Confirmed Invoices), invoice composition bar chart, CSV export.*

---

## Feature Checklist

### Authentication & Session
- [x] Email + password login
- [x] JWT session (localStorage persistence)
- [x] Role-based route guards
- [x] Forgot password flow
- [x] Signup with role selection (vendor fields conditional)
- [x] Auto-logout on 401

### Dashboard
- [x] Personalised greeting with today's date
- [x] Quick action buttons (New RFQ, Add Vendor, Approvals)
- [x] 5 metric cards (RFQs, Approvals, Vendors, POs, Invoices)
- [x] Live pipeline workflow tracker (dark green card)
- [x] Spending trend area chart
- [x] Recent activity feed

### Vendor Management
- [x] Full-width search by name / GST / category
- [x] Filter tabs: All / Active / Pending / Blocked
- [x] View vendor detail dialog
- [x] Admin: approve / block vendor
- [x] Admin: add vendor directly (registers via signup API)

### RFQ Management
- [x] Full-page create form with 3-step stepper
- [x] Multi-line-item table (item / qty / unit)
- [x] Vendor assignment typeahead with × remove
- [x] Drag-and-drop file attachment
- [x] "Save & Send to Vendors" and "Save as Draft" buttons
- [x] RFQ list with assigned vendor chips and status

### Quotation Submission (Vendor)
- [x] Full-page submit form with RFQ summary banner
- [x] Itemised line items (item / qty / unit price / total / delivery)
- [x] Live cost breakdown (subtotal / GST 18% / grand total)
- [x] Notes and payment terms fields

### Quotation Comparison
- [x] Side-by-side column layout per vendor
- [x] Lowest price column highlighted green
- [x] Criteria rows: Grand Total, GST%, Delivery, Vendor Rating, Payment Terms
- [x] "Select & Approve" / "Select" buttons
- [x] Legend note

### Approval Workflow
- [x] One card per pending quotation
- [x] 4-step stepper (Submitted → Review → Approval → Generate PO)
- [x] Approval chain with actor avatars
- [x] Remarks textarea (saved to audit trail)
- [x] Quotation summary card (vendor / total / delivery / rating)
- [x] Approve (green) / Reject (red) buttons

### Purchase Orders & Invoices
- [x] Purchase orders table with PO number, RFQ, total, date, status
- [x] Expandable invoice rows with full detail panel
- [x] CGST / SGST / IGST breakdown based on vendor state
- [x] Download PDF
- [x] Print / Preview PDF
- [x] Email invoice to vendor

### Activity & Logs
- [x] Filter tabs: All / RFQ / Approvals / Invoices / Vendors
- [x] Coloured circular icons per event type
- [x] Rich description text per event
- [x] Entity badge (e.g. QUOTATION #5)
- [x] Actor name + formatted timestamp
- [x] Immutable — no delete/edit

### Reports & Analytics
- [x] 4 coloured metric cards (Total Spend / Vendors / POs / Invoices)
- [x] Month label in subtitle
- [x] Export button (CSV download)
- [x] Invoice composition bar chart (base amount vs tax)

### Admin
- [x] User list with role chips
- [x] Per-role count metric cards

---

## API Overview

Base URL: `http://localhost:8088/api/v1`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register user |
| POST | `/auth/login` | Public | Authenticate, get JWT |
| POST | `/auth/forgot-password` | Public | Password reset trigger |
| GET | `/vendors` | ADMIN, PROCUREMENT | List/search vendors |
| PATCH | `/vendors/{id}/status` | ADMIN | Approve or block vendor |
| POST | `/rfqs` | PROCUREMENT | Create and publish RFQ |
| POST | `/rfqs/upload` | PROCUREMENT | Upload RFQ attachment |
| GET | `/rfqs` | All authenticated | List all RFQs |
| GET | `/rfqs/{id}/compare` | PROCUREMENT, MANAGER | Quotation comparison DTO |
| POST | `/quotations/submit/{rfqId}` | VENDOR | Submit quotation |
| GET | `/approvals/pending` | MANAGER, ADMIN | Pending approval queue |
| POST | `/approvals/{quotationId}` | MANAGER | Approve or reject |
| GET | `/procurement/invoice` | PROCUREMENT, ADMIN, MANAGER | List invoices |
| GET | `/procurement/invoice/purchase-orders` | PROCUREMENT, ADMIN, MANAGER | List POs |
| GET | `/procurement/invoice/{id}/download` | PROCUREMENT, ADMIN | Download invoice PDF |
| POST | `/procurement/invoice/{id}/send-email` | PROCUREMENT, ADMIN | Email invoice to vendor |
| GET | `/analytics/dashboard` | ADMIN, MANAGER | Dashboard stats |
| GET | `/activities` | ADMIN, MANAGER, PROCUREMENT | Recent activity logs |
| GET | `/users` | ADMIN | All system users |

Full interactive docs: `http://localhost:8088/swagger-ui.html`

---

## Role & Access Matrix

| Page / Feature | Admin | Manager | Procurement Officer | Vendor |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ❌ | ❌ |
| Vendors (view) | ✅ | ❌ | ✅ | ❌ |
| Vendors (approve/block) | ✅ | ❌ | ❌ | ❌ |
| RFQs (view) | ✅ | ✅ | ✅ | ✅ |
| RFQs (create) | ❌ | ❌ | ✅ | ❌ |
| Submit Quotation | ❌ | ❌ | ❌ | ✅ |
| Quotation Comparison | ✅ | ✅ | ✅ | ❌ |
| Approvals | ❌ | ✅ | ❌ | ❌ |
| Purchase Orders & Invoices | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |
| Activity Logs | ✅ | ✅ | ✅ | ❌ |
| Admin Panel | ✅ | ❌ | ❌ | ❌ |
