"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { BookOpen, Search, ArrowRight, AlertCircle } from "lucide-react"

const titleTerms = [
  { term: "Abstract of Title", definition: "A summary of all of the recorded instruments and proceedings which affect the title to property, arranged in the order of recording." },
  { term: "Acknowledgment", definition: "A formal declaration before a duly authorized officer (e.g., a Notary Public) by a person who has executed an instrument, that such execution is his or her act and deed." },
  { term: "Acquisition", definition: "The act or process by which a person procures property." },
  { term: "Acre", definition: "A measure of land equaling 43,560 square feet." },
  { term: "Administrator", definition: "A person appointed by the probate court to administer the estate of a person who died intestate (without a will)." },
  { term: "Adverse Possession", definition: "A method of acquiring title to real property by possession for a statutory period under certain conditions." },
  { term: "Affidavit", definition: "A written statement or declaration, sworn to or affirmed before some officer who has authority to administer an oath." },
  { term: "ALTA", definition: "American Land Title Association - the national trade association of the land title insurance industry which has adopted certain standard forms of title insurance policies." },
  { term: "Amendment", definition: "A change either to alter, add to, or correct part of an agreement without changing the principal idea or essence." },
  { term: "Amortization", definition: "Payment of a financial obligation in installments; recovery over a period of time, of cost or value." },
  { term: "Appurtenance", definition: "That which belongs to something else; an adjunct; an appendage; something annexed to another thing more worthy." },
  { term: "Assessment", definition: "A specific levy for a definite purpose, such as adding curbs or sewers in a neighborhood." },
  { term: "Assessor", definition: "One who sets value on property for taxation purposes." },
  { term: "Assignment", definition: "The method by which a right, a specialty, or contract is transferred from one person to another." },
  { term: "Assumption of Mortgage", definition: "The taking of a title to property by a grantee wherein the grantee assumes liability for payment of an existing note secured by a mortgage or deed of trust against the property." },
  { term: "Beneficiary", definition: "One entitled to the benefit of a trust; one who receives profit from an estate, the title of which is vested in a trustee." },
  { term: "Binder", definition: "A written agreement to issue a title insurance policy." },
  { term: "Blanket Mortgage", definition: "A single mortgage which covers more than one piece of real property." },
  { term: "Bona Fide Purchaser", definition: "A purchaser in good faith for valuable consideration without notice of adverse claims." },
  { term: "Boundary", definition: "The perimeter or border of a parcel of land; the limits of a piece of property." },
  { term: "CC&Rs", definition: "Covenants, Conditions, and Restrictions. A document that controls the use, requirements, and restrictions of a property." },
  { term: "Certificate of Title", definition: "In areas where attorneys examine abstracts or chains of title, a written opinion, executed by the examining attorney, stating that title is vested as stated in the abstract." },
  { term: "Chain of Title", definition: "A chronological list of documents which comprise the recorded history of title to a specific parcel of real property." },
  { term: "Clear Title", definition: "A title which is free of liens and encumbrances and which is marketable." },
  { term: "Closing", definition: "The consummation of a real estate transaction; the delivery of a deed and payment of the purchase price." },
  { term: "Cloud on Title", definition: "An outstanding claim or encumbrance which adversely affects the marketability of title." },
  { term: "Co-Insurance", definition: "A sharing of the risk of an insurance policy by more than one insurer." },
  { term: "Commitment", definition: "A written promise to make or insure a loan for a specified amount and on specified terms." },
  { term: "Community Property", definition: "Property owned jointly by husband and wife; each has an undivided one-half interest." },
  { term: "Condemnation", definition: "The taking of private property for a public purpose with compensation to the owner under the right of eminent domain." },
  { term: "Condition", definition: "A qualification, restriction, or limitation that modifies or destroys the original act with which it is connected." },
  { term: "Condominium", definition: "A system of individual ownership of units in a multi-unit structure, combined with joint ownership of common areas." },
  { term: "Consideration", definition: "The inducement to a contract; the cause, motive, price, or impelling influence which induces a contracting party to enter into a contract." },
  { term: "Construction Loan", definition: "A loan made to finance the actual construction of improvements on land." },
  { term: "Conveyance", definition: "A written instrument transferring the title to land from one person to another." },
  { term: "Covenant", definition: "An agreement between two or more persons, by deed, whereby one of the parties promises the performance or nonperformance of certain acts." },
  { term: "Deed", definition: "A written instrument which, when executed and delivered, conveys title to or an interest in real property." },
  { term: "Deed of Trust", definition: "An instrument used in many states in place of a mortgage. Property is transferred to a trustee by the borrower, in favor of the lender, and reconveyed upon payment in full." },
  { term: "Default", definition: "Failure to perform a duty or discharge an obligation; failure to meet the mortgage payment." },
  { term: "Defeasance", definition: "An instrument which defeats the force or operation of some other deed or estate." },
  { term: "Defect in Title", definition: "Any recorded instrument that would prevent a grantor from giving a clear title." },
  { term: "Documentary Transfer Tax", definition: "A tax applied to all sales or transfers of real property, where the consideration exceeds $100. It is based upon the sale price." },
  { term: "Dominant Tenement", definition: "An estate which has an easement over another estate." },
  { term: "Dower", definition: "The legal right or interest a wife has in her husband's real estate by virtue of their marriage." },
  { term: "Due on Sale Clause", definition: "A clause in a loan document that provides that the loan must be paid in full if the property is sold." },
  { term: "Earnest Money", definition: "A sum of money given to bind an agreement, particularly an agreement for the purchase of real estate." },
  { term: "Easement", definition: "A right, privilege, or interest in the land of another, such as the right of a public utility company to lay pipes." },
  { term: "Eminent Domain", definition: "The power of the government to take private property for public use upon payment of just compensation." },
  { term: "Encroachment", definition: "A building, part of a building, or obstruction which intrudes upon or invades a highway or sidewalk or trespasses upon the property of another." },
  { term: "Encumbrance", definition: "Anything which affects or limits the fee simple title to property, such as mortgages, easements, or restrictions of any kind." },
  { term: "Endorsement", definition: "An amendment to an insurance policy; a rider." },
  { term: "Equity", definition: "The interest or value that an owner has in real estate over and above the liens against it." },
  { term: "Escheat", definition: "The reverting of property to the state when heirs capable of inheriting are lacking." },
  { term: "Escrow", definition: "A transaction in which an impartial third party acts in the capacity of agent for both buyer and seller." },
  { term: "Estate", definition: "The degree, quantity, nature, and extent of ownership interest that a person has in real property." },
  { term: "Exception", definition: "An exclusion of part of the premises conveyed from the covenant of warranty; also, a specification in a title insurance policy of an item or defect not covered." },
  { term: "Exclusions from Coverage", definition: "Items or matters not covered under an insurance policy." },
  { term: "Executor", definition: "A person named in a will to carry out its provisions." },
  { term: "Fee Simple", definition: "The greatest interest in a parcel of land that it is possible to own." },
  { term: "Fiduciary", definition: "One who is entrusted to act in the interest of another; a trustee." },
  { term: "First Mortgage", definition: "A mortgage that is a first lien on the property pledged as security." },
  { term: "Fixture", definition: "An article of personal property which has been attached to real property in such a manner as to become part of the real property." },
  { term: "Foreclosure", definition: "The enforcement of a lien by the sale of real property resulting from a borrower's failure to pay a debt." },
  { term: "Fraud", definition: "An intentional misrepresentation of a material fact made to induce another to part with something of value." },
  { term: "Freehold", definition: "An estate in fee simple or for life." },
  { term: "General Warranty Deed", definition: "A deed containing a covenant whereby the seller agrees to protect the buyer against claims arising out of any past defect in title." },
  { term: "Good Faith", definition: "Honesty of intention, and freedom from knowledge of circumstances which should put the holder upon inquiry." },
  { term: "Grant", definition: "To convey real property; the operative words in a conveyance of real estate are to 'grant, bargain, and sell'." },
  { term: "Grant Deed", definition: "A deed in which the grantor warrants that they have not previously conveyed the estate being conveyed." },
  { term: "Grantee", definition: "The person to whom a grant is made." },
  { term: "Grantor", definition: "The person who makes a grant." },
  { term: "Heirs and Assigns", definition: "Words usually found in a deed demonstrating the interest granted to the grantee." },
  { term: "Homestead", definition: "A house and the land surrounding it occupied by the owner and protected by law from forced sale." },
  { term: "Implied", definition: "That which is understood from the nature of the transaction though not expressly stated." },
  { term: "Improvements", definition: "Additions to raw land tending to increase its value, such as buildings, streets, sewers, etc." },
  { term: "Indemnity", definition: "Insurance or other security against possible loss." },
  { term: "Ingress and Egress", definition: "The right to enter and leave premises." },
  { term: "Instrument", definition: "A formal legal document such as a contract, deed, or will." },
  { term: "Insured", definition: "The party protected against loss by title insurance." },
  { term: "Intestate", definition: "Without making a will; a person who dies without making a will." },
  { term: "Joint Tenancy", definition: "A form of ownership in which the tenants own a property equally. If one owner dies, the other owner automatically receives the deceased owner's share." },
  { term: "Judgment", definition: "A decree of a court. In practice, a judgment is the lien or charge upon the lands of a debtor resulting from the court's award of money to a creditor." },
  { term: "Junior Mortgage", definition: "A mortgage second in lien to a previous mortgage." },
  { term: "Land Contract", definition: "A contract for the purchase of real property in which the buyer makes periodic payments and receives the deed only when the full purchase price has been paid." },
  { term: "Lease", definition: "A grant of the use of lands for a term of years in consideration of the payment of a monthly or annual rent." },
  { term: "Leasehold", definition: "The interest in real property of a lessee or tenant." },
  { term: "Legal Description", definition: "A description of a specific parcel of real estate sufficient to identify it for legal purposes." },
  { term: "Lessee", definition: "The tenant; one who holds an estate by virtue of a lease." },
  { term: "Lessor", definition: "The landlord; one who grants an estate by virtue of a lease." },
  { term: "Lien", definition: "A claim or charge on property for payment of some debt, obligation, or duty." },
  { term: "Life Estate", definition: "An estate or interest in real property which is held for the duration of the life of some certain person." },
  { term: "Lis Pendens", definition: "A notice of pending litigation recorded to give constructive notice to third parties." },
  { term: "Lot", definition: "A measured portion of land." },
  { term: "Marketable Title", definition: "A title free from reasonable doubt of defect which can be readily sold or mortgaged to a reasonably prudent purchaser or mortgagee." },
  { term: "Mechanic's Lien", definition: "A lien allowed by statute to contractors, laborers, and materialmen on buildings or other structures upon which work has been performed." },
  { term: "Metes and Bounds", definition: "A method of describing land by setting forth the distances and directions of the boundary lines." },
  { term: "Mortgage", definition: "A conditional conveyance of property as security for the payment of a debt or the fulfillment of some obligation." },
  { term: "Mortgagee", definition: "The lender under a mortgage." },
  { term: "Mortgagor", definition: "The borrower under a mortgage." },
  { term: "Notary Public", definition: "A public officer authorized to acknowledge and certify deeds and other documents." },
  { term: "Note", definition: "An instrument of credit given to attest a debt." },
  { term: "Opinion of Title", definition: "An opinion of an attorney or title company as to the status of title to land." },
  { term: "Owner's Policy", definition: "A title insurance policy that protects the property owner against loss." },
  { term: "Patent", definition: "A conveyance of land by the government." },
  { term: "Personal Property", definition: "Property which is not real property; movable property." },
  { term: "Plat", definition: "A map of land subdivided into lots with streets, alleys, and easements." },
  { term: "Policy", definition: "A written contract of insurance." },
  { term: "Power of Attorney", definition: "An instrument authorizing another to act on one's behalf as their agent or attorney in fact." },
  { term: "Premium", definition: "The amount paid for insurance coverage." },
  { term: "Prescription", definition: "A method of acquiring an easement by long continued use." },
  { term: "Priority", definition: "The order of preference, rank, or position of the various liens and encumbrances on a title." },
  { term: "Probate", definition: "The judicial process of establishing the validity of a will." },
  { term: "Proration", definition: "The adjustment of taxes, interest, or other charges based on the portion of time the property was owned." },
  { term: "Purchase Agreement", definition: "A written agreement between buyer and seller for the purchase of property." },
  { term: "Quiet Title", definition: "A court action to establish ownership of property and eliminate any adverse claims." },
  { term: "Quitclaim Deed", definition: "A deed which transfers whatever interest the grantor may have in the property without warranties." },
  { term: "Real Property", definition: "Land and everything permanently attached to it." },
  { term: "Recording", definition: "Filing documents affecting title to property with the appropriate government office." },
  { term: "Reconveyance", definition: "A document that releases the lien of a deed of trust when the debt is paid." },
  { term: "Reformation", definition: "A court action to correct a deed or other document that does not reflect the true intent of the parties." },
  { term: "Release", definition: "The giving up or abandoning of a claim or right." },
  { term: "Remainder", definition: "An estate in property created simultaneously with other estates, to be enjoyed after the other estates terminate." },
  { term: "RESPA", definition: "Real Estate Settlement Procedures Act; a federal law that requires lenders to provide disclosures to borrowers." },
  { term: "Restriction", definition: "A limitation on the use of property, usually found in the deed or plat." },
  { term: "Reversion", definition: "The return of property to the grantor or the grantor's heirs after the termination of an estate." },
  { term: "Right of Way", definition: "The right to pass over another's land." },
  { term: "Schedule A", definition: "That portion of a title insurance policy which describes the land and shows the interest to be insured." },
  { term: "Schedule B", definition: "That portion of a title insurance policy which contains the exceptions from coverage." },
  { term: "Second Mortgage", definition: "A mortgage that is junior to a first mortgage." },
  { term: "Servient Tenement", definition: "An estate burdened by an easement in favor of another estate." },
  { term: "Special Warranty Deed", definition: "A deed in which the grantor warrants title only against defects arising during the time they owned the property." },
  { term: "Subdivision", definition: "The division of land into smaller parcels." },
  { term: "Subordination", definition: "The placing of a lien in a lower position relative to another lien." },
  { term: "Subrogation", definition: "The substitution of one party for another with reference to a claim or right." },
  { term: "Survey", definition: "A measurement of land, prepared by a licensed surveyor, showing the boundaries." },
  { term: "Tax Deed", definition: "A deed issued to the purchaser at a tax sale." },
  { term: "Tax Lien", definition: "A lien placed on property for nonpayment of taxes." },
  { term: "Tax Sale", definition: "A sale of property for nonpayment of taxes." },
  { term: "Tenancy in Common", definition: "A form of ownership in which each owner has an undivided interest in the whole property." },
  { term: "Tenant", definition: "One who holds or possesses land or tenements by any kind of right or title." },
  { term: "Title", definition: "The right to ownership of land; evidence of such ownership." },
  { term: "Title Defect", definition: "Any possible claim against title that would affect its marketability." },
  { term: "Title Insurance", definition: "Insurance against loss or damage resulting from defects in title." },
  { term: "Title Plant", definition: "The collection of title information maintained by a title company." },
  { term: "Title Search", definition: "An examination of public records to determine ownership and encumbrances on property." },
  { term: "Tract", definition: "A parcel of land." },
  { term: "Transfer Tax", definition: "Tax paid when title passes from one owner to another." },
  { term: "Trust", definition: "A right in property held by one party for the benefit of another." },
  { term: "Trust Deed", definition: "A deed conveying land to a trustee as security for a debt." },
  { term: "Trustee", definition: "One who holds title to property for the benefit of another." },
  { term: "Trustor", definition: "The borrower who conveys property to a trustee as security for a loan." },
  { term: "Unencumbered", definition: "Free and clear of liens and encumbrances." },
  { term: "Vesting", definition: "The manner in which title to property is held." },
  { term: "Void", definition: "That which is unenforceable; having no force or effect." },
  { term: "Voidable", definition: "That which is capable of being adjudged void, but is not void unless action is taken to make it so." },
  { term: "Warranty", definition: "A promise that certain facts are true." },
  { term: "Warranty Deed", definition: "A deed containing one or more covenants of title." },
  { term: "Zoning", definition: "The regulation of land use by local government." },
]

// Group terms by first letter
const groupTermsByLetter = (terms: typeof titleTerms) => {
  const grouped: Record<string, typeof titleTerms> = {}
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

export default function CommonTitleTermsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTerms = useMemo(() => {
    if (!searchQuery) return titleTerms
    return titleTerms.filter(
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
        <span className="text-primary font-medium">Common Title Terms</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{titleTerms.length}+ terms</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
          Common Title Terminology
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          A comprehensive glossary of real estate and title industry terms, explained in simple language.
        </p>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> These definitions are provided for general informational purposes only 
          and should not be construed as legal advice. Consult with a qualified attorney for legal 
          interpretations.
        </p>
      </div>

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
            href="/learn/what-is-title-insurance"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                What is Title Insurance?
              </p>
              <p className="text-sm text-gray-500">Understanding the basics</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/learn/escrow-terms"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                Escrow Terms Glossary
              </p>
              <p className="text-sm text-gray-500">100+ escrow terms explained</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </article>
  )
}
