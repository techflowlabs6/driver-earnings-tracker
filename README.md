# 🚚 Driver Earnings & Delivery Balance Tracker

> **Designed by TechFlow Labs**  
> A premium, mobile-first delivery driver earnings management application with automated shift settlement calculations, 1-click Google OAuth authentication, interactive reports, and company admin audit capabilities.

---

## 🌟 Key Features

- 🔐 **1-Click Google OAuth & Supabase Auth:** Seamless, passwordless authentication using Google accounts with auto-extracted user profiles.
- 💰 **Automated Shift Settlement Engine:**
  - Real-time calculation formula: `Net Settlement = Previous Shift Balance + Shift Earnings - Physical Cash in Hand`.
  - Instantly determines whether the **Company Owes Driver** or **Driver Owes Company**.
- ✏️ **Interactive Order & Balance Editing:** Edit delivery fares, tips, or prior shift balances on the fly with live dynamic recalculations.
- 📊 **Comprehensive Analytics & Reports:** Interactive weekly, monthly, quarterly, and yearly earnings charts with clickable shift date breakdown modals.
- 🛡️ **Company Admin Portal:** Secure read-only audit dashboard for managers to inspect driver performance, total order volumes, and financial balances across all company drivers.
- 🗄️ **Multi-App Database Isolation:** Built using PostgreSQL Row Level Security (RLS) inside a dedicated `driver_tracker` schema to protect existing tables in shared Supabase projects.

---

## 🛠️ Technology Stack

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
- **Authentication & Backend:** Supabase Auth (Google OAuth 2.0) + PostgreSQL (RLS & Triggers)
- **Charts & Visualizations:** Chart.js + React-Chartjs-2
- **Icons:** Lucide React

---

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Visit `http://localhost:5174/` in your browser.

---

## 📄 Database Setup

Run the `supabase_schema.sql` script inside your **Supabase SQL Editor** to automatically generate all isolated tables, RLS security policies, and user creation triggers inside the `driver_tracker` schema.
