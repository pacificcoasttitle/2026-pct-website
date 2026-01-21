import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Contact Us | Pacific Coast Title Company",
  description:
    "Find a Pacific Coast Title office near you. Locations in Orange, Glendale, Downey, Inland Empire, and San Diego.",
}

const locations = [
  {
    name: "Orange",
    tag: "Corporate Headquarters",
    address: "1111 E. Katella Ave. Ste. 120",
    city: "Orange, CA 92867",
    phone: "(714) 516-6700",
    tollFree: "(866) 724-1050",
    fax: "(714) 516-6799",
    email: "orange@pct.com",
    hours: "Mon-Fri 8:00 AM - 5:00 PM",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=1111+E.+Katella+Ave+Ste+120+Orange+CA+92867",
  },
  {
    name: "Glendale",
    address: "516 Burchett St.",
    city: "Glendale, CA 91203",
    phone: "(818) 244-9644",
    fax: "(818) 244-9656",
    email: "glendale@pct.com",
    hours: "Mon-Fri 8:00 AM - 5:00 PM",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=516+Burchett+St+Glendale+CA+91203",
  },
  {
    name: "Downey",
    address: "8255 Firestone Blvd. Ste. 100",
    city: "Downey, CA 90241",
    phone: "(562) 803-4300",
    fax: "(562) 803-4310",
    email: "downey@pct.com",
    hours: "Mon-Fri 8:00 AM - 5:00 PM",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=8255+Firestone+Blvd+Ste+100+Downey+CA+90241",
  },
  {
    name: "Inland Empire",
    address: "3200 Inland Empire Blvd. Suite #235",
    city: "Ontario, CA 91764",
    phone: "(909) 476-9600",
    fax: "(909) 476-9610",
    email: "ontario@pct.com",
    hours: "Mon-Fri 8:00 AM - 5:00 PM",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=3200+Inland+Empire+Blvd+Suite+235+Ontario+CA+91764",
  },
  {
    name: "San Diego",
    address: "3914 Murphy Canyon Rd. Suite A120",
    city: "San Diego, CA 92123",
    phone: "(858) 244-1850",
    fax: "(858) 244-1860",
    email: "sandiego@pct.com",
    hours: "Mon-Fri 8:00 AM - 5:00 PM",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=3914+Murphy+Canyon+Rd+Suite+A120+San+Diego+CA+92123",
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/professional-title-company-office-team-meeting.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-secondary/90" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center pt-24 pb-16">
          <p className="text-primary font-semibold tracking-wide uppercase mb-4">Contact Us</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            We're Here to Help
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Questions about your transaction? Need to open escrow? Find the office nearest you or send us a message.
          </p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a 
              href="tel:+17145166700"
              className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Call Main Office</div>
                <div className="font-semibold text-secondary">(714) 516-6700</div>
              </div>
            </a>
            
            <a 
              href="mailto:cs@pct.com"
              className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Email Customer Service</div>
                <div className="font-semibold text-secondary">cs@pct.com</div>
              </div>
            </a>

            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Business Hours</div>
                <div className="font-semibold text-secondary">Mon-Fri 8am-5pm</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Our California Offices
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Five locations across Southern California to serve you better
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {locations.map((location) => (
              <div 
                key={location.name} 
                className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                  location.tag ? 'border-primary' : 'border-gray-100'
                }`}
              >
                {location.tag && (
                  <div className="bg-primary text-white text-sm font-medium text-center py-2">
                    {location.tag}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-secondary mb-4">{location.name}</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-gray-600">
                        {location.address}<br />
                        {location.city}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <a href={`tel:${location.phone.replace(/\D/g, '')}`} className="text-secondary hover:text-primary font-medium">
                          {location.phone}
                        </a>
                        {location.tollFree && (
                          <div className="text-gray-500 text-xs">Toll-free: {location.tollFree}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <a href={`mailto:${location.email}`} className="text-gray-600 hover:text-primary">
                        {location.email}
                      </a>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{location.hours}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <a
                      href={location.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
                    >
                      Get Directions
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Send Us a Message
              </h2>
              <p className="text-gray-600">
                Have a question or need assistance? Fill out the form below and we'll get back to you promptly.
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-secondary mb-2">
                    First Name *
                  </label>
                  <Input id="firstName" type="text" placeholder="John" required className="h-12" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-secondary mb-2">
                    Last Name *
                  </label>
                  <Input id="lastName" type="text" placeholder="Smith" required className="h-12" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-secondary mb-2">
                    Email *
                  </label>
                  <Input id="email" type="email" placeholder="john@example.com" required className="h-12" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-secondary mb-2">
                    Phone
                  </label>
                  <Input id="phone" type="tel" placeholder="(555) 555-5555" className="h-12" />
                </div>
              </div>

              <div>
                <label htmlFor="inquiryType" className="block text-sm font-semibold text-secondary mb-2">
                  What can we help you with? *
                </label>
                <select 
                  id="inquiryType" 
                  required
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select an option...</option>
                  <option value="open-escrow">Open an Escrow</option>
                  <option value="rate-quote">Get a Rate Quote</option>
                  <option value="existing-transaction">Question About Existing Transaction</option>
                  <option value="general">General Question</option>
                  <option value="agent-partner">Become an Agent Partner</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-secondary mb-2">
                  Message *
                </label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your needs or questions..." 
                  rows={5} 
                  required 
                  className="resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
                  Send Message
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 self-center">
                  We typically respond within 1 business day
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* TESSA CTA */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Need an Answer Right Now?
          </h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Our AI assistant TESSA can answer common questions about title, escrow, and closing costs instantly—24/7.
          </p>
          <Link
            href="/#tools"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Ask TESSA a Question
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
