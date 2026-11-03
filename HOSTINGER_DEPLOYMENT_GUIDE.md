# 🚀 Hostinger Deployment Guide - Interio Studio Platform

This guide provides step-by-step instructions to deploy the **Interio Studio & Multi-Company Interior Design Platform** on **Hostinger VPS** (Ubuntu Linux) or **Hostinger Node.js Application Hosting**.

---

## 📂 Project Location & Code Base
All application code, database configurations, schemas, and assets are saved in your project folder:
` /Users/hemantbarapatre/Desktop/Interio`

---

## 🗄️ Step 1: Create MySQL Database on Hostinger

1. Log into your **Hostinger hPanel**.
2. Go to **Databases -> MySQL Databases**.
3. Create a new database:
   - **Database Name**: `interio_db` (or `u123456789_interio`)
   - **Database User**: `interio_user`
   - **Password**: `YourStrongPassword123!`
4. Copy your MySQL credentials for the next step.

---

## 🌐 Step 2: VPS Server Deployment (Hostinger VPS - Recommended)

### 1. Connect to Hostinger VPS via SSH
```bash
ssh root@YOUR_HOSTINGER_VPS_IP
```

### 2. Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2
```

### 3. Upload / Clone Your Codebase to VPS
```bash
cd /var/www
git clone <YOUR_GIT_REPO_URL> interio
# OR upload the project folder `/Users/hemantbarapatre/Desktop/Interio` using SFTP (FileZilla/Cyberduck) to /var/www/interio

cd /var/www/interio
npm install
```

### 4. Create `.env` Environment File on Server
Create `.env` inside `/var/www/interio`:
```env
DATABASE_URL="mysql://interio_user:YourStrongPassword123!@127.0.0.1:3306/interio_db"
```

### 5. Run Database Migration & Data Seeding
```bash
# Push database tables and relations
npx prisma db push

# Seed initial companies, catalogue items, admin accounts & sample data
npm run seed
```

### 6. Build & Start App with PM2 Process Manager
```bash
# Build production bundle
npm run build

# Start background process with PM2
pm2 start npm --name "interio-app" -- start

# Configure PM2 to auto-restart on server reboot
pm2 save
pm2 startup
```

---

## 🛠️ Step 3: Configure Nginx & Domain SSL (Hostinger VPS)

### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/interio
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 2. Enable Site & Enable SSL Certificate
```bash
sudo ln -s /etc/nginx/sites-available/interio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install free SSL certificate using Certbot
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔑 Default Login Credentials Matrix

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| 👑 **Master Admin** | `admin@interio.com` | `admin123` | Full Studio Management & Multi-Company Setup |
| 🎯 **Sales Director** | `sales@interio.com` | `sales123` | CRM Leads, Quotations & Client Directory |
| 🖼️ **Lead Designer** | `designer@interio.com` | `design123` | 3D Renders, Drawings & Material Specs |
| 🏗️ **Project Manager** | `pm@interio.com` | `pm123` | Fitout Projects, Work Calendar & Extra Work |
| 💰 **Accountant** | `accounts@interio.com` | `accounts123` | Client Invoices, Vendor Payouts & Profitability |
| 👤 **Client Portal** | `client@interio.com` | `client123` | Client Project Progress, Invoices & Design Approval |
| 🚛 **Vendor Portal** | `vendor@interio.com` | `vendor123` | Material Requisitions & Vendor Payment History |

---

## 📁 Persistent Files & Uploads
All client documents, material requisitions, and company logos uploaded on the website are automatically saved to `public/uploads/`. Ensure that the `public/uploads` directory on your server has read/write permissions:
```bash
chmod -R 777 /var/www/interio/public/uploads
```
