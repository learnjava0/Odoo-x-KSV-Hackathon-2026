
# 🚀 README.md

# 🏢 VendorBridge ERP: Enterprise Procurement & Vendor Management

VendorBridge is an enterprise-grade, high-compliance B2B Procurement and Supply Chain Automation platform. Built with a highly secure architecture, the system mitigates manual operational friction by digitalizing the end-to-end procurement lifecycle—from vendor onboarding to transactional audit trails and automated tax compliance.

---

## 🏗️ Core Architectural Blueprint

The platform enforces strict decoupling of layers, guaranteeing that data mutations pass through authorization guards before hitting the relational database layer.

```text
[ React Frontend / Ant Design v5 ]
                 │
                 ▼ (Stateless Bearer JWT Channel)
[ Controller Layer / RBAC Guard ]     <-- Method-level security interceptors (@PreAuthorize)
                 │
                 ▼
 [ Relational Business Engines ]       <-- Deterministic State Machine & Algorithmic Scoring
                 │
                 ▼
[ Spring Data JPA Data Access ]       <-- Atomic Transactions with Hibernate Auto-DDL Mapping
                 │
                 ▼
[ PostgreSQL Relational Database ]    <-- ACID-compliant persistence layer

```

---

## 🏆 Core Technical Capabilities

### 🧠 1. Machine-Guided Selection (Intelligent Quotation Engine)

Rather than relying on primitive "lowest price wins" logic, VendorBridge implements an automated decision-support matrix. Proposals are dynamically graded based on a weighted multi-variable execution factor:

$$\text{Price-Performance Score} = \frac{\text{Vendor Historical Rating}}{\text{Quoted Price}}$$

The response payloads are structured, sorted descending, and the optimal entry is dynamically flagged with an `isRecommended = true` badge—drastically shortening evaluation loops for procurement panels.

### ⚙️ 2. Finite State Engine (`ProcurementStateMachine`)

To eliminate procurement fraud and safeguard workflow continuity, the lifecycle of every core asset (RFQs, Bids, Approvals) is bound to a deterministic finite state machine.

* **Transition Pipeline:** `DRAFT ➔ PUBLISHED ➔ UNDER_REVIEW ➔ PENDING_APPROVAL ➔ APPROVED ➔ FULFILLED`
* **Workflow Guard:** Direct entity state updates via common setters are explicitly banned. If a rogue request attempts an illegal skip-state jump, the transaction automatically self-terminates, throwing a runtime exception.

### 📊 3. Automated Localized Tax Router (India GST Compliance)

The transactional calculation module automatically runs geographic cross-referencing between the verified `Vendor` source parameters and the local buyer `OrganizationProfile` location attributes:

* **Intra-State Transactions:** Automatically tracks, computes, and splits variables into **9% CGST + 9% SGST**.
* **Inter-State Transactions:** Automatically routes and maps a flat **18% IGST** allocation matrix.

### 🛡️ 4. Immutable Audit Trails

Every system transition, cryptographic payload signature, file-stream download, or dispatched notification triggers a background fork into the `ActivityLog` ecosystem.

> [!WARNING]
> **Immutable Data Isolation:** The activity ledger is strictly append-only. To protect audit integrity and ensure compliance tracking, data persistence models completely prohibit `UPDATE` or `DELETE` executions on this table.

### 📄 5. Zero-Disk Document Streaming

Approved purchase orders automatically compile into fully styled, corporate Tax Invoice layouts generated dynamically via `OpenPDF` in memory streams (`ByteArrayOutputStream`).

* **Compliance Text Processing:** Financial totals are automatically processed through an `EnglishNumberToWords` string engine to map numeric metrics directly to corporate text footers (e.g., `150750` reads as *Rupees One Lakh Fifty Thousand Seven Hundred Fifty Only*).

---

## 🛠️ Enterprise Technology Stack

* **Application Core:** Java 17, Spring Boot 3.2.4
* **Security & Guardrails:** Spring Security 6, Stateless JSON Web Tokens (JWT)
* **Persistence Layer:** PostgreSQL, Hibernate ORM, HikariCP
* **Reporting Utilities:** OpenPDF (Lowagie/iText engine fork)
* **Contract Specification:** OpenAPI 3 / Swagger Engine (`springdoc-openapi`)

---

## 🚀 Environment Setup & Deployment

### 📋 Prerequisites

Ensure a local PostgreSQL container or service instance is running and an active database target exists:

```sql
CREATE DATABASE vendorbridge;

```

### 🏃 Running the Application

Update the configurations inside `src/main/resources/application.yml` with your localized database credentials and run:

```bash
# Step 1: Clean build target and compile classes
mvn clean compile

# Step 2: Fire up the embedded Tomcat server on Port 8080
mvn spring-boot:run

```

---

## 🔌 API Documentation & Interactive Sandbox

The entire enterprise REST ecosystem is fully mapped under strict OpenAPI regulations. Use the sandbox playground link below to inspect payloads, execute mock queries, and review communication parameters live:

👉 **`http://localhost:8088/swagger-ui.html`**

---

## 🔒 Security Matrix & Role-Based Access Control

The stateless filtering pipeline wraps endpoints using method-level security guards to ensure absolute separation of duties.

| System Context / Endpoint Route | Authorized Role Profiles | Violation Handling |
| --- | --- | --- |
| `POST /api/v1/rfqs/**` | `PROCUREMENT_OFFICER`, `ADMIN` | Intercepted 403 Access Breach |
| `POST /api/v1/quotations/**` | `VENDOR` | Intercepted 403 Access Breach |
| `POST /api/v1/approvals/**` | `MANAGER` | Intercepted 403 Access Breach |

> [!NOTE]
> **Elegant Failure Handling:** When a user attempts to cross-reach beyond their role scope, the `CustomAccessDeniedHandler` converts the raw Spring Security exception into a pristine JSON response payload containing a user-friendly error string and an explicit `/dashboard` redirect instruction tailored specifically for frontend Toast alert engines.



