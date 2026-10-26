# Distributeder — Two-Sided B2B & Wholesale Marketplace

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Itzjay169/Distributeder)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FItzjay169%2FDistributeder)

**Distributeder** is a modern, high-performance, two-sided B2B & wholesale marketplace connecting commercial manufacturers, verified distributors, and volume procurement buyers with role-specific secure portals, real-time RFQ tender bidding, multi-tier wholesale discounts, and automated invoice settlements.

---

## ⚡ Run Live Directly in Your Browser (No Setup Required)

### Option 1: Run Live inside GitHub (Free 1-Click Cloud Machine)
Anyone with a GitHub account can run and view the entire working website directly inside their browser:
1. Click the **[Open in GitHub Codespaces](https://codespaces.new/Itzjay169/Distributeder)** badge above (or click **Code → Codespaces → Create codespace on main** on the GitHub repository).
2. GitHub will automatically boot the environment, install packages, seed the database, and launch the web server.
3. The live website will automatically pop up in a new browser tab with full functionality!

### Option 2: Deploy to Vercel in 1 Click (Public Permanent URL)
To get a public `.vercel.app` URL that anyone in the world can visit 24/7 without signing into GitHub:
1. Click the **[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FItzjay169%2FDistributeder)** badge.
2. Sign in with GitHub and click **Deploy**. Your site will be live in 60 seconds.

---

## 🚀 Quick Start (Run Locally on Your Machine)

Follow these exact steps to run the complete demo application:

```bash
# 1. Install dependencies
npm install

# 2. Run Prisma migration (SQLite - zero configuration required)
npx prisma migrate dev

# 3. Seed database with categories, 40+ products, users, orders, and RFQs
npm run seed

# 4. Start the development server
npm run dev
```

Then open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Demo Login Credentials

The seed script creates ready-to-test accounts across all roles. The login page also features **One-Click Demo Autofill** buttons:

| Role | Portal | Email | Password | Details |
|---|---|---|---|---|
| **Platform Admin** | `/admin/login` | `admin@distributeder.com` | `Distributeder#Admin2026!` | Full administrative oversight, GMV analytics, user ban/unban, seller approval, dispute resolution |
| **Seller (Apex Hardware)** | `/seller/login` | `seller1@apexhardware.com` | `Distributeder#Seller2026!` | Industrial valves, impact tools, hardware supplies |
| **Seller (Nordic Packaging)** | `/seller/login` | `seller2@nordicpack.com` | `Distributeder#Seller2026!` | Packaging, boxes, warehouse packing supplies |
| **Seller (SolarVolt)** | `/seller/login` | `seller3@solarelec.com` | `Distributeder#Seller2026!` | Solar electronics, micro-inverters, industrial cabling |
| **Seller (Hybrid Global Trade)** | `/seller/login` | `seller4@hybridtrade.com` | `Distributeder#Seller2026!` | Wholesale import & export trade distributor |
| **Buyer (Prime Retailers)** | `/buyer/login` | `buyer1@primeretail.com` | `Distributeder#Buyer2026!` | Enterprise procurement buyer with active orders and submitted RFQs |
| **Buyer (Vertex Corporation)** | `/buyer/login` | `buyer2@vertexcorp.com` | `Distributeder#Buyer2026!` | Commercial buyer with active wholesale orders |
| **Buyer (BuildersCo)** | `/buyer/login` | `buyer3@buildersco.com` | `Distributeder#Buyer2026!` | Construction & infrastructure procurement officer |

---

## 🌟 Feature Breakdown

### 🛒 Public Marketplace
- **Modern Homepage:** Dynamic hero with source search, 8 category showcase cards, featured wholesale items, trending deals, verified distributor spotlight, and newsletter subscription.
- **Wholesale Product Catalog (`/products`):** Full-text search, filter by category, price bounds, in-stock only, and sort by price, popularity, rating, or newest in Indian Rupee (₹).
- **Product Detail (`/products/[slug]`):** High-res image gallery, interactive wholesale tier pricing matrix (e.g. 10+ units = 10% off), Minimum Order Quantity (MOQ) validation, variant selectors, verified buyer reviews, and direct supplier inquiry modal.
- **Distributor Public Storefront (`/store/[slug]`):** Dedicated store page showing store description, company classification, verification badges, seller score, and complete product line.
- **Request for Quote (RFQ) Exchange (`/rfq`):** Buyers post custom specifications and bulk quantities; verified distributors respond with binding bids and lead times.

### 👤 Dedicated Role Portals & Authentication
- **Dedicated Portals:** Separate, secure login portals for **Admin** (`/admin/login`), **Wholesale Distributors** (`/seller/login`), and **Enterprise Buyers** (`/buyer/login`), plus a unified role portal hub (`/portals`).
- **NextAuth.js:** Email & bcrypt password credentials provider, JWT sessions, strict role-based route authorization guards.
- **Demo Mode Forgot/Reset Password:** Generates secure reset tokens and displays the clickable reset link right on screen for immediate zero-config testing.

### 📦 Buyer Experience
- **Overview Dashboard (`/buyer/dashboard`):** Total orders, in-transit shipments, saved wishlist count, and volume settled.
- **Order Tracking (`/buyer/orders/[orderNumber]`):** 5-stage visual progress timeline (**Placed → Confirmed → Packed → Shipped → Delivered**), live event logs, and downloadable VAT invoices.
- **Procurement Wishlist (`/buyer/wishlist`):** Save items for future purchase and one-click move to cart.
- **Supplier Messaging (`/buyer/messages`):** Real-time style direct polling messaging between buyers and distributors.
- **Dock Addresses (`/buyer/addresses`):** Save multiple warehouse receiving bays and set default delivery locations.

### 🏭 Seller & Distributor Portal
- **Supplier Dashboard (`/seller/dashboard`):** Gross revenue metrics, incoming order alerts, quarterly GMV bar chart, and inventory low-stock warnings.
- **Inventory & SKU Management (`/seller/products`):** Full CRUD for products, image uploads saved locally to `/public/uploads`, variants, wholesale tiers, and **Bulk CSV Import / Export**.
- **Order Fulfillment (`/seller/orders`):** Update shipment statuses (Packed, Shipped with tracking number, Delivered) and generate printable commercial packing slips.
- **Settlement & Payouts (`/seller/payouts`):** Withdrawable balance tracker and simulated ACH / bank wire payout logs.
- **Store Settings (`/seller/settings`):** Customize trading name, business type, tax ID, logo, and store banner.

### 💳 Cart & Simulated Multi-Step Checkout
- **Cart (`/cart`):** Automatic wholesale volume discount calculation, MOQ validation, coupon code engine (`WELCOME10`, `BULKSAVE15`), shipping estimate, and platform tax.
- **Multi-Step Checkout (`/checkout`):**
  1. *Delivery Location:* Saved address picker or new entry.
  2. *Freight Logistics:* Standard Commercial Freight vs Expedited Air Cargo.
  3. *Payment Settlement:* Demo Corporate Card (simulated authorization that always succeeds) or Cash on Delivery (COD).
  4. *Review & Confirm:* Order notes and instant confirmation.
- **Commercial Invoice Generation:** Printable / downloadable PDF invoice format via browser print dialog.

### 🛡️ Admin Control Panel (`/admin`)
- **Executive Analytics (`/admin/dashboard`):** Real-time GMV, platform commission revenue, total users, orders, and category distribution.
- **User Moderation (`/admin/users`):** Audit accounts, ban/unban suspended entities, and assign ADMIN / USER roles.
- **Seller Vetting (`/admin/sellers`):** Approve/reject distributor applications and award verified badges.
- **Order Oversight (`/admin/orders`):** Global transaction ledger and dispute management.
- **Platform Parameters (`/admin/settings`):** Adjust platform commission %, tax %, default currency, and support email.
- **CSV Export:** Download complete platform transaction reports as CSV.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Vanilla CSS + Tailwind CSS v4 + Lucide React Icons
- **Database:** SQLite with Prisma 6 ORM (zero setup, stored locally in `dev.db`)
- **Authentication:** NextAuth.js v4 (credentials provider, bcryptjs hashing)
- **File Uploads:** Local storage in `/public/uploads` with MIME and size verification
- **Form & Schema Validation:** Zod
- **SEO:** Dynamic `sitemap.ts`, `robots.ts`, OpenGraph metadata

---

## 📂 Project Structure

```
├── app/
│   ├── (auth)/login, register, forgot-password, reset-password
│   ├── admin/ (dashboard, users, sellers, orders, disputes, settings)
│   ├── buyer/ (dashboard, orders, wishlist, addresses, rfq, messages, profile)
│   ├── seller/ (dashboard, products, orders, payouts, settings)
│   ├── products/ (catalog, filters, [slug] product detail)
│   ├── store/[slug]/ (public seller storefront)
│   ├── rfq/ (public RFQ procurement board)
│   ├── cart/ & checkout/ & order-confirmation/
│   ├── api/ (auth, products, orders, rfq, messages, upload, admin, etc.)
│   ├── layout.tsx, page.tsx, globals.css, loading.tsx, not-found.tsx
├── components/
│   ├── layout/ (Navbar, Footer)
│   ├── products/ (ProductCard, ProductsView, ProductDetailView)
│   ├── providers/ (AppProviders, CartProvider, CurrencyProvider, ToastProvider)
│   ├── buyer/ & seller/ & admin/ (Unified layout wrappers & managers)
├── prisma/
│   ├── schema.prisma (19 relational models)
│   └── seed.ts (40+ products, 8 categories, 8 users, orders, coupons, RFQs)
├── public/uploads/ (local file storage)
└── .env.example
```

---

## 🔮 Future Improvements (Production Scale)

When transitioning Distributeder from this local demo to global enterprise scale:

1. **Real Payment Gateways:**
   - Plug **Stripe Connect** or **Razorpay Route** directly into the modular payment step in `app/checkout/page.tsx` for automated split-payouts to distributors with escrow holding.
2. **Transactional Email Services:**
   - Integrate **Resend** or **SendGrid** to dispatch purchase receipts, shipping manifests, and password reset tokens via email instead of the on-screen demo modal.
3. **Cloud Asset Storage:**
   - Replace `/public/uploads` with **Amazon S3** or **Cloudinary** for multi-region CDN image delivery and thumbnail optimization.
4. **Real-time WebSockets:**
   - Upgrade the current polling-based messaging in `app/api/messages` to **Pusher** or **Socket.io** for instant typing indicators and live message push.
5. **Production Deployment:**
   - Deploy to **Vercel** or **AWS ECS** with PostgreSQL (e.g. Supabase, Neon, or RDS) by switching `provider = "postgresql"` in `prisma/schema.prisma`.
