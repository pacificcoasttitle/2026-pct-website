import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export const metadata = {
  title: "Contact Us | Pacific Coast Title Company",
  description:
    "Get in touch with Pacific Coast Title Company. Contact our team for title insurance and escrow services.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: "url(/professional-title-company-office-team-meeting.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative container mx-auto px-4 text-center">
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            We're here to help with your title and escrow needs
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Send Us a Message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                        Name *
                      </label>
                      <Input id="name" type="text" placeholder="Your name" required />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                        Email *
                      </label>
                      <Input id="email" type="email" placeholder="your@email.com" required />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                      Phone
                    </label>
                    <Input id="phone" type="tel" placeholder="(555) 555-5555" />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                      Subject *
                    </label>
                    <Input id="subject" type="text" placeholder="How can we help?" required />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea id="message" placeholder="Tell us about your needs..." rows={6} required />
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Contact Information</h2>

                <div className="space-y-8">
                  {/* Corporate Office */}
                  <div className="bg-muted/30 p-6 rounded-lg border border-border">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Corporate Office</h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground">
                            1111 E. Katella Ave. Ste 120
                            <br />
                            Orange, CA 92867
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground">(714) 516-6700</p>
                          <p className="text-muted-foreground">(866) 724-1050 (Toll Free)</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-muted-foreground">info@pct.com</p>
                          <p className="text-muted-foreground">cs@pct.com</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="bg-muted/30 p-6 rounded-lg border border-border">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Business Hours</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span className="font-semibold">8:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday - Sunday:</span>
                        <span className="font-semibold">Closed</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Locations */}
                  <div className="bg-primary/10 p-6 rounded-lg border-l-4 border-primary">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Multiple Locations</h3>
                    <p className="text-muted-foreground">
                      Pacific Coast Title serves clients throughout California with offices in Orange, Glendale, San
                      Diego, and more.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
