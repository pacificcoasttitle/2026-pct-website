# Rate Calculator

**Last verified:** 2026-05-22 · **Maintained by:** Documentation Agent · **Source of truth:** `/docs/system/calculator.md`

## Overview

Estimates **title insurance premiums, escrow fees, transfer taxes, and recording/other fees** for California purchase and refinance transactions. The calculation engine is pure TypeScript over committed JSON rate tables — **no database**. A separate client-side **Prop 19** calculator handles parent-child reassessment exclusions.

⚠️ Correction to brief: there is **no Prisma and no `counties`/`title_rates`/`escrow_*` Postgres tables** for the calculator. Rate data lives in `data/calculator/*.json`, generated from the `pctc_*.sql` dumps / `pctc_title_rates.csv` in the repo root.

## Architecture

```
 Calculator UI ──▶ GET /api/calculator/counties      ┐
              ──▶ GET /api/calculator/cities          │  read data/calculator/*.json
              ──▶ POST/GET /api/calculator/fees ──────┘  via lib/calculator-engine.ts
                                                          (no auth — public)
 Admin rate editor ──▶ GET/PUT/POST/DELETE /api/admin/rates   (auth)  ── fs read/write JSON
                   ──▶ /api/admin/fees                         (auth)
```

## Data source (the "tables")

`lib/calculator-engine.ts` imports these JSON files from `data/calculator/`:

| File | Shape / purpose |
|---|---|
| `title-rates.json` | tiered ranges → `ownerRate, homeOwnerRate, conLoanRate, resiLoanRate, conFullLoanRate` |
| `escrow-resale.json` | per-zone resale escrow: `baseAmount, perThousandPrice, baseRate, minimumRate` |
| `escrow-refinance.json` | per-zone refi escrow: `escrowRate` |
| `fees.json` | recording/other fees: `name, value, active, transactionType('resale'|'refinance'), category` |
| `endorsements.json` | endorsements: `id, name, fee, transactionType('Resale'|'Re-finance'), isDefault` |
| `transfer-taxes.json` | `countyId, zoneName, countyTaxPerThousand, cityTaxPerThousand` |
| `counties.json` | zones + nested `cities[]` (incl. "All Cities") + `transactionType` |

## API endpoints

| Method · Path | Purpose | Auth |
|---|---|---|
| `GET /api/calculator/counties` | County/zone options (filtered by txn type) | public |
| `GET /api/calculator/cities` | Cities for a zone | public |
| `GET`/`POST /api/calculator/fees` | Compute a full estimate | public |
| `GET/PUT/POST/DELETE /api/admin/rates?type=` | CRUD a rate entry by `type` + array `index` | admin |
| `/api/admin/fees` | Manage `fees.json` entries | admin |

`type` ∈ `title | escrow-resale | escrow-refinance | endorsements | transfer-taxes` (`app/api/admin/rates/route.ts`).

## Calculation logic (`lib/calculator-engine.ts`)

- **Title** (`calculateTitleFees`): tier lookup by amount; purchase owner's policy uses ALTA `homeOwnerRate` (default) or CLTA `ownerRate`; concurrent lender policy uses `conLoanRate` (Column 4), standalone uses `resiLoanRate` (Column 5). `conFullLoanRate` (Column 6) is the non-concurrent rate and is **not** used in the concurrent path.
- **Escrow** (`calculateEscrowFees`): resale = `baseAmount + (price/1000)*perThousandPrice`, floored at `minimumRate` (or a direct `baseRate`); refinance = flat `escrowRate` by tier. Plus active `category:'escrow'` fees.
- **Transfer tax** (`calculateTransferTaxes`): purchase only; city-specific row by `countyId`, falling back to the zone's "All Cities" row, default county rate **1.10 / $1,000** if none. `tax = (price/1000) * rate`.
- **Additional fees** (`getAdditionalFees`): active fees with `category !== 'escrow'`.
- **Call-for-quote:** `callForQuote = true` when no rate tier matches or the tier is zeroed — effectively property value **> $3M**.
- `calculate()` composes all of the above into `grandTotal` + a disclaimer string.

## Prop 19 calculator

Separate and **client-side**: `prop-19-calculator.html` (repo root) + `lib/prop19/calculations.ts`. Independent of the rate engine and the rate JSON. ⚠️ ASSUMPTION: not deeply reviewed this pass.

## Code References

- `lib/calculator-engine.ts:7` — JSON imports; `:88` title; `:256` escrow; `:296` transfer tax; `:375` `calculate()`
- `app/api/admin/rates/route.ts:13` — `writeJsonFile` (fs write)

## Common Tasks

- **Update a rate:** Team Admin rate editor → `PUT /api/admin/rates` with `{ type, index, data }`. **But see Gotchas — edits do not persist on Vercel.** The durable path is to edit `data/calculator/*.json` in the repo and redeploy.
- **Add a county/city:** edit `counties.json` (+ `transfer-taxes.json` for the tax row), commit, redeploy.

## Gotchas / Notes

- ⚠️ **Vercel persistence:** `/api/admin/rates` writes JSON with `fs.writeFileSync` into `process.cwd()/data/calculator`. On Vercel's serverless/read-only-ish, ephemeral filesystem, **writes do not persist** across invocations/deploys and may fail outright. Treat the admin rate editor as preview-only; the **committed JSON is the real source of truth**. **NEEDS REVIEW:** confirm whether rate editing is actually used in prod or is a leftover.
- Rates are whole-dollar integers; escrow math rounds to cents.
- The engine trusts JSON shape; a malformed entry added via the admin POST (no schema validation) can break lookups.

---
*This document is maintained by the Documentation Agent. To regenerate or update, see `claude-skills.md` → Documentation Agent role.*
