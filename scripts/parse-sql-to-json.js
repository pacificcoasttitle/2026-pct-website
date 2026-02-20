/**
 * Temporary script to parse PCT SQL dump files into JSON data files
 * for the rate calculator. Run once, then delete.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'calculator');

// Ensure output directory exists
fs.mkdirSync(OUT, { recursive: true });

function readSQL(filename) {
  return fs.readFileSync(path.join(ROOT, filename), 'utf-8');
}

/**
 * Parse INSERT statements from SQL dump into arrays of objects.
 * Handles multi-row INSERTs and NULL values.
 */
function parseInserts(sql, columns) {
  const rows = [];
  // Match all value tuples: (val, val, val, ...)
  const tupleRegex = /\(([^)]+)\)/g;
  // Find only inside INSERT lines
  const insertLines = sql.split('\n').filter(l => l.startsWith('(') || l.startsWith('INSERT'));
  const insertBlock = insertLines.join('\n');
  
  let match;
  while ((match = tupleRegex.exec(insertBlock)) !== null) {
    const raw = match[1];
    // Split by comma, but respect quoted strings
    const values = [];
    let current = '';
    let inQuote = false;
    let escaped = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (escaped) { current += ch; escaped = false; continue; }
      if (ch === '\\') { escaped = true; current += ch; continue; }
      if (ch === "'") { inQuote = !inQuote; current += ch; continue; }
      if (ch === ',' && !inQuote) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());
    
    if (values.length === columns.length) {
      const row = {};
      columns.forEach((col, i) => {
        let val = values[i];
        if (val === 'NULL') { row[col] = null; }
        else if (val.startsWith("'") && val.endsWith("'")) { row[col] = val.slice(1, -1).replace(/\\'/g, "'"); }
        else if (!isNaN(val) && val !== '') { row[col] = Number(val); }
        else { row[col] = val; }
      });
      rows.push(row);
    }
  }
  return rows;
}

// ===================== TITLE RATES =====================
console.log('Parsing title rates...');
const titleSQL = readSQL('pctc_title_rates.sql');
const titleColumns = ['id', 'name', 'min_range', 'max_range', 'owner_rate', 'home_owner_rate', 'con_loan_rate', 'resi_loan_rate', 'con_full_loan_rate', 'region', 'status', 'created_at', 'modified_at'];
const titleRows = parseInserts(titleSQL, titleColumns);
// Only keep active rows with actual rates
const titleRates = titleRows
  .filter(r => r.status === 1)
  .map(r => ({
    minRange: r.min_range,
    maxRange: r.max_range,
    ownerRate: r.owner_rate,
    homeOwnerRate: r.home_owner_rate,
    conLoanRate: r.con_loan_rate,
    resiLoanRate: r.resi_loan_rate,
    conFullLoanRate: r.con_full_loan_rate,
  }));
fs.writeFileSync(path.join(OUT, 'title-rates.json'), JSON.stringify(titleRates, null, 2));
console.log(`  → ${titleRates.length} title rate rows (${titleRates.filter(r => r.ownerRate > 0).length} with rates, ${titleRates.filter(r => r.ownerRate === 0).length} zero/call-for-quote)`);

// ===================== ESCROW RESALE =====================
console.log('Parsing escrow resale rates...');
const resaleSQL = readSQL('pctc_escrow_resale.sql');
const resaleColumns = ['id', 'county', 'min_range', 'max_range', 'base_amount', 'per_thousand_price', 'base_rate', 'minimum_rate', 'status', 'created_at', 'modified_at'];
const resaleRows = parseInserts(resaleSQL, resaleColumns);
const escrowResale = resaleRows
  .filter(r => r.status === 1)
  .map(r => ({
    county: r.county,
    minRange: r.min_range,
    maxRange: r.max_range,
    baseAmount: r.base_amount,
    perThousandPrice: r.per_thousand_price,
    baseRate: r.base_rate,
    minimumRate: r.minimum_rate,
  }));
fs.writeFileSync(path.join(OUT, 'escrow-resale.json'), JSON.stringify(escrowResale, null, 2));
console.log(`  → ${escrowResale.length} escrow resale rows`);

// ===================== ESCROW REFINANCE =====================
console.log('Parsing escrow refinance rates...');
const refiSQL = readSQL('pctc_escrow_refinance.sql');
const refiColumns = ['id', 'county', 'min_range', 'max_range', 'escrow_rate', 'status', 'created_at', 'modified_at'];
const refiRows = parseInserts(refiSQL, refiColumns);
const escrowRefi = refiRows
  .filter(r => r.status === 1)
  .map(r => ({
    county: r.county,
    minRange: r.min_range,
    maxRange: r.max_range,
    escrowRate: r.escrow_rate,
  }));
fs.writeFileSync(path.join(OUT, 'escrow-refinance.json'), JSON.stringify(escrowRefi, null, 2));
console.log(`  → ${escrowRefi.length} escrow refinance rows`);

// ===================== FEES =====================
console.log('Parsing additional fees...');
const feesSQL = readSQL('pctc_fees.sql');
const feesColumns = ['id', 'transaction_type', 'parent_name', 'name', 'value', 'status', 'created_at', 'modified_at'];
const feesRows = parseInserts(feesSQL, feesColumns);
const fees = feesRows.map(r => ({
  id: r.id,
  transactionType: r.transaction_type,
  category: r.parent_name,
  name: r.name,
  value: r.value,
  active: r.status === 1,
}));
fs.writeFileSync(path.join(OUT, 'fees.json'), JSON.stringify(fees, null, 2));
console.log(`  → ${fees.length} fees (${fees.filter(f => f.active).length} active)`);

// ===================== COUNTIES =====================
console.log('Parsing county master list...');
const countySQL = readSQL('pctc_county_mst.sql');
const countyColumns = ['id', 'city_name', 'zone_name', 'zone_id', 'region', 'transaction_type'];
const countyRows = parseInserts(countySQL, countyColumns);
// Group by zone (county)
const countyMap = {};
countyRows.forEach(r => {
  const zone = r.zone_name;
  if (!countyMap[zone]) {
    countyMap[zone] = {
      zoneName: zone,
      zoneId: r.zone_id,
      transactionType: r.transaction_type,
      cities: [],
    };
  }
  countyMap[zone].cities.push({
    id: r.id,
    name: r.city_name,
    transactionType: r.transaction_type,
  });
});
const counties = Object.values(countyMap);
fs.writeFileSync(path.join(OUT, 'counties.json'), JSON.stringify(counties, null, 2));
console.log(`  → ${counties.length} counties/zones, ${countyRows.length} total cities`);

// ===================== ENDORSEMENTS =====================
console.log('Parsing endorsements...');
const endorseSQL = readSQL('pctc_endorsement_fee.sql');
const endorseColumns = ['id', 'name', 'fee', 'txn_type', 'is_default'];
const endorseRows = parseInserts(endorseSQL, endorseColumns);
const endorsements = endorseRows.map(r => ({
  id: r.id,
  name: r.name,
  fee: r.fee,
  transactionType: r.txn_type,
  isDefault: r.is_default === 'Y',
}));
fs.writeFileSync(path.join(OUT, 'endorsements.json'), JSON.stringify(endorsements, null, 2));
console.log(`  → ${endorsements.length} endorsements`);

// ===================== TRANSFER TAXES =====================
console.log('Parsing transfer taxes...');
const taxSQL = readSQL('pctc_transfer_taxes.sql');
const taxColumns = ['id', 'county_id', 'zone_name', 'county_tax', 'city_tax', 'status', 'created_at', 'modified_at'];
const taxRows = parseInserts(taxSQL, taxColumns);
const transferTaxes = taxRows
  .filter(r => r.status === 1)
  .map(r => ({
    countyId: r.county_id,
    zoneName: r.zone_name,
    countyTaxPerThousand: r.county_tax,
    cityTaxPerThousand: r.city_tax,
  }));
fs.writeFileSync(path.join(OUT, 'transfer-taxes.json'), JSON.stringify(transferTaxes, null, 2));
console.log(`  → ${transferTaxes.length} transfer tax entries`);

console.log('\n✅ All data parsed and saved to data/calculator/');
