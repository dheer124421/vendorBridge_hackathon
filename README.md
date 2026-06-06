# VendorBridge: Procurement & Vendor Management ERP

VendorBridge is a comprehensive MERN stack (MongoDB, Express, React, Node.js) Enterprise Resource Planning (ERP) platform designed to digitize and automate organizational procurement. It manages the full lifecycle of procurement—from registering vendors and dispatching Requests for Quotation (RFQs) to quotation comparisons, multi-stage approvals, Purchase Order (PO) issuance, and invoice payment settlements.

---

## 🛠️ Tech Stack & Key Libraries

- **Frontend**: React (Vite), React Router DOM, Lucide React (for icons)
- **Styling**: Vanilla CSS (custom design system with CSS variables, responsive grids, and micro-animations)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose Object Data Modeling (ODM)
- **Security**: JSON Web Tokens (JWT) for session management, bcryptjs for password encryption

---

## 📂 Project Structure

The project is structured into two separate modules: `/backend` and `/frontend`.

```text
/Odoo
  ├── README.md             # This file
  ├── backend/              # Node/Express API Server
  │    ├── config/          # DB connections
  │    ├── controllers/     # Controller logics (auth, RFQ, quote, PO, invoice, etc.)
  │    ├── middleware/      # Authentication & Role checking middlewares
  │    ├── models/          # Mongoose Schemas (User, VendorProfile, RFQ, etc.)
  │    ├── routes/          # Express API route endpoints
  │    ├── scripts/         # DB seed scripts
  │    └── server.js        # Entry server script
  │
  └── frontend/             # React Client Application
       ├── src/
       │    ├── components/ # Reusable UI components (Sidebar, Navbar, Modal)
       │    ├── context/    # Authentication State Provider
       │    ├── pages/      # Route pages (Dashboard, RFQ, PO, Invoice, Logs)
       │    ├── styles/     # Premium Vanilla CSS stylesheets
       │    └── App.jsx     # Route mapping and protection
       └── vite.config.js
```

---

## 🚀 Key Features (Conforming to Screen 1 - 10 Mockups)

1. **Authentication & Session (Screens 1 & 2)**:
   - Email & password session validation.
   - Comprehensive registration fields including photo mockups, First Name, Last Name, Phone, Role, Country, and Additional Details.
2. **Dashboard Overview (Screen 3)**:
   - Dynamic cards showing: Active RFQs count, Pending Approvals, PO spend totals (e.g. `₹ 2.3L`), and Overdue Invoices count.
   - SVG metrics showing Spending Trends, bar graphs, and category distributions.
   - Bottom quick actions to Create RFQ, Add Vendor, and View Invoices.
3. **Vendor Management (Screen 4)**:
   - Directory with verifying tabs: `All`, `active`, `Pending`, `Blocked`.
   - Admin control panel to verify, approve, or block new vendor applications.
4. **RFQ Dispatcher (Screen 5)**:
   - Three-step wizard progress tracker.
   - Line items editor (Item, Qty, Unit) and removable assigned vendor capsules.
5. **Bidding & Quotations (Screen 6)**:
   - Bidding sheets for assigned vendors.
   - Live pricing total calculators including Subtotal, SGST/CGST, and Grand Total displays.
6. **Comparison Matrix (Screen 7)**:
   - Side-by-side matrices comparing vendor bids across items, delivery speed, and ratings.
   - Auto-highlighting of the **lowest-price** vendor column in green.
7. **Approvals Flow (Screen 8)**:
   - Timeline progress: `Submitted -> L1 Review -> L2 approval -> Generate PO`.
   - Remarks feed and manager action buttons.
8. **Purchase Order & Invoice (Screen 9)**:
   - Corporate receipt views showing SGST (9%) and CGST (9%) tax splits.
   - Payment logs and one-click email dispatch simulation.
9. **Activity TIMELINE (Screen 10)**:
   - Timelines categorizing events (`All`, `RFQ`, `Approvals`, `Invoices`, `Vendors`).

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on default port `27017`)

---

### Setup Instructions

#### 1. Setup Backend Database & Server
Open a terminal in the `/backend` folder:

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Seed mock database values (Users, RFQs, Quotes)
npm run seed

# Run Backend in development mode
npm run dev
# OR start server normally
npm start
```

#### 2. Setup Frontend Client
Open a second terminal in the `/frontend` folder:

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install

# Run Vite development client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to access the ERP.

---

## 🔑 Demo Access Accounts

Password for all accounts below is **`password123`**:

- **Procurement Officer**: `officer@vendorbridge.com` (Creates RFQs, compares bids, generates POs)
- **Vendor Partner**: `vendor1@vendorbridge.com` (Tech Solutions Inc, submits bid quotes and invoices)
- **Manager / Approver**: `manager@vendorbridge.com` (Evaluates and approves quotation packages)
- **System Admin**: `admin@vendorbridge.com` (Approves vendor profiles, views audit logs)
