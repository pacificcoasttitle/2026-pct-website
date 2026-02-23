const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://pct_calculator_db_user:Lp6b4uVGT2ZycqA8eyZ1zAQHY1i05syj@dpg-d5nueanpm1nc73aueaj0-a.oregon-postgres.render.com/pct_calculator_db',
  ssl: { rejectUnauthorized: false },
});

const sql = `
CREATE TABLE IF NOT EXISTS fincen_intake_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(30) UNIQUE NOT NULL,
  status VARCHAR(30) DEFAULT 'new',
  checker_result VARCHAR(40),
  checker_answers JSONB,
  officer_name VARCHAR(255) NOT NULL,
  officer_email VARCHAR(255) NOT NULL,
  officer_phone VARCHAR(50),
  branch_office VARCHAR(255) NOT NULL,
  escrow_number VARCHAR(100) NOT NULL,
  property_address JSONB NOT NULL,
  property_type VARCHAR(100) NOT NULL,
  estimated_closing_date DATE NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL,
  buyer_type VARCHAR(50) NOT NULL,
  buyer_data JSONB NOT NULL,
  sellers_data JSONB NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  payment_sources JSONB,
  total_amount NUMERIC(12,2) NOT NULL,
  financial_institution VARCHAR(255),
  lender_aml_regulated VARCHAR(20),
  financing_notes TEXT,
  certified BOOLEAN NOT NULL DEFAULT false,
  certified_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(255),
  notes TEXT,
  notification_sent_at TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fincen_status ON fincen_intake_submissions(status);
CREATE INDEX IF NOT EXISTS idx_fincen_escrow ON fincen_intake_submissions(escrow_number);
CREATE INDEX IF NOT EXISTS idx_fincen_submitted ON fincen_intake_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_fincen_officer ON fincen_intake_submissions(officer_email);
`;

pool.query(sql)
  .then(() => {
    console.log('✅ fincen_intake_submissions table created successfully!');
    return pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  })
  .then(r => {
    console.log('All tables:', r.rows.map(x => x.table_name).join(', '));
    pool.end();
  })
  .catch(e => {
    console.error('❌ Error:', e.message);
    pool.end();
    process.exit(1);
  });
