"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Phone, Mail, Clock, ChevronRight } from "lucide-react"

const locations = [
  {
    id: "orange",
    name: "Orange",
    isHQ: true,
    address: "1111 E. Katella Ave, Suite 120",
    city: "Orange, CA 92867",
    phone: "(714) 516-6700",
    tollFree: "(866) 724-1050",
    fax: "(714) 516-6799",
    email: "orange@pct.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    position: { top: "68%", left: "72%" },
  },
  {
    id: "glendale",
    name: "Glendale",
    address: "655 N. Central Ave, Suite 1550",
    city: "Glendale, CA 91203",
    phone: "(818) 649-0930",
    fax: "(818) 649-0931",
    email: "glendale@pct.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    position: { top: "62%", left: "68%" },
  },
  {
    id: "downey",
    name: "Downey",
    address: "8141 E. 2nd St, Suite 400",
    city: "Downey, CA 90241",
    phone: "(562) 869-5550",
    fax: "(562) 869-5560",
    email: "downey@pct.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    position: { top: "66%", left: "66%" },
  },
  {
    id: "inland-empire",
    name: "Inland Empire",
    address: "3281 E. Guasti Road, Suite 700",
    city: "Ontario, CA 91761",
    phone: "(909) 483-1850",
    fax: "(909) 483-1860",
    email: "ie@pct.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    position: { top: "64%", left: "78%" },
  },
  {
    id: "fresno",
    name: "Fresno",
    address: "7433 N. First St, Suite 104",
    city: "Fresno, CA 93720",
    phone: "(559) 435-0520",
    fax: "(559) 435-0525",
    email: "fresno@pct.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    position: { top: "38%", left: "58%" },
  },
]

export function LocationsMap() {
  const [selectedLocation, setSelectedLocation] = useState(locations[0])

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Our California Offices</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            With 5 offices across California, we're always nearby to serve your title and escrow needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Map */}
          <div className="relative bg-gray-50 rounded-2xl p-8 min-h-[500px]">
            {/* California outline SVG */}
            <svg
              viewBox="0 0 200 300"
              className="w-full h-full max-h-[500px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simplified California shape */}
              <path
                d="M120 10 L160 30 L170 60 L165 100 L175 140 L180 180 L160 220 L140 260 L100 290 L80 280 L60 240 L50 200 L55 160 L45 120 L50 80 L70 40 L100 20 Z"
                fill="#e2e8f0"
                stroke="#cbd5e1"
                strokeWidth="2"
              />

              {/* Location pins */}
              {locations.map((location) => (
                <g
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className="cursor-pointer"
                  style={{
                    transform: `translate(${parseFloat(location.position.left)}%, ${parseFloat(location.position.top)}%)`,
                  }}
                >
                  <circle
                    cx={parseFloat(location.position.left) * 2}
                    cy={parseFloat(location.position.top) * 3}
                    r={selectedLocation.id === location.id ? 12 : 8}
                    fill={selectedLocation.id === location.id ? "#f26b2b" : "#03374f"}
                    className="transition-all duration-200"
                  />
                  {selectedLocation.id === location.id && (
                    <circle
                      cx={parseFloat(location.position.left) * 2}
                      cy={parseFloat(location.position.top) * 3}
                      r={18}
                      fill="none"
                      stroke="#f26b2b"
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* Location buttons */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                    selectedLocation.id === location.id
                      ? "bg-primary text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {location.name}
                  {location.isHQ && " (HQ)"}
                </button>
              ))}
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-primary">
                {selectedLocation.name}
                {selectedLocation.isHQ && (
                  <span className="ml-2 text-sm font-normal bg-accent/10 text-accent px-3 py-1 rounded-full">
                    Corporate Headquarters
                  </span>
                )}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedLocation.address}</p>
                  <p className="text-gray-600">{selectedLocation.city}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedLocation.phone}</p>
                  {selectedLocation.tollFree && (
                    <p className="text-gray-600">Toll-free: {selectedLocation.tollFree}</p>
                  )}
                  <p className="text-gray-500 text-sm">Fax: {selectedLocation.fax}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <a
                    href={`mailto:${selectedLocation.email}`}
                    className="font-medium text-primary hover:text-accent transition-colors"
                  >
                    {selectedLocation.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedLocation.hours}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  selectedLocation.address + " " + selectedLocation.city
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center"
              >
                Get Directions
              </a>
              <Link
                href={`/locations/${selectedLocation.id}`}
                className="flex-1 bg-white border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors text-center flex items-center justify-center gap-2"
              >
                View Office Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
