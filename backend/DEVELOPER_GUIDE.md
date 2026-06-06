
---

# 🚀 VendorBridge Backend: Core Engineering & Architecture Guide

Welcome to the backend engineering blueprint of **VendorBridge**. This architecture is built using **Spring Boot 3.x, Spring Security (JWT), Spring Data JPA, PostgreSQL, and OpenPDF** to deliver a bulletproof, enterprise-grade Procurement ERP.

> [!IMPORTANT]
> **To my Backend Co-Developer:** Please read this guide carefully before writing any new services or controllers. We must maintain strict code consistency to avoid breaking the core state machine and relational workflows during integration.

---

## 🏗️ Architectural Blueprint & Data Flow

The application bypasses simple CRUD structures, employing strict architectural separation to guarantee data consistency and runtime stability.

```text
[ React Frontend / AntD Components ]
                 │ (Stateless Bearer JWT Authentication)
                 ▼
[ Controller Layer / RBAC Guard ]     <-- Secures access using standard Spring @PreAuthorize roles
                 │
                 ▼
 [ Relational Business Engines ]       <-- State Machine, Automated Tax Router, Score Evaluators
                 │
                 ▼
[ Spring Data JPA Data Access ]       <-- Atomically orchestrates standard PostgreSQL transactions

```

---

## 🧠 Business Logic Engines & Coding Rules (Must Follow)

### 1. Finite State Engine (`ProcurementStateMachine.java`)

* **How it works**: All core workflow modules (RFQs, Quotations, and Approvals) are governed by a deterministic state machine to ensure data safety.
* **The Golden Rule**: **Never** mutate an entity's status directly via standard setters (e.g., *do not use* `rfq.setStatus(RfqStatus.APPROVED)`).
* **How to code**: Every status shift must strictly pass through the state machine:

$$\text{transitionState(currentStatus, nextStatus, userRole)}$$


* **Defense Mechanism**: Any illegal mutation attempts (e.g., trying to sneak a quotation directly from `SUBMITTED` to `APPROVED` without passing through explicit `MANAGER` validation) instantly throws a `RuntimeException` and rolls back the database.
* **Audit Trail**: Every successful validation step internally forks an immutable append-only record directly into the `ActivityLogRepository`.

### 2. Transactional Financial Core (`ApprovalService.java`)

* **Atomic Transactions**: When a `MANAGER` grants approval to a selected quotation, this service fires an atomic transaction (`@Transactional`) that locks and executes three tasks simultaneously:
1. Updates the lifecycle states.
2. Generates a custom Purchase Order index: `VB-PO-YYYY-XXXX`.
3. Auto-generates the corresponding Invoice record.


* **Localized GST Tax Router**: To show real-world compliance, the tax service automatically reads the state parameters:
* If $\text{Vendor State} == \text{Organization State}$, the calculator splits data into **CGST (9%) + SGST (9%)**.
* If $\text{Vendor State} \neq \text{Organization State}$, the calculator routes a flat **IGST (18%)** allocation.



### 3. Machine-Guided Selection (`QuotationService.java`)

* **Algorithmic Ranking**: The comparison endpoint (`/api/v1/rfqs/{id}/compare`) maps data rows into native `QuotationComparisonDTO` payloads.
* **The Formula**: The service dynamically ranks proposals using a weighted efficiency factor:

$$\text{Price Performance Score} = \frac{\text{Vendor Historical Rating}}{\text{Quoted Price}}$$


* The array matrix is ordered descending, and the absolute highest scorer is automatically flagged with an `isRecommended = true` badge to guide frontend selection widgets.

### 4. Zero-Disk Document Streamer (`PdfGenerationService.java`)

* **Memory-Only Streaming**: Utilizes `OpenPDF` to structure legal tax layouts directly inside a `ByteArrayOutputStream`. Do not write code to save PDFs on the local disk space; stream it directly to the browser response.
* **Number-To-Words**: Intercepts the numeric `totalAmount` calculation value and pipes it through the `EnglishNumberToWords` engine to compute a certified text footer (e.g., `124500` translates dynamically to *Rupees One Lakh Twenty-Four Thousand Five Hundred Only*).

---

## 🔒 Security Architecture & Frontend Handshakes

### Strict Stateless RBAC Matrix

The API structure uses stateless JWT interceptors to map endpoint execution rights strictly according to user profiles. Use `@PreAuthorize` on your controllers based on this matrix:

| Endpoint Context | Allowed Application Roles | Security Failure Response |
| --- | --- | --- |
| `POST /api/v1/rfqs` | `PROCUREMENT_OFFICER`, `ADMIN` | `403 Forbidden` |
| `POST /api/v1/quotations` | `VENDOR` | `403 Forbidden` |
| `POST /api/v1/approvals/**` | `MANAGER` | `403 Forbidden` |

### Custom Access Denied Interception

Instead of throwing a standard raw Spring Security white-label error page that breaks the frontend, the `CustomAccessDeniedHandler` intercepts access breaches cleanly. It converts them into structured payloads tailored specifically for React Toast notifications:

```json
{
  "status": 403,
  "message": "You do not possess the required credentials to access this secure section.",
  "redirect": "/dashboard"
}

```

---

## 📝 Rules of Engagement for Backend Developers (Co-Devs)

> [!WARNING]
> 1. **Immutable Audit Trail**: `ActivityLog` is an append-only database entity. Do not write any `UPDATE` or `DELETE` queries for the `activity_logs` table.
> 2. **Lombok Usage**: Always use `@Data`, `@NoArgsConstructor`, and `@AllArgsConstructor` on model structures to keep the codebase clean and boiler-plate free.
> 
> 

---

## 🔌 API Sandbox & Mock Testing (For Frontend)

The entire REST ecosystem is compiled under OpenAPI regulations. Our frontend team can review and live-test the core communication contract at any time:
👉 `http://localhost:8080/swagger-ui.html`

---
