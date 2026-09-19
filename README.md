# SmartShelf AI 🛒🤖
> **Centralized Multi-Store SmartShelf AI Inventory, Expiry Tracking & Analytics Platform**

SmartShelf AI is an enterprise-grade retail inventory & expiry management platform built for multi-store chains and supermarkets. It features Role-Based Access Control (RBAC) across Super Admin / Owner, Area Supervisor, and Store Staff portals, FEFO (First-Expired, First-Out) shelf rotation, automated staff directives, dynamic barcode scanning, and multi-tier financial analytics.

---

## 🌟 Key Features

- **Multi-Role Access Portals (RBAC)**:
  - **Super Admin / Owner Portal**: Cross-store oversight, dynamic store provisioning, revenue & daily/weekly/monthly business analytics, warehouse stock allocations.
  - **Area Supervisor Portal**: Regional audit oversight, batch expiry monitoring, stock transfers, and price promo markdown directives.
  - **Store Staff Portal**: Fast barcode intake scanning, FEFO Sell-First directive execution, shelf relocation, waste logging, and POS checkout.

- **FEFO (First-Expired, First-Out) Expiry Engine**:
  - Multi-batch tracking per SKU (never assign a single expiry date to all stock).
  - Automated status tiering (`CRITICAL`, `URGENT`, `WARNING`, `WATCH`, `SAFE`).
  - Interactive Expiry Heatmap Calendar.

- **Dynamic Barcode Scanning & POS**:
  - Live database product lookup via camera, USB/Bluetooth hardware scanners, or manual input.
  - Quick Sell (1x) & batch receiving directly from the scanner.

- **20 Real-World Supermarket Categories**:
  - Pre-configured taxonomy spanning Groceries & Staples, Dairy & Eggs, Fruits & Veggies, Beverages, Snacks, Frozen Foods, Personal Care, Household Cleaning, Baby Care, Pet Care, and more.

- **Dark & Light Mode**:
  - Premium modern UI architecture with dark/light mode toggle and responsive stacked card layouts for mobile devices.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database & ORM**: SQLite / PostgreSQL with Prisma ORM
- **Styling**: Vanilla Tailwind CSS, Lucide Icons, Modern Component Architecture
- **State & Theme**: React Context & ThemeProvider

---

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/amarnath-2026/SmartShelf-AI.git
cd SmartShelf-AI

# Install dependencies
npm install

# Push database schema & seed sample multi-store data
npx prisma db push
npx prisma db seed

# Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔑 Demo Login Accounts

- **Owner / Super Admin**: `owner@smartshelf.ai` / `password123`
- **Area Supervisor**: `supervisor@smartshelf.ai` / `password123`
- **Store Staff**: `staff1@smartshelf.ai` / `password123`
