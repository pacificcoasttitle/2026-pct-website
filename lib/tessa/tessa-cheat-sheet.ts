// ============================================================
// TESSA™ Cheat Sheet Builder
// Returns structured data for the Realtor Cheat Sheet section.
// Ported from tessa-enhanced-script-3.3.0-guardrails.js
// ============================================================

import type { CheatSheetItem, PrelimFacts, RequirementType, RequirementSeverity } from './tessa-types'

export function getAgentExplanation(type: RequirementType | string): string {
  switch (type) {
    case 'reconveyance_confirmation':
      return "Proves an old loan/lien was actually released. Without it, a new buyer or lender could be behind that lien."
    case 'reconveyance_package':
      return "Title needs the payoff + reconveyance package (often including originals) to remove the Deed of Trust from title at closing."
    case 'multi_beneficiary_demand':
      return "When a loan has multiple beneficiaries or fractional interests, payoffs often require signatures from ALL parties—this can delay closing if not coordinated early."
    case 'hoa_clearance':
      return "HOA liens can block closing and may have their own payoff/clearance process. A current HOA demand/clearance letter prevents last-minute surprises."
    case 'statement_of_information_hits':
      return "This indicates possible name-index hits. A completed Statement of Information helps title eliminate false matches so unrelated liens don't attach."
    case 'statement_of_information':
      return "Clears name-index hits so unrelated liens don't attach. Title needs this to remove false matches."
    case 'unrecorded_docs_review':
      return "Unrecorded leases/agreements can create rights that must be insured or excepted. Title reviews them to avoid surprises."
    case 'survey_inspection':
      return "A survey/inspection can reveal encroachments, access, or possession issues that change what title can insure."
    case 'underwriting_review':
      return "Some deals require internal underwriting sign-off. Approval can affect timing and conditions."
    case 'trust_docs':
      return "Confirms trustees have authority to sell/encumber. Avoids challenges that the trust wasn't authorized."
    case 'spousal_joinder':
      return "Spouses can have community property rights. A signature avoids later claims and allows insurable conveyance."
    case 'corp_authority':
      return "Shows the corporation is authorized to sign. Title can't insure a sale/loan without corporate authority."
    case 'llc_authority':
      return "Confirms who can sign for the LLC and that it's in good standing. Prevents unauthorized signings."
    case 'suspended_corp_cure':
      return "A suspended company can't legally transfer property. Must revive before closing or title will not insure."
    default:
      return "Needed so title can insure the transaction without unresolved risk."
  }
}

interface ReqMeta {
  who: string
  eta: string
  script: string
}

function metaByType(type: RequirementType | string): ReqMeta {
  switch (type) {
    case 'statement_of_information':
    case 'statement_of_information_hits':
      return {
        who: "Seller(s) completes; Escrow collects",
        eta: "Same day (usually)",
        script: "Title needs a Statement of Information to clear name-based lien hits. It's confidential and helps us avoid false matches.",
      }
    case 'unrecorded_docs_review':
      return {
        who: "Agent/Seller provides copies (Escrow forwards)",
        eta: "1–2 days (depends on locating docs)",
        script: "Do you have any unrecorded leases, parking agreements, billboard licenses, or tenant deals? Title needs copies to insure without adding a broad exception.",
      }
    case 'survey_inspection':
      return {
        who: "Title/Escrow orders; Seller/Occupants cooperate",
        eta: "3–7 days",
        script: "A survey/inspection can reveal encroachments, access issues, or possession claims. Results can add requirements or exceptions.",
      }
    case 'underwriting_review':
      return {
        who: "Title (internal underwriting)",
        eta: "1–3 days",
        script: "This file requires underwriting review. It can add conditions, so we'll keep timing tight and respond quickly to any requests.",
      }
    case 'reconveyance_package':
    case 'reconveyance_confirmation':
      return {
        who: "Escrow requests; Lender/Trustee supplies",
        eta: "2–7 days (lender dependent)",
        script: "We need the payoff + reconveyance package so the old loan is removed from title at closing.",
      }
    case 'hoa_clearance':
      return {
        who: "Escrow requests from HOA",
        eta: "3–10 days",
        script: "We need a clearance letter from the HOA confirming all assessments are paid current before we can close.",
      }
    case 'trust_docs':
      return {
        who: "Seller/Trustee provides via Escrow",
        eta: "1–3 days",
        script: "We need a copy of the trust or a trust certification to confirm the trustee's authority to sign.",
      }
    case 'spousal_joinder':
      return {
        who: "Seller's spouse signs at escrow",
        eta: "Same day (coordination with both parties)",
        script: "The seller's spouse needs to sign the deed. We'll add them to the signing appointment.",
      }
    default:
      return {
        who: "Varies",
        eta: "Varies",
        script: "This item must be satisfied for title to insure without adding exceptions.",
      }
  }
}

export function buildCheatSheetItems(facts: PrelimFacts): CheatSheetItem[] {
  if (!facts?.requirements?.length) return []

  const groups = new Map<
    string,
    { type: RequirementType | string; items: typeof facts.requirements; sample: (typeof facts.requirements)[0] }
  >()

  for (const r of facts.requirements) {
    const type = r.classification?.type || 'unspecified'
    const key =
      type !== 'unspecified' ? type : (r.classification?.summary || (r.text || '').slice(0, 40))
    if (!groups.has(key)) groups.set(key, { type, items: [], sample: r })
    groups.get(key)!.items.push(r)
  }

  const items: CheatSheetItem[] = []

  for (const [, g] of groups) {
    const type = g.type
    const meta = metaByType(type)
    const itemNumbers = g.items
      .map((x) => x.item_no)
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b)
    const label = g.sample.classification?.summary || 'Company-stated requirement'
    const severity = (g.sample.classification?.severity || 'material') as RequirementSeverity
    const why = getAgentExplanation(type)

    items.push({
      itemNumbers,
      label,
      severity,
      whyItMatters: why,
      who: meta.who,
      timing: meta.eta,
      agentScript: meta.script,
    })
  }

  return items
}
