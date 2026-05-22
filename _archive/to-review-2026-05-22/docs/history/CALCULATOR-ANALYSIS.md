# Rate Calculator — Deep Technical Analysis
**System:** Pacific Coast Title Rate Calculator (`/calculator2`)
**Framework:** CodeIgniter (PHP MVC)
**Database:** MariaDB (MySQL) — database `pct_calculator` / connected as `ckdmbdor_mml`
**Last analyzed:** February 20, 2026

---

## Executive Summary

The calculator is a PHP/CodeIgniter web application that allows users to get real-time estimates for Title and Escrow fees on California real estate transactions. It supports two transaction types — **Purchase (Resale)** and **Refinance** — and produces a formatted CFPB Loan Estimate-style receipt that can be downloaded as a PDF or emailed.

The admin section is extremely thin: it exists only to manage user accounts and assign "rate schedules" (membership tiers). **There is no admin interface for editing any rates, fees, or pricing directly.** All rates live as hard data rows in the MySQL database and can only be changed via direct database access (phpMyAdmin, SQL queries, or `adminer.php`).

---

## Architecture Overview

```
calculator2/
├── index.php                    ← CodeIgniter bootstrap
├── adminer.php                  ← DANGER: Database admin tool (see Security section)
├── application/
│   ├── database.php             ← Live DB credentials (committed to repo — see Security)
│   ├── controllers/
│   │   └── Welcome.php          ← Single controller handling ALL logic
│   ├── models/
│   │   └── Welcome_model.php    ← All database queries
│   └── views/front/
│       ├── index.php            ← Calculator input form
│       ├── recipt.php           ← Quote results / receipt display
│       ├── admin_login.php      ← Admin login page
│       ├── admin_dashboard.php  ← Admin user management
│       └── signup.php           ← Lender Partner registration
```

The `ap_bk/` folder (300+ files) is an abandoned legacy application from a completely different project (an academic publishing platform). It has nothing to do with the rate calculator and should be deleted.

---

## How a Quote Is Generated — Step by Step

### Step 1 — User Inputs (index.php form)
The user selects:
- **State** → **County** → **City** (cascading dropdowns, filtered client-side from preloaded data)
- **Rate Options checkboxes:** All Fees, Title Rates, Escrow Rates, Recording Fees
- **Transaction Type:** Purchase (Resale) or Refinance
- **Sale Amount** and **Loan Amount**
- **Policy Type** (auto-set based on transaction type)
- **Escrow/Settlement Services:** checkboxes for Residential Escrow, Mobile Signin, New Loan Fee, Notary Fee, Recording Service Fee

The "Endorsements" section is **commented out** — it exists in the code but is not shown to users.

### Step 2 — Form Submission
The form POSTs to `welcome/receipt`. The controller calls `generate_quote()` in the model, which saves the entire quote to the `pctc_quotes` table and returns a `quote_id`.

### Step 3 — Redirect to Receipt
The controller redirects to `welcome/view_quote/{quote_id}`. The receipt page (`recipt.php`) then independently re-queries the database for every rate — it does NOT use cached results from form submission.

---

## How Title Rates Are Calculated

**Table:** `pctc_title_rates`

The table contains flat-dollar premium amounts organized in $10,000 sale-price brackets. There is **no formula** — just a lookup. The system finds the row where `min_range <= sale_amount <= max_range` and reads the relevant premium column.

### Title Rate Columns

| Column | What It Represents |
|--------|-------------------|
| `owner_rate` | CLTA Standard Policy / Alta Extended Policy owner's premium |
| `home_owner_rate` | Alta Homeowners Policy owner's premium |
| `con_loan_rate` | Simultaneous (concurrent) loan policy — used when buyer gets a loan at same time as purchase |
| `resi_loan_rate` | ALTA Residential Loan Policy — used for Refinance transactions |
| `con_full_loan_rate` | Stand-Alone Loan Policy — used for CFPB disclosure math only |

### Policy Type Logic (Purchase/Resale)

| Policy Type Selected | Column Used for Owner's Premium |
|---------------------|--------------------------------|
| "Regular" (displayed as Alta Homeowners Policy) | `home_owner_rate` |
| "Extended" | `owner_rate` |
| "Standard" | `owner_rate` |

**Critical bug/confusion:** In the input form, the only Purchase option available is "Alta Homeowners Policy" (value = `Regular`). On the receipt page, `Regular` maps to `home_owner_rate` and `Extended` maps to `owner_rate`. The naming is reversed from what you'd expect — Regular uses the `home_owner_rate` column, Extended uses `owner_rate`. This is internally inconsistent.

### Lender Policy (Concurrent Loan Rate)

If the user checks "Does lender require policy? → Yes", the system adds the `con_loan_rate` on top of the owner's premium. For the CFPB calculation section, it re-queries the title rate table using the **loan amount** (not sale amount) to get `con_loan_rate`.

### Refinance Title Rate

For Refinance, the system looks up the **loan amount** (not sale amount) in `pctc_title_rates` and uses the `resi_loan_rate` column.

**Membership tier exception:** If the logged-in user has a membership tier > 1, the system queries `pctc_members_escrow` instead of `pctc_title_rates` for the refinance rate. This custom pricing table for lender partners is referenced in the code but its data contents are not visible in the exported SQL files in this repo.

### Sample Title Rate Data (California)
```
$0 – $100,000:   owner=$677  homeowner=$745  con_loan=$484  resi_loan=$450  full_loan=$542
$500,000–$510k:  owner=$1,593 homeowner=$1,752 con_loan=$1,018 resi_loan=$840 full_loan=$1,274
```
The table has hundreds of rows going up to $10M+. All rates are flat dollar amounts stored as integers.

---

## How Escrow Fees Are Calculated

### Purchase (Resale) — Table: `pctc_escrow_resale`

This is the most complex calculation. The table is **county-specific** with range-based tiers.

**Schema:**
```
county        — county identifier (e.g., "Orange__All", "Los Angeles County__All")
min_range     — minimum sale amount for this row
max_range     — maximum sale amount (NULL = no upper limit)
base_rate     — base dollar amount
formula       — text formula string (uses "base_rate" and "loan_amount" as placeholders)
min_rate      — minimum fee floor
```

**Calculation process:**
1. Find the matching county + amount range row
2. Substitute `base_rate` and `loan_amount` (= sale amount) into the `formula` string
3. Evaluate the formula using PHP `eval()` ← **see Security section**
4. If the result is below `min_rate`, use `min_rate` instead
5. **Divide by 2** — the displayed escrow fee is the buyer's half; the seller pays the other half

**Sample county escrow tiers (Resale):**

| County | Range | Base | Per $1k | Min |
|--------|-------|------|---------|-----|
| Orange | $0–$1.5M | $500 | $4/1k | $700 |
| Orange | $1.5M+ | flat | — | $6,500 |
| Riverside | $0–$1M | $500 | $4/1k | $700 |
| Riverside | $1M+ | flat | — | $4,500 |
| Los Angeles | $0–$1M | $500 | $4/1k | $700 |
| Los Angeles | $1M+ | flat | — | $4,500 |
| San Diego | $0–$700k | $700 | $3/1k | — |
| Ventura | $0–$1M | $500 | $4/1k | $700 |

### Refinance — Table: `pctc_escrow_refinance`

Refinance escrow is much simpler — it's a flat dollar amount per county per loan amount tier.

```
Orange:          $0–$250k=$525  $250k–$500k=$575  $500k–$750k=$675
Riverside:       Same tiers, same amounts
Los Angeles:     Same tiers, same amounts
San Diego:       Same tiers, same amounts
Ventura:         Same tiers, same amounts
```

Note: `pctc_escrow_refinance` row 1 (Orange, $0–$250k) has `status=0` (inactive). This means Orange refinance under $250k has no active rate — a potential gap.

There is also a `pctc_escrow_refinance_new` table with flat $525 rates for all ranges with no county distinction — it appears to be an old version that is no longer used by the active code.

---

## Additional Escrow/Settlement Fees

These are **hardcoded in the receipt view** (`recipt.php`) — they are NOT pulled from the database:

| Fee | Amount | Condition |
|-----|--------|-----------|
| Notary Fees | **$175.00** | If checkbox selected |
| New Loan Fee | **$280.00** | Purchase only + if checkbox selected |
| Recording Service Fee | **$13.00** | If checkbox selected |
| Mobile Signin Fee | **$100.00 × qty** | If checkbox selected + number entered |

**These dollar amounts are literal numbers buried in the PHP view file.** To change them, a developer must edit `recipt.php` directly. There is no admin UI or database table controlling them.

The `pctc_fees` table exists and contains alternate fee values (e.g., Notary $200, New Loan $280, Mobile Signing $200), but **the code does not query this table** when rendering the receipt. The table appears to have been an early attempt at admin-controlled fees that was abandoned mid-development.

Similarly, the `pctc_settlement_fee` table exists with values, but it is also not queried by any active code.

---

## Recording Fees

Also **hardcoded in the receipt view:**

| Fee | Amount |
|-----|--------|
| Recording Charge | **$200.00** |
| SB2 Recording Fee Charge | **$225.00** |

These are literal numbers in `recipt.php`. The `pctc_fees` table has a `Recording Service Fee` entry ($225) and SB2 entries, but again — they are not queried.

---

## Endorsements

The endorsement system is **built but disabled.** The UI checkbox is commented out in the input form. The database table (`pctc_endorsement_fee`) has 10 endorsements populated:

**Resale endorsements (all $0 fee):**
- CLTA 100-06 (default)
- CLTA 110.9-06 (default)
- CLTA 116-06 (default)
- CLTA 100.12-06
- CLTA 103.3-06
- CLTA 103.5-06
- CLTA 111.5-06

**Refinance endorsements (all $0 fee):**
- CLTA 110.9-06 (default)
- CLTA 100.12-06
- CLTA 103.5-06

All endorsement fees are $0. The code to display and sum them exists and works, but the feature is hidden from users.

---

## CFPB Disclosure Calculation

The receipt includes a CFPB Loan Estimate section for Purchase transactions. This calculates the "Owner's Policy Disclosed Amount" as required by federal CFPB rules:

```
CFPB Disclosed Amount = Owner's Premium + Concurrent Loan Rate - Stand-Alone Loan Rate
Premium Adjustment    = Owner's Premium - CFPB Disclosed Amount
```

The Stand-Alone Loan Rate (`con_full_loan_rate`) is looked up separately using the **loan amount** (not the sale amount). This is correct CFPB methodology — the disclosed amount represents what the consumer effectively pays for the owner's policy after accounting for the simultaneous issue discount.

---

## Transfer Taxes

The `pctc_transfer_taxes` table exists with county + city tax rates per $1,000:

| County | County Rate | City Rate |
|--------|-------------|-----------|
| Los Angeles (various cities) | $1.10 | $1.10–$4.50 |
| Orange | $1.10 | $0.00 |
| San Bernardino | $1.10 | $0.00 |
| Riverside | $1.10 | $1.10 |
| San Diego | $1.10 | $0.00 |
| Ventura | $1.10 | $0.00 |

**This table is not used by the calculator at all.** Transfer taxes are not shown on the quote receipt. This data likely feeds the separate `city-transfer-tax.html` and `city-transfer-tax-calc.html` pages, which appear to be independent front-end tools.

---

## Quote Storage

When a quote is generated, it is saved to `pctc_quotes` with all user inputs. A numeric `quote_id_pk` is returned. Users can retrieve a past quote by entering its ID on the calculator homepage.

Quote data stored includes: region, county, city, transaction type, sale amount, loan amount, policy type, all checkbox states, closing county (if different), and lender policy selection.

---

## User Account / Lender Partner System

The calculator supports user registration ("Lender Partner Login"). Logged-in users with membership tier > 1 can receive **custom escrow pricing** pulled from `pctc_members_escrow` instead of the standard rates.

Passwords are stored as **MD5 hashes** — this is an outdated, insecure hashing method (see Security section).

---

## Admin Section

The admin dashboard (`welcome/admin_login` → `welcome/admin_dashboard`) is minimal:

**What it can do:**
- View all registered users (name, email, registration date, assigned rep, current rate schedule)
- Change a user's membership/rate tier
- Reset a user's password

**What it cannot do — which is a significant problem:**
- Edit title rate premiums
- Edit escrow base rates or formulas
- Edit hardcoded fees (Notary, New Loan, Recording, Mobile Signin)
- Add or remove counties
- Enable/disable endorsements or edit their fees
- Manage the `pctc_fees` table data (which the code ignores anyway)
- View or manage saved quotes

To change any rate, a developer or database admin must connect directly to the MySQL database.

---

## Critical Problems & Issues

### Security Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| **`adminer.php` in web root** | CRITICAL | A full database management UI (`adminer.php`) is publicly accessible at `/calculator2/adminer.php`. Anyone who finds this URL gets complete access to the database — no PCT login required. This must be deleted or moved immediately. |
| **Database credentials in committed file** | HIGH | `application/database.php` contains the live production username (`ckdmbdor_myrepos`) and password (`,50cq&?Z0RKO`) committed in plain text to the git repository. Anyone with repo access has the database password. |
| **MD5 password hashing** | HIGH | All user passwords (including admin) are stored as MD5 hashes. MD5 is cryptographically broken and can be cracked in seconds with modern tools. |
| **`eval()` used on database-sourced formula strings** | MEDIUM | The escrow resale calculation uses PHP `eval()` to execute formula strings from the database. If the database were ever compromised, an attacker could execute arbitrary PHP code on the server. |
| **`create_function()` (deprecated)** | MEDIUM | The `Field_calculate` class (in the controller) uses `create_function()`, which was removed in PHP 8.0. This code will crash on PHP 8+. |
| **No CSRF protection visible** | MEDIUM | The quote form and admin forms do not appear to use CSRF tokens. |
| **Admin auth check is fragile** | MEDIUM | The `is_admin()` function only checks for `session('adminid')`. Session fixation or manipulation could bypass it. |
| **Timezone hardcoded as Asia/Kolkata** | LOW | `date_default_timezone_set('Asia/Kolkata')` — line 5 of `Welcome.php`. This was copied from an offshore development environment and never corrected. Quote dates display in India Standard Time. |

### Rate Management Issues

| Issue | Impact |
|-------|--------|
| No admin UI to edit rates | Every rate change requires a developer and direct database access |
| Hardcoded fees in view file | Notary, New Loan, Recording fees are buried in `recipt.php` lines 263–277 |
| `pctc_fees` table is ignored | Data in this table does nothing — it's dead data that creates a false sense of control |
| `pctc_settlement_fee` table is ignored | Same — populated but never queried |
| Orange Refinance <$250k has no active rate | Row 1 in `pctc_escrow_refinance` has `status=0` — Orange County refinances under $250k will return no escrow rate |

### Code Quality Issues

| Issue | Detail |
|-------|--------|
| Endorsements are half-built and hidden | Feature exists in DB and code, disabled in UI, all fees are $0 |
| Transfer tax table is unused | `pctc_transfer_taxes` is populated but the calculator never reads it |
| `pctc_escrow_refinance_new` is unused | An old refinance rate table still in the database, doing nothing |
| `ap_bk/` backup folder | 300+ files from a completely different project sitting inside the calculator folder |
| Policy type label mismatch | "Regular" in form = `home_owner_rate` column; "Extended" = `owner_rate` — the names are reversed from what the column names suggest |
| `calculate_title_rate()` method is never called | The controller has a `calculate_title_rate()` method (lines 46-84) that processes rates but its results are never returned or used. The actual calculation happens inside the receipt view. |
| Receipt re-queries everything from scratch | There is no caching — every page load of the receipt re-runs all queries |
| `$data` used in `admin_login()` before declaration | Line 568: `$this->load->view('front/header', $data)` where `$data` is never assigned — PHP notice/warning |

---

## Database Tables Summary

| Table | Purpose | Used by Calculator? |
|-------|---------|-------------------|
| `pctc_county_mst` | State/County/City master list for dropdowns | Yes — powers all location dropdowns |
| `pctc_title_rates` | Title insurance premiums by sale/loan amount bracket | Yes — core title rate lookup |
| `pctc_escrow_resale` | Escrow fees for Purchase transactions, by county + range | Yes — core escrow rate lookup |
| `pctc_escrow_refinance` | Escrow fees for Refinance transactions, by county + range | Yes — core escrow rate lookup |
| `pctc_escrow_refinance_new` | Old version of refinance escrow rates (no county) | No — orphaned table |
| `pctc_endorsement_fee` | Title endorsement names and fees | Partially — queried but feature is hidden |
| `pctc_fees` | Admin-managed fee list | No — table exists, code ignores it |
| `pctc_settlement_fee` | Settlement service fees | No — table exists, code ignores it |
| `pctc_transfer_taxes` | County + city transfer tax rates | No — separate pages only |
| `pctc_quotes` | Saved quote records | Yes — every quote is saved |
| `pctc_quote_endorsements` | Endorsements selected per quote | Partially — saved but never displayed |
| `pctc_user_mst` | Registered Lender Partner users | Yes — login/membership system |
| `pctc_membership` | Membership tier definitions | Yes — rate schedule assignment |
| `pctc_members_escrow` | Custom escrow rates for premium tier users | Yes — for non-standard memberships |
| `pdb_rep_mst` | PCT Sales Rep list (for signup form) | Yes — signup dropdown |
| `admin` | Admin login credentials | Yes — admin login |

---

## What Would It Take to Fix This Properly

**Immediate (security):**
1. Delete or password-protect `adminer.php`
2. Rotate the exposed database password immediately
3. Remove `database.php` credentials from git history (use environment variables)
4. Upgrade password hashing to `password_hash()` / `password_verify()`

**Short-term (admin control):**
1. Build a proper admin UI to edit title rates (CRUD on `pctc_title_rates`)
2. Build a proper admin UI to edit escrow rates (CRUD on `pctc_escrow_resale`, `pctc_escrow_refinance`)
3. Move the hardcoded fees (Notary $175, New Loan $280, Recording $13, Mobile $100) into the database and hook up the existing `pctc_fees` table — or a new equivalent table
4. Fix the Orange County refinance gap (status=0 on row 1)
5. Fix the timezone (change to `America/Los_Angeles`)

**Medium-term (code quality):**
1. Replace `eval()` with a proper math evaluator library
2. Replace `create_function()` (broken on PHP 8+)
3. Delete the `ap_bk/` folder entirely
4. Reconcile the policy type naming confusion
5. Move all calculation logic out of the view file and into the controller/model
6. Add CSRF protection to all forms

---

*Document generated from full source code analysis of `calculator2/` and all associated SQL dump files.*
