# 🚀 VCard System Migration to Vercel

## Executive Summary

**Project:** Migrate PCT VCard System from GoDaddy (PHP) to Vercel (Next.js)  
**Current Host:** GoDaddy (pct.com) - PHP 8.0, MySQL  
**Target Host:** Vercel (2026-pct-website) - Next.js 16, Serverless Functions  
**Target Repo:** `2026-pct-website` (already exists with admin panel)  
**Estimated Effort:** 2-3 weeks (phased rollout)  
**Risk Level:** Low (existing foundation, clear requirements)  
**Strategy:** Option A - Keep MySQL on GoDaddy, migrate frontend only

---

## ✅ Existing Foundation (2026-pct-website)

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js 16 + React 19 | ✅ Ready | Modern stack |
| Admin Auth System | ✅ Ready | Cookie-based, 24hr sessions |
| Admin Dashboard | ✅ Ready | Tabs for Fees/Rates |
| shadcn/ui Components | ✅ Ready | Full component library |
| Tailwind CSS | ✅ Ready | Configured |
| SendGrid | ✅ Ready | Email notifications |
| PostgreSQL (Vercel) | ✅ Ready | For FinCEN/calc data |
| Tessa AI | ✅ Ready | AI chatbot |

### What Needs to Be Added

| Feature | Priority | Effort |
|---------|----------|--------|
| MySQL client (mysql2) | High | 1 hour |
| VCard pages (`/team/[slug]`) | High | 1 day |
| SMS Studio admin tab | High | 1 day |
| Lead Forms admin tab | High | 4 hours |
| Assessments admin tab | High | 4 hours |
| Farm Request form (`/farm-request`) | High | 4 hours |
| Assessment form (`/assessment`) | High | 4 hours |
| Employee management | Medium | 1 day |
| Email Marketing tab | Medium | 2 days |

---

## 📊 Current System Inventory

### 1. Core Components

| Component | Tech | Files | Priority |
|-----------|------|-------|----------|
| VCard Templates | PHP | 4 templates | High |
| Admin Panel | PHP | 15+ files | High |
| Email Marketing | PHP + Python | 200+ files | Medium |
| SMS Studio | PHP (admin) | 1 file | High |
| Lead Forms | PHP + HTML | 2 files | High |
| Assessments | PHP + HTML | 2 files | High |
| Market Reports | PHP + Python | 30+ files | Medium |
| API Endpoints | PHP | 10+ files | High |

### 2. External Services (NO MIGRATION NEEDED)

| Service | Purpose | Status |
|---------|---------|--------|
| **Render.com API** | SMS/MMS via Twilio | ✅ Keep as-is |
| **MySQL Database** | Data storage | ⚠️ Decision needed |
| **Mailchimp** | Email campaigns | ✅ Keep as-is |
| **SimplyRETS** | Market data | ✅ Keep as-is |
| **Twilio** | SMS/MMS | ✅ Keep as-is |
| **OpenAI (Tessa)** | AI content | ✅ Keep as-is |

---

## 🎯 Migration Strategy

### Option A: Hybrid (Recommended)
Keep MySQL on GoDaddy, move frontend/API to Vercel

**Pros:**
- No database migration required
- Faster implementation
- Lower risk
- Can migrate DB later if needed

**Cons:**
- Slight latency to external DB
- GoDaddy hosting still needed for DB

### Option B: Full Migration
Move everything to Vercel + Neon/Planetscale (Postgres)

**Pros:**
- Single platform
- Cancel GoDaddy hosting
- Better performance

**Cons:**
- Database schema conversion (MySQL → Postgres)
- More complex migration
- Need to update Render.com API DB connection

### Option C: Gradual Migration
Migrate one component at a time, proxy between old/new

**Pros:**
- Lowest risk
- Test each piece thoroughly
- Easy rollback

**Cons:**
- Longer timeline
- Temporary complexity

---

## 📁 Proposed Vercel Project Structure

```
pct-vcard-vercel/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   │
│   ├── [slug]/                  # VCard pages (dynamic routes)
│   │   └── page.tsx             # Individual vCard: /john-doe
│   │
│   ├── admin/                   # Admin panel
│   │   ├── layout.tsx           # Admin layout (sidebar, auth check)
│   │   ├── page.tsx             # Dashboard
│   │   ├── sms-studio/          # SMS distribution
│   │   │   └── page.tsx
│   │   ├── email-marketing/     # Email campaigns
│   │   │   └── page.tsx
│   │   ├── lead-forms/          # Lead management
│   │   │   └── page.tsx
│   │   ├── assessments/         # Assessment viewer
│   │   │   └── page.tsx
│   │   ├── settings/            # System settings
│   │   │   └── page.tsx
│   │   └── employees/           # Employee management
│   │       └── page.tsx
│   │
│   ├── farm-request/            # Public lead form
│   │   └── page.tsx
│   │
│   ├── assessment/              # Public assessment form
│   │   └── page.tsx
│   │
│   └── api/                     # API Routes (serverless)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── session/route.ts
│       ├── employees/
│       │   ├── route.ts         # GET all, POST new
│       │   └── [id]/route.ts    # GET/PUT/DELETE one
│       ├── vcard/
│       │   ├── route.ts
│       │   └── [slug]/route.ts
│       ├── farm-request/
│       │   └── route.ts         # Form submissions
│       ├── assessment/
│       │   └── route.ts         # Assessment submissions
│       ├── sms/
│       │   ├── send/route.ts    # Proxy to Render API
│       │   └── health/route.ts
│       ├── email/
│       │   ├── send/route.ts
│       │   └── templates/route.ts
│       └── qr/
│           └── [slug]/route.ts  # Generate QR codes
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── admin/                   # Admin-specific components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── DataTable.tsx
│   ├── vcard/                   # VCard components
│   │   ├── VCardTemplate.tsx
│   │   ├── QRCode.tsx
│   │   └── SocialLinks.tsx
│   └── forms/                   # Form components
│       ├── FarmRequestForm.tsx
│       └── AssessmentForm.tsx
│
├── lib/                          # Utilities & config
│   ├── db.ts                    # MySQL2 connection
│   ├── auth.ts                  # NextAuth config
│   ├── twilio.ts                # Twilio client
│   ├── mailchimp.ts             # Mailchimp client
│   └── utils.ts                 # Helper functions
│
├── public/                       # Static assets
│   ├── images/
│   ├── logos/
│   └── icons/
│
├── types/                        # TypeScript types
│   ├── employee.ts
│   ├── vcard.ts
│   └── assessment.ts
│
├── middleware.ts                 # Auth middleware
├── .env.local                   # Environment variables
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔄 Component Migration Details

### 1. VCard System → Next.js Dynamic Routes

**Current:** `vcard-new/templates/vcard.php`  
**New:** `app/[slug]/page.tsx`

```tsx
// app/[slug]/page.tsx
import { db } from '@/lib/db';
import VCardTemplate from '@/components/vcard/VCardTemplate';

export default async function VCardPage({ params }: { params: { slug: string } }) {
  const employee = await db.query('SELECT * FROM employees WHERE slug = ?', [params.slug]);
  if (!employee) return notFound();
  
  return <VCardTemplate employee={employee} />;
}
```

**Migration Tasks:**
- [ ] Convert PHP template to React component
- [ ] Port QR code generation (use `qrcode` npm package)
- [ ] Handle VCF file downloads via API route
- [ ] Port analytics tracking
- [ ] Test all 87+ employee vCards

### 2. Admin Panel → Next.js + Auth

**Current:** `vcard-new/admin/*.php`  
**New:** `app/admin/*`

**Auth Strategy:** NextAuth.js with credentials provider

```tsx
// lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await db.query(
          'SELECT * FROM admin_users WHERE email = ?',
          [credentials.email]
        );
        if (user && verifyPassword(credentials.password, user.password)) {
          return { id: user.id, email: user.email, role: user.role };
        }
        return null;
      }
    })
  ],
  callbacks: {
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  }
};
```

**Migration Tasks:**
- [ ] Set up NextAuth.js
- [ ] Convert admin dashboard to React
- [ ] Port employee management CRUD
- [ ] Port settings page
- [ ] Implement role-based access control

### 3. SMS Studio → React + Existing Render API

**Current:** `vcard-new/admin/social-media-sms-v2.php`  
**New:** `app/admin/sms-studio/page.tsx`

**Key:** The Render.com API stays unchanged. Only the admin UI migrates.

```tsx
// app/api/sms/send/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  
  // Proxy to Render.com API
  const response = await fetch('https://main-website-files.onrender.com/api/send-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return Response.json(await response.json());
}
```

**Migration Tasks:**
- [ ] Convert PHP admin page to React
- [ ] File upload handling (Vercel Blob or external)
- [ ] Keep Render.com API integration
- [ ] Port all three tabs (MMS, Lead Forms, Assessments)

### 4. Lead Forms → Static + API Route

**Current:** `vcard-new/farm-request/index.html` + `api.php`  
**New:** `app/farm-request/page.tsx` + `app/api/farm-request/route.ts`

**Migration Tasks:**
- [ ] Convert HTML form to React component
- [ ] Port PHP handler to API route
- [ ] Keep MySQL storage
- [ ] Keep email notifications (use Nodemailer or Resend)

### 5. Assessment System → React + API Route

**Current:** `vcard-new/assessment/index.html` + `api.php`  
**New:** `app/assessment/page.tsx` + `app/api/assessment/route.ts`

**Migration Tasks:**
- [ ] Convert wizard form to React (multi-step)
- [ ] Port PHP handler to API route
- [ ] Score calculation in TypeScript
- [ ] Keep MySQL storage

### 6. Email Marketing → React + TinyMCE

**Current:** `vcard-new/admin/email-marketing.php`  
**New:** `app/admin/email-marketing/page.tsx`

**Key Dependencies:**
- TinyMCE React component (`@tinymce/tinymce-react`)
- Mailchimp Marketing API (`@mailchimp/mailchimp_marketing`)

**Migration Tasks:**
- [ ] Install TinyMCE React wrapper
- [ ] Port template library
- [ ] Convert merge tag system to TypeScript
- [ ] Keep AI content generator (call OpenAI API)
- [ ] Port Mailchimp integration

---

## 🗄️ Database Strategy

### Option A: Keep MySQL on GoDaddy (Recommended for Phase 1)

```typescript
// lib/db.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,        // 132.148.215.120
  port: 3306,
  user: process.env.DB_USER,        // pctcursor1
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,    // pct_vcard
  waitForConnections: true,
  connectionLimit: 10,
});

export const db = {
  query: async (sql: string, params?: any[]) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
};
```

**Required:** Whitelist Vercel IP ranges in GoDaddy:
- `76.76.21.0/24`
- Various regional IPs (dynamic)

**Better Option:** Use a connection pooler like PlanetScale Boost or set up a direct connection.

### Option B: Migrate to Neon (Postgres)

If you want to fully leave GoDaddy:

1. Export MySQL dump
2. Convert schema to Postgres (minor syntax changes)
3. Import to Neon
4. Update Render.com API environment variables
5. Update all queries (mostly compatible)

---

## 🔐 Environment Variables (Vercel)

```env
# Database
DB_HOST=132.148.215.120
DB_PORT=3306
DB_USER=pctcursor1
DB_PASSWORD=AlphaOmega637#
DB_NAME=pct_vcard

# NextAuth
NEXTAUTH_URL=https://vcard.pct.com
NEXTAUTH_SECRET=your-random-secret

# Twilio (for direct calls if needed)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your-new-token
TWILIO_FROM_NUMBER=+18186965791

# Render API
RENDER_API_URL=https://main-website-files.onrender.com

# Mailchimp
MAILCHIMP_API_KEY=your-key
MAILCHIMP_SERVER=us5

# OpenAI (Tessa Proxy)
OPENAI_API_URL=your-tessa-endpoint

# TinyMCE
NEXT_PUBLIC_TINYMCE_API_KEY=your-key

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=your-token
```

---

## 📅 Migration Timeline

### Phase 1: Foundation (Week 1)
- [ ] Set up new Next.js project in Vercel
- [ ] Configure database connection
- [ ] Set up NextAuth.js authentication
- [ ] Create admin layout shell
- [ ] Test database connectivity

### Phase 2: Core Features (Week 2)
- [ ] Migrate VCard templates to React
- [ ] Port QR code generation
- [ ] Migrate SMS Studio admin UI
- [ ] Connect to existing Render.com API
- [ ] Migrate Lead Forms (form + API)

### Phase 3: Secondary Features (Week 3)
- [ ] Migrate Assessment system
- [ ] Migrate Email Marketing with TinyMCE
- [ ] Port employee management
- [ ] Migrate settings page
- [ ] Port market reports (if needed)

### Phase 4: Testing & Cutover (Week 4)
- [ ] Full integration testing
- [ ] Performance optimization
- [ ] DNS cutover (subdomain first: vcard.pct.com)
- [ ] Monitor for issues
- [ ] Final production switch

---

## 🎨 Design System

Use existing PCT branding with modern implementation:

```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'pct-navy': '#0a1628',
        'pct-gold': '#c5a572',
        'pct-blue': '#1e3a5f',
        'pct-light': '#f5f7fa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      }
    }
  }
};
```

**Component Library:** shadcn/ui (customizable, accessible)

---

## ⚠️ Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Database connection issues | Test thoroughly with Vercel Edge |
| Auth token migration | Keep session table, test login |
| File uploads | Use Vercel Blob or keep on GoDaddy |
| Email delivery | Test all notification emails |
| SMS integration | Render API stays unchanged |
| SEO impact | Proper redirects, same URLs |

---

## 🔗 URL Mapping

| Old URL | New URL | Notes |
|---------|---------|-------|
| `pct.com/vcard-new/[slug]` | `vcard.pct.com/[slug]` | Subdomain |
| `pct.com/vcard-new/admin/` | `vcard.pct.com/admin/` | Same paths |
| `pct.com/vcard-new/farm-request/` | `vcard.pct.com/farm-request/` | Same paths |
| `pct.com/vcard-new/assessment/` | `vcard.pct.com/assessment/` | Same paths |

**Option:** Keep `/vcard-new/` path prefix using rewrites if needed.

---

## ✅ Success Criteria

1. All 87+ employee vCards render correctly
2. Admin panel fully functional (all tabs)
3. SMS Studio sends successfully via Render API
4. Lead forms submit and notify reps
5. Assessments submit and store correctly
6. Email marketing editor works with TinyMCE
7. Mobile responsive on all pages
8. Auth works with existing admin credentials
9. No data loss during migration
10. Performance equal or better than current

---

## 📝 Next Steps

1. **Confirm strategy** - Which option (A/B/C)?
2. **Show me your Vercel repo** - I'll assess the existing setup
3. **Create project structure** - Initialize Next.js app
4. **Start Phase 1** - Foundation and auth

---

## 🎯 Implementation Checklist (2026-pct-website)

### Phase 1: Database Connection (Day 1)

```bash
# Install MySQL client
cd 2026-pct-website
npm install mysql2
```

**Files to Create:**

- [ ] `lib/mysql.ts` - MySQL connection pool for GoDaddy

```typescript
// lib/mysql.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,        // 132.148.215.120
  port: 3306,
  user: process.env.MYSQL_USER,        // pctcursor1
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE, // pct_vcard
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export default pool;
```

**Environment Variables (Vercel Dashboard):**
```env
MYSQL_HOST=132.148.215.120
MYSQL_USER=pctcursor1
MYSQL_PASSWORD=AlphaOmega637#
MYSQL_DATABASE=pct_vcard
```

---

### Phase 2: VCard System (Day 2-3)

**Files to Create:**

- [ ] `app/team/[slug]/page.tsx` - Individual VCard pages
- [ ] `app/team/page.tsx` - Team directory
- [ ] `app/api/vcard/[slug]/route.ts` - VCard API
- [ ] `app/api/vcard/[slug]/download/route.ts` - VCF file download
- [ ] `app/api/qr/[slug]/route.ts` - QR code generation
- [ ] `components/vcard/VCardTemplate.tsx` - VCard layout
- [ ] `components/vcard/QRCode.tsx` - QR display
- [ ] `components/vcard/SocialLinks.tsx` - Social icons
- [ ] `types/employee.ts` - TypeScript types

**URL Structure:**
| Old | New |
|-----|-----|
| `pct.com/vcard-new/john-doe` | `pct.com/team/john-doe` |

---

### Phase 3: Admin Panel Extensions (Day 4-5)

**Files to Modify:**

- [ ] `app/admin/page.tsx` - Add new tabs (SMS, Leads, Assessments, Employees)

**Files to Create:**

- [ ] `app/admin/sms-studio/page.tsx` - SMS distribution interface
- [ ] `app/admin/lead-forms/page.tsx` - Lead management
- [ ] `app/admin/assessments/page.tsx` - Assessment viewer
- [ ] `app/admin/employees/page.tsx` - Employee CRUD
- [ ] `components/admin/SMSStudio.tsx` - MMS upload & send
- [ ] `components/admin/LeadFormsPanel.tsx` - Lead viewing
- [ ] `components/admin/AssessmentsPanel.tsx` - Assessment viewer
- [ ] `components/admin/EmployeeTable.tsx` - Employee list

**API Routes:**

- [ ] `app/api/admin/employees/route.ts` - CRUD employees
- [ ] `app/api/admin/sms/send/route.ts` - Proxy to Render API
- [ ] `app/api/admin/sms/health/route.ts` - API health check
- [ ] `app/api/admin/leads/route.ts` - Get leads
- [ ] `app/api/admin/assessments/route.ts` - Get assessments

---

### Phase 4: Public Forms (Day 6)

**Files to Create:**

- [ ] `app/farm-request/page.tsx` - Lead collection form
- [ ] `app/assessment/page.tsx` - Tool competency assessment
- [ ] `app/api/farm-request/route.ts` - Form submission handler
- [ ] `app/api/assessment/route.ts` - Assessment submission handler

**Features:**
- Mobile-first design
- Rep tracking via `?rep=` URL parameter
- Email notifications via SendGrid
- MySQL storage

---

### Phase 5: Email Marketing (Day 7-8) - Optional

**Files to Create:**

- [ ] `app/admin/email-marketing/page.tsx` - Campaign builder
- [ ] `components/admin/EmailEditor.tsx` - TinyMCE wrapper

**Dependencies:**
```bash
npm install @tinymce/tinymce-react
```

---

## 📁 Final Project Structure

```
2026-pct-website/
├── app/
│   ├── admin/
│   │   ├── page.tsx                 # Dashboard (extend with tabs)
│   │   ├── login/page.tsx           # ✅ Exists
│   │   ├── sms-studio/page.tsx      # NEW
│   │   ├── lead-forms/page.tsx      # NEW
│   │   ├── assessments/page.tsx     # NEW
│   │   └── employees/page.tsx       # NEW
│   │
│   ├── team/                        # VCard system
│   │   ├── page.tsx                 # NEW - Team directory
│   │   └── [slug]/page.tsx          # NEW - Individual vCards
│   │
│   ├── farm-request/                # Lead form
│   │   └── page.tsx                 # NEW
│   │
│   ├── assessment/                  # Assessment form
│   │   └── page.tsx                 # NEW
│   │
│   └── api/
│       ├── admin/                   # ✅ Exists (extend)
│       │   ├── employees/route.ts   # NEW
│       │   ├── sms/...              # NEW
│       │   ├── leads/route.ts       # NEW
│       │   └── assessments/route.ts # NEW
│       ├── vcard/[slug]/route.ts    # NEW
│       ├── qr/[slug]/route.ts       # NEW
│       ├── farm-request/route.ts    # NEW
│       └── assessment/route.ts      # NEW
│
├── components/
│   ├── admin/                       # NEW folder
│   │   ├── SMSStudio.tsx
│   │   ├── LeadFormsPanel.tsx
│   │   └── AssessmentsPanel.tsx
│   ├── vcard/                       # NEW folder
│   │   ├── VCardTemplate.tsx
│   │   ├── QRCode.tsx
│   │   └── SocialLinks.tsx
│   └── ui/                          # ✅ Exists
│
├── lib/
│   ├── mysql.ts                     # NEW - GoDaddy connection
│   ├── admin-auth.ts                # ✅ Exists
│   └── utils.ts                     # ✅ Exists
│
└── types/
    └── employee.ts                  # NEW
```

---

## 🔗 URL Redirects (Old → New)

Add to `next.config.mjs`:

```javascript
async redirects() {
  return [
    {
      source: '/vcard-new/:slug',
      destination: '/team/:slug',
      permanent: true,
    },
    {
      source: '/vcard-new/farm-request',
      destination: '/farm-request',
      permanent: true,
    },
    {
      source: '/vcard-new/assessment',
      destination: '/assessment',
      permanent: true,
    },
  ];
}
```

---

## 🚀 Quick Start Commands

```bash
# 1. Navigate to project
cd "C:\Users\gerar\Marketing Department Dropbox\PacificCoastTitleCompany\website-files\2026-pct-website"

# 2. Install MySQL client
npm install mysql2

# 3. Add environment variables to .env.local
echo "MYSQL_HOST=132.148.215.120" >> .env.local
echo "MYSQL_USER=pctcursor1" >> .env.local
echo "MYSQL_PASSWORD=AlphaOmega637#" >> .env.local
echo "MYSQL_DATABASE=pct_vcard" >> .env.local

# 4. Start development
npm run dev
```

---

**Document Created:** February 27, 2026  
**Author:** AI Assistant  
**Status:** ✅ READY TO IMPLEMENT  
**Strategy:** Option A (Keep MySQL on GoDaddy)
