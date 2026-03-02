// ============================================================
// PCT VCard → Render PostgreSQL Migration Seed Script
// Converts MySQL pct_vcard data to PostgreSQL tables.
// Run once: node scripts/seed-vcard-db.js
// ============================================================

const { Client } = require('pg')

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://pct_calculator_db_user:Lp6b4uVGT2ZycqA8eyZ1zAQHY1i05syj@dpg-d5nueanpm1nc73aueaj0-a.oregon-postgres.render.com/pct_calculator_db'

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// ── R2 photo resolver ─────────────────────────────────────────
const R2_BASE = 'https://pub-dbe01c2b9ef0457c979ef76b8d8618f3.r2.dev/sales-rep-photos/WebThumb'
function resolvePhoto(firstName, photoFile) {
  // Use R2 bucket — just FirstName.png
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
  return `${R2_BASE}/${name}.png`
}

async function run() {
  await client.connect()
  console.log('✅ Connected to Render PostgreSQL')

  // ── DDL ────────────────────────────────────────────────────
  console.log('\n📐 Creating tables...')

  await client.query(`
    CREATE TABLE IF NOT EXISTS vcard_offices (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      street      VARCHAR(255),
      city        VARCHAR(100),
      state       VARCHAR(2),
      zip         VARCHAR(10),
      phone       VARCHAR(20),
      region      VARCHAR(10),
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('  ✓ vcard_offices')

  await client.query(`
    CREATE TABLE IF NOT EXISTS vcard_departments (
      id               SERIAL PRIMARY KEY,
      name             VARCHAR(100) NOT NULL,
      color            VARCHAR(7)   NOT NULL,
      background_image VARCHAR(255),
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('  ✓ vcard_departments')

  await client.query(`
    CREATE TABLE IF NOT EXISTS vcard_employees (
      id                      SERIAL PRIMARY KEY,
      slug                    VARCHAR(100) NOT NULL UNIQUE,
      first_name              VARCHAR(100) NOT NULL,
      last_name               VARCHAR(100) NOT NULL,
      title                   VARCHAR(150),
      department_id           INTEGER REFERENCES vcard_departments(id),
      office_id               INTEGER REFERENCES vcard_offices(id),
      email                   VARCHAR(255),
      phone                   VARCHAR(30),
      mobile                  VARCHAR(30),
      sms_code                VARCHAR(10),
      bio                     TEXT,
      photo_url               TEXT,
      languages               TEXT,   -- JSON array string
      specialties             TEXT,   -- JSON array string
      linkedin                VARCHAR(255),
      facebook                VARCHAR(255),
      instagram               VARCHAR(255),
      twitter                 VARCHAR(255),
      website                 VARCHAR(255),
      background_image        VARCHAR(255),
      theme_color             VARCHAR(20) DEFAULT 'orange',
      active                  BOOLEAN DEFAULT TRUE,
      featured                BOOLEAN DEFAULT FALSE,
      show_qr                 BOOLEAN DEFAULT TRUE,
      show_social             BOOLEAN DEFAULT TRUE,
      show_bio                BOOLEAN DEFAULT TRUE,
      analytics_enabled       BOOLEAN DEFAULT TRUE,
      view_count              INTEGER DEFAULT 0,
      save_count              INTEGER DEFAULT 0,
      -- Website / rep-page fields
      website_active          BOOLEAN DEFAULT FALSE,
      website_bio             TEXT,
      website_specialties     TEXT,
      mailchimp_form_code     TEXT,
      mailchimp_audience_id   VARCHAR(50),
      website_hero_image      VARCHAR(255),
      website_custom_title    VARCHAR(200),
      website_meta_description TEXT,
      created_at              TIMESTAMPTZ DEFAULT NOW(),
      updated_at              TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('  ✓ vcard_employees')

  await client.query(`
    CREATE TABLE IF NOT EXISTS vcard_admin_users (
      id            SERIAL PRIMARY KEY,
      username      VARCHAR(50)  NOT NULL UNIQUE,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role          VARCHAR(20)  NOT NULL DEFAULT 'manager',
      office_id     INTEGER REFERENCES vcard_offices(id),
      first_name    VARCHAR(100),
      last_name     VARCHAR(100),
      active        BOOLEAN DEFAULT TRUE,
      last_login    TIMESTAMPTZ,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('  ✓ vcard_admin_users')

  await client.query(`
    CREATE TABLE IF NOT EXISTS vcard_farm_requests (
      id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      list_type         VARCHAR(50) NOT NULL,
      city_area         VARCHAR(100) NOT NULL,
      property_address  VARCHAR(255),
      radius            VARCHAR(20),
      list_size         VARCHAR(20) NOT NULL,
      output_formats    JSONB,
      notes             TEXT,
      contact_name      VARCHAR(100) NOT NULL,
      contact_email     VARCHAR(100) NOT NULL,
      contact_phone     VARCHAR(20),
      rep_id            VARCHAR(20),
      rep_name          VARCHAR(100),
      rep_email         VARCHAR(100),
      source_channel    VARCHAR(20) DEFAULT 'sms',
      user_agent        TEXT,
      status            VARCHAR(20) DEFAULT 'pending',
      notification_sent BOOLEAN DEFAULT FALSE,
      submitted_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('  ✓ vcard_farm_requests')

  await client.query(`
    CREATE TABLE IF NOT EXISTS vcard_employee_activity (
      id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      employee_id   INTEGER REFERENCES vcard_employees(id),
      activity_type VARCHAR(20) NOT NULL,
      ip_address    VARCHAR(45),
      user_agent    TEXT,
      metadata      TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('  ✓ vcard_employee_activity')

  await client.query(`
    CREATE TABLE IF NOT EXISTS vcard_simple_links (
      id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      label          VARCHAR(100) NOT NULL,
      url            VARCHAR(500) NOT NULL,
      icon           VARCHAR(50)  DEFAULT '🔗',
      distribution   VARCHAR(20)  NOT NULL DEFAULT 'global',
      branch_id      INTEGER,
      category       VARCHAR(50)  DEFAULT 'other',
      display_order  INTEGER DEFAULT 0,
      active         BOOLEAN DEFAULT TRUE,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('  ✓ vcard_simple_links')

  // ── Indexes ─────────────────────────────────────────────────
  await client.query(`CREATE INDEX IF NOT EXISTS idx_vcard_employees_slug   ON vcard_employees(slug);`)
  await client.query(`CREATE INDEX IF NOT EXISTS idx_vcard_employees_active  ON vcard_employees(active);`)
  await client.query(`CREATE INDEX IF NOT EXISTS idx_vcard_employees_office  ON vcard_employees(office_id);`)
  await client.query(`CREATE INDEX IF NOT EXISTS idx_vcard_activity_employee ON vcard_employee_activity(employee_id);`)
  console.log('  ✓ indexes')

  // ── Seed: Offices ────────────────────────────────────────────
  console.log('\n🌍 Seeding offices...')
  await client.query(`
    INSERT INTO vcard_offices (id, name, street, city, state, zip, phone, region)
    VALUES
      (1, 'Glendale Office',       '516 Burchett St.',                          'Glendale', 'CA', '91203', '(818) 543-2130', 'GL'),
      (2, 'Orange County Office',  '1111 E. Katella Ave. Ste. 120',             'Orange',   'CA', '92867', '(714) 516-6700', 'OC'),
      (3, 'Inland Empire Branch',  '3200 Inland Empire Blvd. Suite #235',       'Ontario',  'CA', '91764', '(951) 528-5915', 'IE')
    ON CONFLICT (id) DO NOTHING;
  `)
  // Reset sequence
  await client.query(`SELECT setval('vcard_offices_id_seq', (SELECT MAX(id) FROM vcard_offices));`)
  console.log('  ✓ 3 offices')

  // ── Seed: Departments ────────────────────────────────────────
  console.log('\n🏢 Seeding departments...')
  await client.query(`
    INSERT INTO vcard_departments (id, name, color)
    VALUES
      (1, 'Sales',          '#f26b2b'),
      (2, 'Escrow',         '#2c5aa0'),
      (3, 'Title',          '#28a745'),
      (4, 'Administration', '#6c757d'),
      (5, 'Marketing',      '#00eb3b')
    ON CONFLICT (id) DO NOTHING;
  `)
  await client.query(`SELECT setval('vcard_departments_id_seq', (SELECT MAX(id) FROM vcard_departments));`)
  console.log('  ✓ 5 departments')

  // ── Seed: Employees ─────────────────────────────────────────
  console.log('\n👥 Seeding employees...')

  const employees = [
    { id:  1, slug: 'anthony',           first: 'Anthony',  last: 'Zamora',     title: 'Sales Manager',                    dept: 1, office: 1, email: 'azamora@pct.com',     mobile: '(562) 631-6100', sms: 'C-9',  langs: '["English","Spanish"]',   specs: '["Commercial Title","Residential Escrow","1031 Exchanges"]',                            active: true,  featured: true,  website: false },
    { id:  2, slug: 'linda',             first: 'Linda',    last: 'Ruiz',       title: 'Account Executive',                dept: 1, office: 1, email: 'lruiz@pct.com',       mobile: '(714) 308-6000', sms: 'C-19', langs: '["English","Spanish"]',   specs: '["Residential Title","Refinancing","First-Time Buyers"]',                               active: true,  featured: false, website: false },
    { id:  3, slug: 'david',             first: 'David',    last: 'Gomez',      title: 'Senior Account Executive',         dept: 1, office: 1, email: 'dgomez@pct.com',      mobile: '(562) 619-6062', sms: 'C-2',  langs: '["English","Spanish"]',   specs: '["Residential Escrow","Commercial Escrow","Refinancing"]',                              active: true,  featured: false, website: false },
    { id:  4, slug: 'simon',             first: 'Simon',    last: 'Wu',         title: 'Account Executive',                dept: 1, office: 1, email: 'swu@pct.com',         mobile: '(626) 589-8822', sms: 'C-12', langs: '["English","Mandarin"]',  specs: '["Title Research","Title Insurance","Commercial Properties"]',                          active: true,  featured: false, website: false },
    { id:  5, slug: 'angeline-ahn',      first: 'Angeline', last: 'Ahn',        title: 'Vice President',                   dept: 1, office: 2, email: 'awu@pct.com',         mobile: '(949) 545-8859', sms: 'C-23', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: true  },
    { id:  6, slug: 'christy-coffey',    first: 'Christy',  last: 'Coffey',     title: 'Account Executive',                dept: 1, office: 2, email: 'ccoffey@pct.com',     mobile: '(949) 887-0338', sms: 'C-24', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: true  },
    { id:  7, slug: 'corey-velasquez',   first: 'Corey',    last: 'Velasquez',  title: 'Account Executive',                dept: 1, office: 1, email: 'cvelasquez@pct.com',  mobile: '(626) 392-7993', sms: 'C-11', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: true  },
    { id:  9, slug: 'felicia-pantoja',   first: 'Felicia',  last: 'Pantoja',    title: 'Account Executive',                dept: 1, office: 1, email: 'fpantoja@pct.com',    mobile: '(562) 552-1229', sms: null,   langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 10, slug: 'justin-nouri',      first: 'Justin',   last: 'Nouri',      title: 'Account Executive',                dept: 1, office: 1, email: 'jnouri@pct.com',      mobile: '(818) 231-7265', sms: 'C-5',  langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 12, slug: 'lou-morreale',      first: 'Lou',      last: 'Morreale',   title: 'Account Executive',                dept: 1, office: 1, email: 'lmorreale@pct.com',   mobile: '(818) 808-8466', sms: 'C-13', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 13, slug: 'michael-nouri',     first: 'Michael',  last: 'Nouri',      title: 'Account Executive',                dept: 1, office: 1, email: 'mnouri@pct.com',      mobile: '(818) 979-5150', sms: 'C-7',  langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 14, slug: 'neil-torquato',     first: 'Neil',     last: 'Torquato',   title: 'SVP Regional Manager',             dept: 1, office: 2, email: 'neil@pct.com',        mobile: '(949) 278-0118', sms: 'C-29', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: true  },
    { id: 15, slug: 'nick-watt',         first: 'Nick',     last: 'Watt',       title: 'Account Executive',                dept: 1, office: 1, email: 'nwatt@pct.com',       mobile: '(714) 747-5189', sms: 'C-22', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 16, slug: 'richard-bohn',      first: 'Richard',  last: 'Bohn',       title: 'AVP',                              dept: 1, office: 2, email: 'rbohn@pct.com',       mobile: '(760) 519-3115', sms: 'C-20', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: true  },
    { id: 17, slug: 'rouanne-garcia',    first: 'Rouanne',  last: 'Garcia',     title: 'Account Executive',                dept: 1, office: 1, email: 'rgarcia@pct.com',     mobile: '(626) 500-5847', sms: 'C-10', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 18, slug: 'saeed-ghaffari',    first: 'Saeed',    last: 'Ghaffari',   title: 'Account Executive',                dept: 1, office: 1, email: 'sghaffari@pct.com',   mobile: '(714) 555-0126', sms: 'C-26', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 19, slug: 'sandra-millar',     first: 'Sandra',   last: 'Millar',     title: 'Account Executive',                dept: 1, office: 1, email: 'smillar@pct.com',     mobile: '(714) 323-2360', sms: 'C-18', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 21, slug: 'sonia-flores',      first: 'Sonia',    last: 'Flores',     title: 'Account Executive',                dept: 1, office: 1, email: 'sflores@pct.com',     mobile: '(714) 943-7149', sms: 'C-21', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 22, slug: 'veronica-sanchez',  first: 'Veronica', last: 'Sanchez',    title: 'Account Executive',                dept: 1, office: 1, email: 'vsanchez@pct.com',    mobile: '(818) 568-8227', sms: 'C-14', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 23, slug: 'tmg-team',          first: 'Jorge',    last: 'Mesa',       title: 'Sales Manager',                    dept: 1, office: 1, email: 'jmesa@pct.com',       mobile: '(562) 343-3725', sms: 'C-30', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: true  },
    { id: 24, slug: 'title-gals',        first: 'Jennifer', last: 'Simms',      title: 'Area Manager',                     dept: 1, office: 1, email: 'jsimms@pct.com',      mobile: '(714) 600-5136', sms: 'C-17', langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 25, slug: 'title-boss',        first: 'Hugo',     last: 'Lopez',      title: 'Sales Manager',                    dept: 1, office: 3, email: 'teamlopez@pct.com',   mobile: '(951) 858-6277', sms: 'C-4',  langs: '["English"]',             specs: '["Title Insurance","Escrow Services","Real Estate Transactions"]',                      active: true,  featured: false, website: false },
    { id: 47, slug: 'jerry-hernandez',   first: 'Jerry',    last: 'Hernandez',  title: 'Director of Product Development',  dept: 4, office: 1, email: 'ghernandez@pct.com',  mobile: '(213) 309-7286', sms: 'C-28', langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: true  },
    { id: 48, slug: 'justin-dominguez',  first: 'Justin',   last: 'Dominguez',  title: 'Marketing Assistant',              dept: 4, office: 2, email: 'jdominguez@pct.com',  mobile: '(562) 000-0000', sms: null,   langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 50, slug: 'izzy-lopez',        first: 'Izzy',     last: 'Lopez',      title: 'Account Executive Inland Empire',  dept: 1, office: 3, email: 'izzy4title@gmail.com',mobile: '(951) 768-2727', sms: null,   langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 51, slug: 'jesse-lopez',       first: 'Jesse',    last: 'Lopez',      title: 'Account Executive',                dept: 1, office: 3, email: 'jesse4title@gmail.com',mobile: '(951) 316-4575',sms: 'C-4',  langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 52, slug: 'nicole-ahn',        first: 'Nicole',   last: 'Ahn',        title: 'VP, Account Director',             dept: 1, office: 1, email: 'titleteam@pct.com',   mobile: '(626) 523-5000', sms: 'C-16', langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 53, slug: 'edgar-rivas',       first: 'Edgar',    last: 'Rivas',      title: 'Strategic Relations',              dept: 1, office: 1, email: 'erivas@pct.com',      mobile: '(626) 625-6704', sms: 'C-8',  langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 54, slug: 'al-alfonso',        first: 'Al',       last: 'Alfonso',    title: 'President',                        dept: 4, office: 2, email: 'al@pct.com',          mobile: '(818) 730-1707', sms: null,   langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 55, slug: 'jane-phan',         first: 'Jane',     last: 'Phan',       title: 'Account Executive',                dept: 1, office: 2, email: 'jphan@pct.com',       mobile: '(714) 907-2795', sms: 'C-25', langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 56, slug: 'ronnie-castillo',   first: 'Ronnie',   last: 'Castillo',   title: 'Account Executive',                dept: 1, office: 1, email: 'rcastillo@pct.com',   mobile: '(909) 260-6065', sms: 'C-6',  langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 57, slug: 'laurie-briggs',     first: 'Laurie',   last: 'Briggs',     title: 'Account Executive',                dept: 1, office: 2, email: 'lbriggs@pct.com',     mobile: '(949) 370-9064', sms: 'C-27', langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 58, slug: 'michael-caballero', first: 'Michael',  last: 'Caballero',  title: 'Account Executive',                dept: 1, office: 3, email: 'mcaballero@pct.com',  mobile: '(909) 229-3428', sms: 'C-15', langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
    { id: 59, slug: 'janelly-marquez',   first: 'Janelly',  last: 'Marquez',    title: 'Area Manager',                     dept: 1, office: 1, email: 'jmarquez@pct.com',    mobile: '(626) 241-4888', sms: 'C-31', langs: null,                     specs: null,                                                                                     active: true,  featured: false, website: false },
  ]

  const DEFAULT_BIO = `As a title professional, I'm dedicated to making every real estate transaction seamless, secure, and stress-free. I work closely with agents, escrow officers, and clients to ensure that potential challenges are addressed early, timelines are protected, and closings happen without unnecessary surprises.`

  for (const emp of employees) {
    const photoUrl = resolvePhoto(emp.first, null)
    await client.query(`
      INSERT INTO vcard_employees
        (id, slug, first_name, last_name, title, department_id, office_id,
         email, mobile, sms_code, bio, photo_url, languages, specialties,
         facebook, instagram, website,
         active, featured, website_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      ON CONFLICT (slug) DO UPDATE SET
        first_name    = EXCLUDED.first_name,
        last_name     = EXCLUDED.last_name,
        title         = EXCLUDED.title,
        department_id = EXCLUDED.department_id,
        office_id     = EXCLUDED.office_id,
        email         = EXCLUDED.email,
        mobile        = EXCLUDED.mobile,
        sms_code      = EXCLUDED.sms_code,
        bio           = EXCLUDED.bio,
        photo_url     = EXCLUDED.photo_url,
        languages     = EXCLUDED.languages,
        specialties   = EXCLUDED.specialties,
        active        = EXCLUDED.active,
        featured      = EXCLUDED.featured,
        website_active= EXCLUDED.website_active,
        updated_at    = NOW()
    `, [
      emp.id, emp.slug,
      emp.first.charAt(0).toUpperCase() + emp.first.slice(1).toLowerCase(),
      emp.last.charAt(0).toUpperCase() + emp.last.slice(1).toLowerCase(),
      emp.title, emp.dept, emp.office,
      emp.email, emp.mobile, emp.sms,
      DEFAULT_BIO,
      photoUrl,
      emp.langs, emp.specs,
      'PacificCoastTitleCompany', 'pacificcoasttitlecompany',
      'https://www.pct.com',
      emp.active, emp.featured, emp.website,
    ])
  }
  await client.query(`SELECT setval('vcard_employees_id_seq', (SELECT MAX(id) FROM vcard_employees));`)
  console.log(`  ✓ ${employees.length} employees`)

  // ── Seed: Simple Links ───────────────────────────────────────
  console.log('\n🔗 Seeding simple links...')
  await client.query(`
    INSERT INTO vcard_simple_links (label, url, icon, distribution, category, display_order)
    VALUES
      ('PCT WEBSITE',  'https://www.pct.com',                                                                                                        '🔗', 'global', 'other', 1),
      ('TRAININGS',    'https://mcusercontent.com/3f123598483b787fa180fff0f/files/19d2dfca-90eb-b8c8-5026-e6f1ab5ca369/TrainingMenu.pdf', '📈', 'global', 'other', 2),
      ('NETSHEETS',    'https://pacificcoastagent.com/',                                                                                              '🔗', 'global', 'other', 3),
      ('PROFILES',     'http://smartdirectre.com/pctpropertypro',                                                                                     '🔗', 'global', 'other', 4),
      ('RESALE RATES', 'https://www.pct.com/resources/rate-calculator',                                                                               '💻', 'global', 'other', 5)
    ON CONFLICT DO NOTHING;
  `)
  console.log('  ✓ 5 simple links')

  // ── Migrate: Farm Requests ───────────────────────────────────
  console.log('\n📋 Seeding farm requests...')
  await client.query(`
    INSERT INTO vcard_farm_requests
      (list_type, city_area, list_size, output_formats, contact_name, contact_email, contact_phone, rep_id, source_channel, status, notification_sent, submitted_at)
    VALUES
      ('OUT_OF_STATE', 'Orange',  '250_500', '["pdf"]', 'Jerry Hernandez', 'gerardoh@gmail.com', '(213) 309-7286', 'C-28', 'sms', 'pending', true, '2026-01-08 13:20:53'),
      ('EMPTY_NESTER', 'Irvine',  '100_250', '["pdf"]', 'Neil Torquato',   'neilt888@gmail.com', '(949) 278-0118', 'C-29', 'sms', 'pending', true, '2026-01-08 18:41:15')
    ON CONFLICT DO NOTHING;
  `)
  console.log('  ✓ 2 farm requests')

  // ── Admin users ──────────────────────────────────────────────
  console.log('\n🔑 Seeding admin users...')
  await client.query(`
    INSERT INTO vcard_admin_users (id, username, email, password_hash, role, office_id, first_name, last_name)
    VALUES
      (1, 'admin',    'admin@pct.com',    '$2y$10$bwiLfBq5YdWxVIyj7w7cdODDl08LQ9hbBIdXHzo/Aa5as0ol.I0l2', 'top_level', NULL, 'System',    'Administrator'),
      (2, 'LAsales',  'teammeza@pct.com', '$2y$10$fqjyNwVGqRcOQ9FEku5g6u0ZB0NTnxwOOkIQJGiWF4wMrr5sLQurC', 'manager',   1,    'Team',      'Meza'),
      (3, 'neil',     'neil@pct.com',     '$2y$10$aC9Cx.32xBC7dYeVJ3zqA.J7ISS1/EAJKfygc4M9.AuKBJbv5hG12', 'manager',   2,    'Neil',      'Torquato'),
      (4, 'hugo',     'hlopez@pct.com',   '$2y$10$8W3PbtAQrbJAvxG8CPjD3ehqReN.K9b2Jv7tsJXqiRVK3HrLHZ34m', 'manager',   3,    'Hugo',      'Lopez')
    ON CONFLICT (username) DO NOTHING;
  `)
  await client.query(`SELECT setval('vcard_admin_users_id_seq', (SELECT MAX(id) FROM vcard_admin_users));`)
  console.log('  ✓ 4 admin users (passwords preserved as bcrypt hashes)')

  console.log('\n🎉 Migration complete! Tables created and seeded in Render PostgreSQL.')
  console.log('   Database: pct_calculator_db')
  console.log('   New tables: vcard_offices, vcard_departments, vcard_employees,')
  console.log('               vcard_admin_users, vcard_farm_requests, vcard_employee_activity, vcard_simple_links')
  console.log(`\n   ${employees.length} employees seeded. Photos served from R2:`)
  console.log(`   ${resolvePhoto('FirstName', null)}`)

  await client.end()
}

run().catch((err) => {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
})
