import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, Shield, FileCheck, Users, Clock, Award } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "Residential Title Services | Pacific Coast Title Company",
  description:
    "Comprehensive residential title insurance and escrow services for homebuyers, sellers, and real estate professionals in California.",
}

export default function ResidentialTitlePage() {
  const faqs = [
    {
      question: "What is Title?",
      answer:
        "Title is the legal right to own, use, and dispose of property. It represents your ownership interest and includes the bundle of rights that come with property ownership—the right to possess, control, exclude others, enjoy, and dispose of the property.",
    },
    {
      question: "What is Title Insurance?",
      answer:
        "Title insurance protects property owners and lenders from financial loss due to defects in a property's title. Unlike other insurance that protects against future events, title insurance protects against past issues that may not have been discovered during the title search. It's a one-time premium paid at closing that provides protection for as long as you own the property.",
    },
    {
      question: "Title Insurance vs Traditional Insurance",
      answer:
        "Traditional insurance (like auto or home insurance) protects against future events and requires ongoing premium payments. Title insurance protects against past defects in title and requires only a one-time premium. While traditional insurance is based on risk assumption, title insurance focuses on risk prevention through comprehensive title searches before issuing a policy.",
    },
    {
      question: "What does Title Insurance Cover?",
      answer:
        "Title insurance covers a wide range of potential title defects including: mistakes in recording or indexing legal documents, forgeries and fraud, undisclosed or missing heirs, unpaid taxes and assessments, unpaid judgments and liens, unreleased mortgages, deeds executed by individuals of unsound mind, impersonation of true property owners, and defects that would prevent you from selling the property in the future.",
    },
    {
      question: "Who needs Title Insurance?",
      answer:
        "Anyone purchasing property should obtain an Owner's Title Insurance Policy to protect their equity and ownership rights. If you're financing your purchase, your lender will require a Lender's Title Insurance Policy to protect their investment. While the lender's policy is required, the owner's policy is optional but highly recommended to protect your financial interest in the property.",
    },
    {
      question: "How do I obtain Title Insurance?",
      answer:
        "Title insurance is typically obtained through a title company during the real estate transaction process. Once you have an accepted purchase agreement, you or your real estate agent will open escrow and order title insurance. The title company will conduct a thorough title search, identify and resolve any issues, and issue a policy at closing.",
    },
    {
      question: "What are the Title Insurance policy types?",
      answer:
        "There are two main types of title insurance policies: Owner's Policy protects the property owner's equity and ownership rights for as long as they or their heirs own the property. Lender's Policy (also called a Loan Policy) protects the mortgage lender's interest in the property up to the loan amount and remains in effect until the loan is paid off. Most residential transactions involve both policies.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: "url(/beautiful-modern-california-home-exterior-with-blu.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative container mx-auto px-4 text-center">
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Residential Title Services</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Helping Protect You
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Comprehensive title insurance and escrow services for your home purchase
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p className="text-lg">
                When you purchase a home, you're making one of life's most significant investments. Title insurance
                protects that investment by ensuring you receive clear, marketable title to your property—free from
                hidden defects that could threaten your ownership.
              </p>

              <p className="text-lg">
                Unlike traditional insurance that protects against future events, title insurance protects you from past
                defects in the property's title. These defects—such as forged deeds, undisclosed heirs, or recording
                errors—may not be discoverable even with the most thorough title search.
              </p>

              <div className="bg-primary/10 p-6 rounded-lg border-l-4 border-primary my-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">One-Time Premium, Lifetime Protection</h3>
                <p className="text-muted-foreground mb-0">
                  You pay for title insurance once at closing, and that single premium provides protection for as long
                  as you or your heirs own the property. No annual renewals, no additional premiums—just continuous
                  peace of mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Why Choose Pacific Coast Title
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Comprehensive Protection",
                  description:
                    "We conduct thorough title searches and resolve issues before closing, then provide ongoing insurance protection.",
                },
                {
                  icon: Clock,
                  title: "Efficient Processing",
                  description:
                    "Technology-driven processes and experienced professionals ensure timely, smooth transactions.",
                },
                {
                  icon: Users,
                  title: "Expert Support",
                  description:
                    "Dedicated title officers and escrow professionals guide you through every step of the process.",
                },
                {
                  icon: FileCheck,
                  title: "Clear Communication",
                  description:
                    "We keep all parties informed and explain complex title concepts in easy-to-understand terms.",
                },
                {
                  icon: Award,
                  title: "Nearly 20 Years of Experience",
                  description: "Trusted since 2005 to handle residential transactions with integrity and expertise.",
                },
                {
                  icon: Home,
                  title: "Local Knowledge",
                  description:
                    "Deep understanding of California real estate practices and county recording requirements.",
                },
              ].map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-border">
                  <benefit.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="text-lg font-semibold text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Work With Us?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Whether you're buying your first home or your fifth, Pacific Coast Title is here to protect your investment
            with expert service and comprehensive coverage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white hover:bg-white/90 text-primary border-white"
            >
              <Link href="/title-services/what-is-title-insurance">Learn More About Title Insurance</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
