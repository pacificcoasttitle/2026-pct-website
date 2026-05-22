import { useState } from "react";

// ─── DESIGN DIRECTION ───────────────────────────────────────────────
// Tone: Professional/Editorial — think Bloomberg Terminal meets a clean 
// real estate dashboard. Data-dense but breathable. Every piece of 
// information has visual hierarchy. Dollar amounts pop. Severity is 
// instantly scannable. The feeling: "This tool knows what it's doing."
//
// PCT Brand: Orange #f26b2b, Dark Blue #0c2340
// Section Colors: Green/Blue/Purple/Red/Amber/Gray/Teal
// ─────────────────────────────────────────────────────────────────────

const SeverityBadge = ({ level }) => {
  const config = {
    blocker: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500", label: "BLOCKER" },
    material: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500", label: "MATERIAL" },
    informational: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", dot: "bg-blue-400", label: "INFO" },
  };
  const c = config[level] || config.informational;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${c.bg} ${c.border} ${c.text} border`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  if (s === "paid") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ PAID</span>;
  if (s === "open") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">◷ OPEN</span>;
  if (s === "delinquent") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200">✕ DELINQUENT</span>;
  return <span className="text-xs text-gray-400 italic">{status}</span>;
};

const Dollar = ({ amount, size = "normal" }) => {
  const cls = size === "large" 
    ? "text-lg font-bold text-gray-900 tabular-nums" 
    : "font-semibold text-gray-900 tabular-nums";
  return <span className={cls}>{amount}</span>;
};

const Recording = ({ num, date }) => (
  <span className="text-xs text-gray-400 font-mono">
    {num}{date && ` · ${date}`}
  </span>
);

const KV = ({ label, children, mono = false }) => (
  <div className="flex justify-between items-baseline py-2 border-b border-gray-100 last:border-0">
    <span className="text-xs uppercase tracking-wider text-gray-400 font-medium shrink-0 mr-4">{label}</span>
    <span className={`text-sm text-right ${mono ? "font-mono" : ""} text-gray-800`}>{children}</span>
  </div>
);

const SectionCard = ({ title, icon, accentColor, count, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold`} style={{ backgroundColor: accentColor }}>
          {icon}
        </span>
        <span className="flex-1 font-semibold text-gray-900 text-sm tracking-tight">{title}</span>
        {count && <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>}
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-100">{children}</div>}
    </div>
  );
};

// ─── SECTION 1: TITLE REQUIREMENTS ──────────────────────────────────
const RequirementsContent = () => {
  const requirements = [
    {
      item: "Req. 1",
      severity: "blocker",
      title: "Statement of Information — All Parties",
      detail: "Complete SOI required to clear name-index search. Title cannot proceed without this to eliminate false matches against parties with similar names.",
      nextStep: "All parties complete and return SOI forms",
      owner: "Escrow / All Parties",
    },
    {
      item: "Req. 2",
      severity: "blocker",
      title: "Statement of Information — Gabriel Nieto (Marital Status)",
      detail: "Company cannot determine marital status at time of acquisition. If married at acquisition, spousal interest must be addressed before insuring.",
      nextStep: "Gabriel Nieto completes SOI disclosing marital history",
      owner: "Escrow / Seller",
    },
    {
      item: "Item 6",
      severity: "material",
      title: "Affidavit of Uninsured Deed Required",
      detail: "A deed from Isaac Nunez-Imperial to Gabriel Nieto (Rec. 20161086137) is uninsured. Company will not divest Isaac Nunez-Imperial's interest without a signed, notarized affidavit.",
      nextStep: "Obtain signed & notarized Affidavit of Uninsured Deed from grantor",
      owner: "Escrow / Seller",
    },
    {
      item: "Item 7",
      severity: "material",
      title: "Payoff Demand — 1st DOT ($266,000.00)",
      detail: "Deed of Trust securing $266,000.00. Originally Countrywide via MERS, now assigned to U.S. Bank Trust, N.A. as Trustee for LSF10 Master Participation Trust. Must be paid off and reconveyance recorded.",
      nextStep: "Order payoff demand from U.S. Bank Trust; include $45 reconveyance fee",
      owner: "Escrow / Lender",
    },
    {
      item: "Item 9",
      severity: "material",
      title: "Payoff Demand — 2nd DOT ($17,200.00)",
      detail: "Deed of Trust securing $17,200.00. Originally Prominent Investment Solutions, assigned to Thieu V. Nguyen and Hoa Thi Nguyen. Must be paid off and reconveyance recorded.",
      nextStep: "Order payoff demand from current beneficiary (Nguyen)",
      owner: "Escrow / Seller",
    },
    {
      item: "Items 10–11",
      severity: "material",
      title: "Solar Panel Lien — Sunnova TE Management II LLC",
      detail: "UCC financing statement and Notice of Independent Solar Energy System Producer Contract recorded May 5, 2023. Confirm whether lease or PPA, and whether lien must be subordinated or paid off.",
      nextStep: "Contact Sunnova for subordination agreement or payoff",
      owner: "Escrow / Seller",
    },
    {
      item: "Item 2",
      severity: "informational",
      title: "2nd Tax Installment Open — $2,129.89",
      detail: "Property taxes for 2025-2026 fiscal year, 2nd installment is open (not yet delinquent). Must be current at close.",
      nextStep: "Prorate or pay at closing",
      owner: "Escrow",
    },
  ];

  const borderColor = { blocker: "border-l-red-500", material: "border-l-amber-400", informational: "border-l-blue-300" };

  return (
    <div className="space-y-3 pt-4">
      {/* Quick count strip */}
      <div className="flex gap-4 mb-2">
        <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-red-500" /> 2 Blockers</span>
        <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-amber-500" /> 4 Material</span>
        <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-blue-400" /> 1 Info</span>
      </div>

      {requirements.map((req, i) => (
        <div key={i} className={`border-l-4 ${borderColor[req.severity]} bg-gray-50 rounded-r-lg p-4`}>
          <div className="flex items-start justify-between mb-2">
            <SeverityBadge level={req.severity} />
            <span className="text-xs font-mono text-gray-400">{req.item}</span>
          </div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{req.title}</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">{req.detail}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <span><span className="text-gray-400">Next step:</span> <span className="text-gray-700 font-medium">{req.nextStep}</span></span>
            <span><span className="text-gray-400">Owner:</span> <span className="text-gray-600">{req.owner}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── SECTION 2: SUMMARY ─────────────────────────────────────────────
const SummaryContent = () => (
  <div className="pt-4 space-y-4">
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">⚡ Top Closing Risks</h4>
      <div className="space-y-2">
        {[
          { sev: "blocker", text: "Two SOI requirements must be completed before title can proceed — one specifically addresses Gabriel Nieto's marital status at acquisition" },
          { sev: "material", text: "Uninsured deed (Item 6) requires signed, notarized affidavit from Isaac Nunez-Imperial before Company will insure" },
          { sev: "material", text: "Two existing Deeds of Trust totaling $283,200.00 need payoff demands and reconveyances" },
          { sev: "material", text: "Solar panel financing (Sunnova) — UCC and system notice on title must be addressed for lender clearance" },
        ].map((r, i) => (
          <div key={i} className="flex gap-2 text-sm">
            <span className="shrink-0 mt-0.5">
              {r.sev === "blocker" ? <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> : <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}
            </span>
            <span className="text-gray-700">{r.text}</span>
          </div>
        ))}
      </div>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">
      This is a proposed refinance of a single-family residence at <span className="font-medium text-gray-800">4657 Merced Avenue, Baldwin Park, CA 91706</span> with a proposed loan amount of <span className="font-semibold text-gray-900">$385,000.00</span>. Title is currently vested in <span className="font-medium text-gray-800">Gabriel Nieto, a married man, and Isaac Nunez, a single man, as joint tenants</span>, subject to the uninsured deed at Item 6. The property has two existing deeds of trust that must be paid off, a solar panel financing agreement on record, and falls within the Irwindale Community Redevelopment Agency project area. No conveyances have been recorded within the last 24 months.
    </p>
  </div>
);

// ─── SECTION 3: PROPERTY INFORMATION ────────────────────────────────
const PropertyContent = () => (
  <div className="pt-4">
    <div className="divide-y divide-gray-100">
      <KV label="Property Address"><span className="font-medium">4657 Merced Avenue, Baldwin Park, CA 91706</span></KV>
      <KV label="APN" mono>8542-006-077</KV>
      <KV label="Effective Date">February 6, 2026 at 8:00am</KV>
      <KV label="Current Vesting">Gabriel Nieto, a married man and Isaac Nunez, a single man as joint tenants</KV>
      <KV label="Estate Type">Fee Simple</KV>
      <KV label="Policy Type">ALTA Short Form Residential Loan Policy — Current Assessments (2021)</KV>
      <KV label="Proposed Loan"><Dollar amount="$385,000.00" /></KV>
      <KV label="Title Order" mono>20014370-GLT</KV>
      <KV label="Escrow No." mono>4733-RG</KV>
      <KV label="Title Officer">Eddie LasMarias · unit33@pct.com</KV>
      <KV label="Underwriter">Westcor Land Title Insurance Company</KV>
      <KV label="Property Type">Single Family Residence (per CLTA 116 endorsement)</KV>
    </div>
  </div>
);

// ─── SECTION 4: LIENS AND JUDGMENTS ─────────────────────────────────
const LiensContent = () => (
  <div className="pt-4 space-y-4">
    {/* DOT 1 */}
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-red-50 px-4 py-3 flex items-center justify-between border-b border-red-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">1st POSITION</span>
          <span className="text-sm font-semibold text-gray-900">Deed of Trust</span>
        </div>
        <span className="text-xs font-mono text-gray-400">Item #7</span>
      </div>
      <div className="p-4 space-y-0 divide-y divide-gray-100">
        <KV label="Amount"><Dollar amount="$266,000.00" size="large" /></KV>
        <KV label="Current Beneficiary"><span className="font-medium">U.S. Bank Trust, N.A., as Trustee for LSF10 Master Participation Trust</span></KV>
        <KV label="Original Lender">Countrywide Home Loans, Inc. (via MERS)</KV>
        <KV label="Trustor">Gabriel Nieto, a Married Man as His Sole & Separate Property</KV>
        <KV label="Trustee">The Mortgage Law Firm, PLC <span className="text-gray-400">(substituted)</span></KV>
        <KV label="Dated">April 25, 2006</KV>
        <KV label="Recording"><Recording num="2006-961091" date="May 2, 2006" /></KV>
      </div>
      {/* Assignment chain */}
      <div className="px-4 pb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-1">Chain of Title</div>
        <div className="relative pl-4 border-l-2 border-gray-200 space-y-2">
          <div className="relative">
            <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
            <div className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Substitution of Trustee</span> → The Mortgage Law Firm, PLC
              <br /><Recording num="20171302924" date="Nov 14, 2017" />
            </div>
          </div>
          <div className="relative">
            <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
            <div className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Assignment</span> → U.S. Bank Trust, N.A., as Trustee for LSF10 Master Participation Trust
              <br /><Recording num="20181257799" date="Dec 12, 2018" />
            </div>
          </div>
        </div>
      </div>
      {/* Action */}
      <div className="bg-orange-50 px-4 py-2.5 border-t border-orange-100 flex items-center gap-2">
        <span className="text-xs text-orange-700 font-semibold">Action:</span>
        <span className="text-xs text-orange-800">Obtain payoff demand from U.S. Bank Trust; record reconveyance ($45 fee per CC §2941)</span>
      </div>
    </div>

    {/* DOT 2 */}
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-red-50 px-4 py-3 flex items-center justify-between border-b border-red-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">2nd POSITION</span>
          <span className="text-sm font-semibold text-gray-900">Deed of Trust</span>
        </div>
        <span className="text-xs font-mono text-gray-400">Item #9</span>
      </div>
      <div className="p-4 space-y-0 divide-y divide-gray-100">
        <KV label="Amount"><Dollar amount="$17,200.00" size="large" /></KV>
        <KV label="Current Beneficiary"><span className="font-medium">Thieu V. Nguyen and Hoa Thi Nguyen</span></KV>
        <KV label="Original Beneficiary">Prominent Investment Solutions</KV>
        <KV label="Trustor">Gabriel Nieto, a married man</KV>
        <KV label="Trustee">Fidelity National Title</KV>
        <KV label="Dated">April 1, 2008</KV>
        <KV label="Recording"><Recording num="20080577328" date="Apr 3, 2008" /></KV>
      </div>
      <div className="px-4 pb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-1">Chain of Title</div>
        <div className="relative pl-4 border-l-2 border-gray-200 space-y-2">
          <div className="relative">
            <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
            <div className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Assignment</span> → Thieu V. Nguyen and Hoa Thi Nguyen
              <br /><Recording num="20090492847" date="Apr 6, 2009" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-orange-50 px-4 py-2.5 border-t border-orange-100 flex items-center gap-2">
        <span className="text-xs text-orange-700 font-semibold">Action:</span>
        <span className="text-xs text-orange-800">Obtain payoff demand from Nguyen; record reconveyance</span>
      </div>
    </div>

    {/* Totals bar */}
    <div className="bg-gray-900 text-white rounded-lg px-4 py-3 flex items-center justify-between">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Existing Liens</span>
      <span className="text-lg font-bold tabular-nums">$283,200.00</span>
    </div>
  </div>
);

// ─── SECTION 5: TAXES AND ASSESSMENTS ───────────────────────────────
const TaxContent = () => (
  <div className="pt-4">
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Tax ID</span>
          <span className="text-sm font-mono font-semibold text-gray-900 ml-2">8542-006-077</span>
        </div>
        <span className="text-xs text-gray-500">FY 2025–2026</span>
      </div>
      <div className="p-4">
        {/* Installment rows */}
        <div className="space-y-0">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="text-sm font-medium text-gray-800">1st Installment</div>
              <div className="text-xs text-gray-400">Due Dec 10, 2025</div>
            </div>
            <div className="flex items-center gap-3">
              <Dollar amount="$2,129.89" />
              <StatusBadge status="paid" />
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="text-sm font-medium text-gray-800">2nd Installment</div>
              <div className="text-xs text-gray-400">Due Apr 10, 2026</div>
            </div>
            <div className="flex items-center gap-3">
              <Dollar amount="$2,129.89" />
              <StatusBadge status="open" />
            </div>
          </div>
        </div>

        {/* Assessed values */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Assessed Values</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Land</div>
              <div className="text-sm font-semibold tabular-nums">$158,904</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Improvements</div>
              <div className="text-sm font-semibold tabular-nums">$123,815</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Exemption</div>
              <div className="text-sm font-semibold tabular-nums text-gray-400">$0</div>
            </div>
          </div>
        </div>

        {/* Supplemental note */}
        <div className="mt-3 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700 border border-blue-100">
          <span className="font-semibold">Note:</span> Supplemental taxes may be assessed upon change of ownership or completion of new construction (Rev. & Tax Code §75 et seq.). Prorate or pay at closing.
        </div>
      </div>
    </div>
  </div>
);

// ─── SECTION 6: OTHER FINDINGS ──────────────────────────────────────
const OtherFindingsContent = () => {
  const findings = [
    {
      icon: "☀️",
      type: "UCC FINANCING STATEMENT",
      item: "Item #10",
      description: "Debtor: Gabriel Nieto · Secured Party: Sunnova TE Management II LLC",
      recording: "20230294669",
      date: "May 5, 2023",
      impact: "medium",
      action: "Confirm solar lease/PPA terms; obtain subordination or payoff for lender clearance",
    },
    {
      icon: "☀️",
      type: "SOLAR SYSTEM NOTICE",
      item: "Item #11",
      description: "Notice of Independent Solar Energy System Producer Contract — Sunnova TE Management II LLC",
      recording: "20230295116",
      date: "May 5, 2023",
      impact: "medium",
      action: "Review contract terms; confirm system stays with property or is removed",
    },
    {
      icon: "🏛️",
      type: "REDEVELOPMENT AREA",
      item: "Item #8",
      description: "Property falls within Irwindale Community Redevelopment Agency project area",
      recording: "20071677750",
      date: "Jul 16, 2007",
      impact: "low",
      action: "Review for any active assessments or restrictions on development",
    },
    {
      icon: "📜",
      type: "UNINSURED DEED",
      item: "Item #6",
      description: "Deed from Isaac Nunez-Imperial to Gabriel Nieto — Company will not divest grantor's interest without affidavit",
      recording: "20161086137",
      date: "Sep 9, 2016",
      impact: "high",
      action: "Obtain signed, notarized Affidavit of Uninsured Deed",
    },
    {
      icon: "📋",
      type: "CC&Rs / EASEMENTS / MINERAL RIGHTS",
      item: "Item #5",
      description: "Standard exceptions for covenants, conditions, restrictions, easements or servitudes, and mineral rights appearing in public records",
      recording: "—",
      date: "Standard",
      impact: "low",
      action: "Standard Schedule B exceptions — review if specific restrictions are material to transaction",
    },
  ];

  const impactColor = { high: "text-red-600 bg-red-50", medium: "text-amber-600 bg-amber-50", low: "text-green-600 bg-green-50" };

  return (
    <div className="pt-4 space-y-2">
      {findings.map((f, i) => (
        <div key={i} className="border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <span>{f.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{f.type}</span>
            </div>
            <span className="text-xs font-mono text-gray-400">{f.item}</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{f.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Recording num={f.recording} date={f.date} />
            <span className={`px-1.5 py-0.5 rounded font-medium ${impactColor[f.impact]}`}>
              {f.impact.charAt(0).toUpperCase() + f.impact.slice(1)} impact
            </span>
            <span className="text-gray-500">→ {f.action}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── SECTION 7: DOCUMENT STATUS ─────────────────────────────────────
const DocStatusContent = () => (
  <div className="pt-4">
    <div className="divide-y divide-gray-100">
      <KV label="Report Type">CLTA Preliminary Report (Modified 11/17/06)</KV>
      <KV label="Effective Date">February 6, 2026 at 8:00am</KV>
      <KV label="Title Order" mono>20014370-GLT</KV>
      <KV label="Underwriter">Westcor Land Title Insurance Company (Florida Corp.)</KV>
      <KV label="Title Officer">Eddie LasMarias · (866) 724-1050</KV>
      <KV label="Pages">24 pages (8 report + 16 attachments/boilerplate)</KV>
      <KV label="Completeness">
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Complete — no missing sections detected
        </span>
      </KV>
    </div>
    <div className="mt-4 bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500 border border-gray-200">
      <span className="font-semibold text-gray-700">Notes from report:</span> No conveyances within 24 months. CLTA Endorsement 100 and 116 available. Reconveyance fee of $45 per deed of trust per CC §2941.
    </div>
  </div>
);

// ─── COMPLEXITY SCORE HEADER ────────────────────────────────────────
const ComplexityScore = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">File Complexity</h3>
      <span className="text-xs text-gray-400">4657 Merced Ave · Order 20014370-GLT</span>
    </div>
    <div className="flex items-center gap-6 mb-3">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-2xl font-bold text-gray-900">2</span>
        <span className="text-xs text-gray-400">Blockers</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-amber-500" />
        <span className="text-2xl font-bold text-gray-900">4</span>
        <span className="text-xs text-gray-400">Material</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-blue-400" />
        <span className="text-2xl font-bold text-gray-900">1</span>
        <span className="text-xs text-gray-400">Info</span>
      </div>
    </div>
    {/* Simple progress bar */}
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
      <div className="bg-red-500 h-full" style={{ width: "29%" }} />
      <div className="bg-amber-400 h-full" style={{ width: "57%" }} />
      <div className="bg-blue-300 h-full" style={{ width: "14%" }} />
    </div>
    <p className="text-xs text-gray-500 mt-2">
      <span className="font-medium text-gray-700">Moderately complex file.</span> Two blocking SOI requirements, two DOTs to pay off, solar panel lien, and an uninsured deed. Estimated clearance: 5–10 business days.
    </p>
  </div>
);

// ─── MAIN LAYOUT ────────────────────────────────────────────────────
export default function TessaPrelimOutputPrototype() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">TESSA™ Prelim Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">4657 Merced Avenue, Baldwin Park, CA 91706</p>
        </div>

        {/* Complexity Score */}
        <ComplexityScore />

        {/* Sections */}
        <SectionCard title="Title Requirements" icon="✓" accentColor="#059669" count="7 items" defaultOpen={true}>
          <RequirementsContent />
        </SectionCard>

        <SectionCard title="Summary" icon="Σ" accentColor="#2563eb" defaultOpen={true}>
          <SummaryContent />
        </SectionCard>

        <SectionCard title="Property Information" icon="P" accentColor="#7c3aed">
          <PropertyContent />
        </SectionCard>

        <SectionCard title="Liens & Judgments" icon="$" accentColor="#dc2626" count="2 DOTs · $283,200">
          <LiensContent />
        </SectionCard>

        <SectionCard title="Taxes & Assessments" icon="T" accentColor="#d97706" count="1 parcel">
          <TaxContent />
        </SectionCard>

        <SectionCard title="Other Findings" icon="!" accentColor="#6b7280" count="5 items">
          <OtherFindingsContent />
        </SectionCard>

        <SectionCard title="Document Status" icon="i" accentColor="#0891b2">
          <DocStatusContent />
        </SectionCard>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">
            AI-generated analysis for informational purposes only. Not a legal opinion. 
            Always verify with your escrow officer or title representative.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            📞 Questions? Call PCT: (714) 516-6700 · pct.com/contact
          </p>
        </div>
      </div>
    </div>
  );
}
