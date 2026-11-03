# 🚀 Interio Platform - Production Hosting & Deployment Guide

This guide details how to host and deploy the **Interio Studio & Interior Design Platform** to production servers (Vercel, Render, Hostinger, AWS, DigitalOcean VPS, or cPanel/Linux).

---

## 📁 Project Folder & Environment Setup

All source code files, database schemas, API routes, and public uploads are saved in this repository folder:
` /Users/hemantbarapatre/Desktop/Interio`

---

## 🗄️ Step 1: Database Setup & Migration

The app uses **MySQL** database with **Prisma ORM**.

### 1. Production MySQL Connection
Set your production MySQL connection URL in `.env`:
```env
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/interio_db?sslmode=require"
```
*(You can use hosted MySQL services like PlanetScale, AWS RDS, DigitalOcean Managed Database, Railway, or your VPS MySQL database)*

### 2. Push Schema & Seed Initial Production Data
Run the following commands on your server or build machine:
```bash
# Push Prisma schema to create tables & relations
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed initial companies, catalogue items, admin accounts & sample data
npm run seed
```

---

## 🌐 Step 2: Deployment Options

### Option A: Hosting on Vercel (Recommended & Easiest)
1. Push this project code to GitHub or GitLab.
2. Log into [Vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: `mysql://USERNAME:PASSWORD@HOST:3306/DATABASE_NAME`
5. Click **Deploy**. Vercel will automatically build Next.js and provide a live SSL domain!

---

### Option B: Hosting on VPS (Hostinger, AWS EC2, DigitalOcean, Ubuntu)

1. **Install Node.js 18+ and PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Clone & Build Code**:
   ```bash
   git clone <YOUR_GIT_REPO_URL>
   cd Interio
   npm install
   cp .env.example .env
   # Edit .env with your MySQL credentials
   npx prisma db push
   npm run build
   ```

3. **Start Process with PM2**:
   ```bash
   pm2 start npm --name "interio-app" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Reverse Proxy Configuration**:
   ```nginx
   server {
       server_name app.interiodesigns.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔑 Default Production Login Credentials

Once seeded, you can log into any portal using these accounts:

| Portal Role | Email | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| 👑 **Master Admin** | `admin@interio.com` | `admin123` | Full Studio Management & RBAC Settings |
| 🎯 **Sales Director** | `sales@interio.com` | `sales123` | CRM Leads, Quotations & Client Directory |
| 🖼️ **Lead Designer** | `designer@interio.com` | `design123` | 3D Renders, Drawings & Material Specs |
| 🏗️ **Project Manager** | `pm@interio.com` | `pm123` | Fitout Projects, Work Calendar & Extra Work |
| 💰 **Accountant** | `accounts@interio.com` | `accounts123` | Client Invoices, Vendor Payouts & Profitability |
| 👤 **Client Portal** | `client@interio.com` | `client123` | Client Project Progress, Invoices & Design Approval |
| 🚛 **Vendor Portal** | `vendor@interio.com` | `vendor123` | Material Requisitions & Vendor Payment History |

---

## ✅ Verification Checklist Before Going Live

- [x] Run `npx prisma db push` to verify database schema sync.
- [x] Run `npm run seed` to verify demo data & user creation.
- [x] Run `npm run build` to verify 0 TypeScript/Next.js build errors.
- [x] Check `public/uploads/` folder permissions for user image & document uploads.
