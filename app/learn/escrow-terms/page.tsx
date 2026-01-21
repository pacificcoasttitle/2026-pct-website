"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { BookOpen, Search, ArrowRight, Hash } from "lucide-react"

const escrowTerms = [
  { term: "Abstract of Title", definition: "A summary of all recorded documents affecting the title to a specific piece of real property." },
  { term: "Acceleration Clause", definition: "A provision in a loan that allows the lender to demand immediate payment of the entire principal balance if the borrower defaults." },
  { term: "Acknowledgment", definition: "A formal declaration before a notary public that a signature is genuine and was made voluntarily." },
  { term: "Adjustable Rate Mortgage (ARM)", definition: "A mortgage with an interest rate that changes periodically based on a financial index." },
  { term: "Adjustment Date", definition: "The date on which the interest rate changes for an adjustable-rate mortgage." },
  { term: "Affidavit", definition: "A written statement made under oath before a notary public or other authorized officer." },
  { term: "All-Inclusive Trust Deed (AITD)", definition: "A junior loan that includes the balance due on existing loans plus the amount of the new loan." },
  { term: "ALTA", definition: "American Land Title Association - the national trade association for the title insurance industry." },
  { term: "Amendment", definition: "A change or modification to the terms of a contract or legal document." },
  { term: "Amortization", definition: "The gradual repayment of a loan through scheduled periodic payments that include both principal and interest." },
  { term: "Annual Percentage Rate (APR)", definition: "The total yearly cost of a loan, including interest and fees, expressed as a percentage." },
  { term: "Appraisal", definition: "A professional estimate of a property's market value based on comparable sales and property characteristics." },
  { term: "Assessed Value", definition: "The value placed on a property by the county assessor for property tax purposes." },
  { term: "Assignment", definition: "The transfer of rights, title, or interest in property from one party to another." },
  { term: "Assumable Mortgage", definition: "A mortgage that can be transferred from the seller to the buyer, who takes over the remaining payments." },
  { term: "Beneficiary", definition: "The lender or note holder under a deed of trust; the person who benefits from a trust." },
  { term: "Beneficiary Statement", definition: "A document from the lender showing the unpaid balance, interest rate, and payment status of a loan." },
  { term: "Bill of Sale", definition: "A document transferring ownership of personal property from seller to buyer." },
  { term: "Broker", definition: "A licensed professional who assists in buying, selling, or financing real estate." },
  { term: "Buyer's Market", definition: "Market conditions where there are more properties for sale than there are buyers, giving buyers more negotiating power." },
  { term: "CC&Rs", definition: "Covenants, Conditions, and Restrictions - rules governing the use of property in a development or HOA." },
  { term: "Certificate of Eligibility", definition: "A document from the VA confirming a veteran's eligibility for a VA home loan." },
  { term: "Chain of Title", definition: "The chronological history of all transfers of ownership for a specific property." },
  { term: "Clear Title", definition: "A title free of liens, encumbrances, or legal questions about ownership." },
  { term: "Closing", definition: "The final step in a real estate transaction where documents are signed and ownership transfers." },
  { term: "Closing Costs", definition: "Fees and expenses beyond the purchase price paid at closing, including title insurance, escrow fees, and taxes." },
  { term: "Closing Disclosure", definition: "A five-page form that provides final details about the loan, including loan terms, projected payments, and closing costs." },
  { term: "Cloud on Title", definition: "Any document, claim, or condition that challenges or impairs the owner's title to property." },
  { term: "Commission", definition: "The fee paid to real estate agents for their services in a transaction, typically a percentage of the sale price." },
  { term: "Commitment", definition: "A written promise from a lender to provide financing under specified terms and conditions." },
  { term: "Comparable Sales (Comps)", definition: "Recently sold properties similar to the subject property, used to determine market value." },
  { term: "Conditions of Sale", definition: "Terms that must be met before a sale can close, such as financing approval or inspection results." },
  { term: "Condominium", definition: "A form of ownership where individuals own their units and share ownership of common areas." },
  { term: "Contingency", definition: "A condition that must be met before a contract becomes binding." },
  { term: "Conventional Loan", definition: "A mortgage not insured or guaranteed by a government agency." },
  { term: "Conveyance", definition: "The transfer of property ownership from one party to another." },
  { term: "Deed", definition: "A legal document that transfers ownership of real property from the grantor to the grantee." },
  { term: "Deed of Trust", definition: "A document that pledges property as security for a loan; similar to a mortgage in other states." },
  { term: "Default", definition: "Failure to fulfill a contractual obligation, such as making mortgage payments." },
  { term: "Demand", definition: "A formal request for payment of an obligation; also, a payoff statement from a lender." },
  { term: "Deposit", definition: "Money given as a show of good faith when making an offer; also called earnest money." },
  { term: "Disbursement", definition: "The payment of funds from escrow to various parties at closing." },
  { term: "Discount Points", definition: "Fees paid to the lender at closing to reduce the interest rate on a loan." },
  { term: "Documentary Transfer Tax", definition: "A tax imposed on property transfers, based on the sale price." },
  { term: "Down Payment", definition: "The portion of the purchase price paid by the buyer at closing, not financed by a loan." },
  { term: "Due Diligence", definition: "The process of investigating and verifying information about a property before completing a purchase." },
  { term: "Earnest Money", definition: "A deposit made by the buyer to demonstrate serious intent to purchase; held in escrow until closing." },
  { term: "Easement", definition: "A right to use another's property for a specific purpose, such as access or utilities." },
  { term: "Encroachment", definition: "A building, structure, or improvement that extends onto another's property." },
  { term: "Encumbrance", definition: "Any claim, lien, or liability attached to property that may affect its transfer or value." },
  { term: "Endorsement", definition: "An amendment to a title insurance policy that modifies coverage." },
  { term: "Equity", definition: "The difference between a property's market value and the amount owed on it." },
  { term: "Escrow", definition: "A neutral third-party arrangement where funds and documents are held until all conditions of a transaction are met." },
  { term: "Escrow Account", definition: "An account where funds are held pending completion of escrow; also, an account for property taxes and insurance." },
  { term: "Escrow Agent", definition: "A neutral party who holds funds and documents and carries out the instructions of the escrow agreement." },
  { term: "Escrow Instructions", definition: "Written directions signed by all parties specifying the terms and conditions of the escrow." },
  { term: "Exception", definition: "An item excluded from coverage in a title insurance policy." },
  { term: "Fair Market Value", definition: "The price a willing buyer would pay a willing seller in an open market transaction." },
  { term: "Fannie Mae", definition: "Federal National Mortgage Association - a government-sponsored enterprise that buys mortgages from lenders." },
  { term: "FHA Loan", definition: "A mortgage insured by the Federal Housing Administration, often with lower down payment requirements." },
  { term: "FICO Score", definition: "A credit score calculated by Fair Isaac Corporation, used by lenders to assess creditworthiness." },
  { term: "Fiduciary", definition: "A person in a position of trust who acts in the best interest of another party." },
  { term: "First Mortgage", definition: "A loan that has first priority for repayment in case of foreclosure." },
  { term: "Fixed-Rate Mortgage", definition: "A mortgage with an interest rate that remains constant throughout the loan term." },
  { term: "Foreclosure", definition: "The legal process by which a lender takes possession of property when the borrower defaults." },
  { term: "Freddie Mac", definition: "Federal Home Loan Mortgage Corporation - a government-sponsored enterprise that buys mortgages." },
  { term: "Funding", definition: "The disbursement of loan proceeds from the lender to escrow." },
  { term: "Good Faith Estimate", definition: "An estimate of closing costs provided by the lender (replaced by Loan Estimate under TRID)." },
  { term: "Grant Deed", definition: "A deed that transfers title with implied warranties that the grantor has not previously conveyed the property." },
  { term: "Grantee", definition: "The person receiving title to real property in a deed." },
  { term: "Grantor", definition: "The person transferring title to real property in a deed." },
  { term: "Hazard Insurance", definition: "Insurance that protects the property against damage from fire, storms, and other hazards." },
  { term: "HELOC", definition: "Home Equity Line of Credit - a revolving credit line secured by the equity in your home." },
  { term: "HOA", definition: "Homeowners Association - an organization that manages a community and enforces CC&Rs." },
  { term: "Home Inspection", definition: "A professional examination of a property's condition, typically paid for by the buyer." },
  { term: "Homeowner's Insurance", definition: "Insurance that combines hazard insurance with liability coverage for the property." },
  { term: "HUD-1", definition: "A settlement statement that itemizes all charges to buyer and seller (replaced by Closing Disclosure under TRID)." },
  { term: "Impound Account", definition: "An account held by the lender to pay property taxes and insurance premiums on behalf of the borrower." },
  { term: "Interest Rate", definition: "The percentage of the loan amount charged for borrowing money." },
  { term: "Joint Tenancy", definition: "A form of co-ownership where each owner has an equal, undivided interest with right of survivorship." },
  { term: "Judgment Lien", definition: "A claim against property resulting from a court judgment, typically for unpaid debts." },
  { term: "Junior Lien", definition: "A loan or lien that is subordinate to another lien on the same property." },
  { term: "Legal Description", definition: "The precise description of a property's boundaries used in legal documents." },
  { term: "Lender", definition: "The financial institution or individual providing the loan for a property purchase." },
  { term: "Lien", definition: "A legal claim against property as security for payment of a debt or obligation." },
  { term: "Lis Pendens", definition: "A recorded notice that litigation is pending that may affect title to property." },
  { term: "Loan Estimate", definition: "A three-page form that provides estimated loan terms and closing costs within three days of application." },
  { term: "Loan-to-Value (LTV)", definition: "The ratio of the loan amount to the property's appraised value." },
  { term: "Lock-In", definition: "A commitment from a lender to hold a specific interest rate for a set period." },
  { term: "Marketable Title", definition: "A title free of reasonable doubt as to who is the owner." },
  { term: "Mechanic's Lien", definition: "A claim against property by contractors or suppliers who provided labor or materials." },
  { term: "Mello-Roos", definition: "A special tax assessment district used to finance public improvements in California." },
  { term: "Modification", definition: "A change to the terms of an existing loan, such as interest rate or payment amount." },
  { term: "Mortgage", definition: "A legal document that pledges property as security for a loan; also used to refer to the loan itself." },
  { term: "Mortgage Insurance", definition: "Insurance that protects the lender if the borrower defaults, often required for loans with less than 20% down." },
  { term: "Notary Public", definition: "An official authorized to witness signatures and administer oaths." },
  { term: "Note", definition: "A written promise to repay a debt under specified terms; also called a promissory note." },
  { term: "Notice of Default", definition: "A recorded notice that a borrower is in default on a loan secured by the property." },
  { term: "Owner's Policy", definition: "Title insurance that protects the property owner against title defects." },
  { term: "PITI", definition: "Principal, Interest, Taxes, and Insurance - the four components of a typical mortgage payment." },
  { term: "PMI", definition: "Private Mortgage Insurance - insurance required for conventional loans with less than 20% down payment." },
  { term: "Power of Attorney", definition: "A legal document authorizing someone to act on behalf of another person." },
  { term: "Preliminary Title Report", definition: "A report showing the current ownership and all matters affecting title before a sale." },
  { term: "Prepayment Penalty", definition: "A fee charged by some lenders if a loan is paid off before its scheduled maturity date." },
  { term: "Principal", definition: "The amount of money borrowed, not including interest." },
  { term: "Proration", definition: "The division of expenses between buyer and seller based on the closing date." },
  { term: "Purchase Agreement", definition: "A contract between buyer and seller outlining the terms of a property sale." },
  { term: "Quitclaim Deed", definition: "A deed that transfers whatever interest the grantor may have, without warranties." },
  { term: "Rate Lock", definition: "A commitment from a lender to hold a specific interest rate for a defined period." },
  { term: "Recording", definition: "Filing a document with the county recorder to make it part of the public record." },
  { term: "Reconveyance", definition: "A document that releases the lien of a deed of trust when the loan is paid in full." },
  { term: "Refinance", definition: "Replacing an existing loan with a new loan, often to obtain better terms." },
  { term: "RESPA", definition: "Real Estate Settlement Procedures Act - federal law regulating disclosures and settlement costs." },
  { term: "Right of Way", definition: "The right to pass over property owned by another." },
  { term: "Second Mortgage", definition: "A loan secured by property that already has an existing mortgage." },
  { term: "Settlement Statement", definition: "A document itemizing all costs and credits in a real estate transaction." },
  { term: "Short Sale", definition: "A sale where the proceeds are less than the amount owed, requiring lender approval." },
  { term: "Subordination", definition: "The process of placing one loan in a lower priority position relative to another." },
  { term: "Survey", definition: "A measurement of land boundaries and improvements by a licensed surveyor." },
  { term: "Tax Lien", definition: "A lien placed on property for unpaid taxes." },
  { term: "Tenancy in Common", definition: "A form of co-ownership where each owner has a separate, transferable interest." },
  { term: "Title", definition: "The legal evidence of ownership of real property." },
  { term: "Title Insurance", definition: "Insurance that protects against financial loss from defects in title." },
  { term: "Title Search", definition: "An examination of public records to determine the ownership and condition of title." },
  { term: "Transfer Tax", definition: "A tax imposed on the transfer of property ownership." },
  { term: "Trust Deed", definition: "A document used in California that pledges property as security for a loan." },
  { term: "Trustee", definition: "The neutral third party in a deed of trust who holds title until the loan is paid." },
  { term: "Trustor", definition: "The borrower in a deed of trust." },
  { term: "TRID", definition: "TILA-RESPA Integrated Disclosure rules governing loan disclosures." },
  { term: "Underwriting", definition: "The process of evaluating a loan application and determining the risk of lending." },
  { term: "VA Loan", definition: "A mortgage guaranteed by the Department of Veterans Affairs for eligible veterans." },
  { term: "Vesting", definition: "The way title is held, such as joint tenancy, tenancy in common, or community property." },
  { term: "Walk-Through", definition: "A final inspection of the property by the buyer before closing." },
  { term: "Warranty Deed", definition: "A deed that includes warranties that the grantor has good title to convey." },
  { term: "Wire Transfer", definition: "Electronic transfer of funds between financial institutions." },
  { term: "Yield", definition: "The return on an investment, expressed as a percentage." },
  { term: "Zoning", definition: "Local government regulations controlling the use and development of property." },
]

// Group terms by first letter
const groupTermsByLetter = (terms: typeof escrowTerms) => {
  const grouped: Record<string, typeof escrowTerms> = {}
  terms.forEach((term) => {
    const letter = term.term[0].toUpperCase()
    if (!grouped[letter]) {
      grouped[letter] = []
    }
    grouped[letter].push(term)
  })
  return grouped
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default function EscrowTermsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTerms = useMemo(() => {
    if (!searchQuery) return escrowTerms
    return escrowTerms.filter(
      (item) =>
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const groupedTerms = useMemo(() => groupTermsByLetter(filteredTerms), [filteredTerms])

  const availableLetters = useMemo(() => Object.keys(groupedTerms).sort(), [groupedTerms])

  return (
    <article className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href="/learn" className="hover:text-primary">Learn</Link>
        <span className="text-gray-300">/</span>
        <span className="text-primary font-medium">Escrow Terms</span>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{escrowTerms.length}+ terms</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
          Escrow Terms
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Helping you get comfortable with the lingo. This glossary explains the most common 
          terms you'll encounter during the escrow process.
        </p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for a term..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Alphabet Jump Links */}
      <div className="flex flex-wrap gap-1 mb-8 p-4 bg-gray-50 rounded-xl">
        {alphabet.map((letter) => {
          const isAvailable = availableLetters.includes(letter)
          return isAvailable ? (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors"
            >
              {letter}
            </a>
          ) : (
            <span
              key={letter}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium text-gray-300"
            >
              {letter}
            </span>
          )
        })}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-gray-600 mb-6">
          Showing <span className="font-semibold text-secondary">{filteredTerms.length}</span> results
          for "<span className="text-primary">{searchQuery}</span>"
        </p>
      )}

      {/* Terms List */}
      <div className="space-y-8">
        {availableLetters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
            <div className="sticky top-20 bg-white z-10 py-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-lg">
                  {letter}
                </div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
            </div>
            <div className="space-y-4">
              {groupedTerms[letter].map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-secondary mb-2">{item.term}</h3>
                  <p className="text-gray-600">{item.definition}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* No Results */}
      {filteredTerms.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No terms found</h3>
          <p className="text-gray-500 mb-6">Try a different search term</p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Related Articles */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">Continue Learning</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/learn/what-is-escrow"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                What is Escrow?
              </p>
              <p className="text-sm text-gray-500">Understanding the basics</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/learn/common-title-terms"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                Common Title Terms
              </p>
              <p className="text-sm text-gray-500">200+ title industry terms</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </article>
  )
}
