export interface LocationAddress {
  street: string
  suite?: string
  city: string
  state: string
  zip: string
}

export interface LocationCoordinates {
  lat: number
  lng: number
}

export interface Location {
  slug: string
  name: string
  isHQ: boolean
  address: LocationAddress
  phone: string
  tollFree: string
  fax: string
  email: string
  hours: string
  coordinates: LocationCoordinates
  googleMapsUrl: string
  services: string[]
}

export const locations: Location[] = [
  {
    slug: "orange",
    name: "Orange",
    isHQ: true,
    address: {
      street: "1111 E. Katella Ave",
      suite: "Suite 120",
      city: "Orange",
      state: "CA",
      zip: "92867",
    },
    phone: "(714) 516-6700",
    tollFree: "(866) 724-1050",
    fax: "(714) 516-6799",
    email: "orange@pct.com",
    hours: "Monday - Friday: 8:00 AM - 5:00 PM",
    coordinates: { lat: 33.7879, lng: -117.8531 },
    googleMapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.5!2d-117.8531!3d33.7879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcdea8d8d7b4b7%3A0x5c7d1d8c8e8f8f8f!2s1111%20E%20Katella%20Ave%20%23120%2C%20Orange%2C%20CA%2092867!5e0!3m2!1sen!2sus!4v1234567890",
    services: [
      "Residential Title Insurance",
      "Commercial Title Insurance",
      "Escrow Services",
      "1031 Exchange Services",
      "Lender Services",
      "Mobile Signing Services",
    ],
  },
  {
    slug: "downey",
    name: "Downey",
    isHQ: false,
    address: {
      street: "8141 E. 2nd St",
      suite: "Suite 300",
      city: "Downey",
      state: "CA",
      zip: "90241",
    },
    phone: "(562) 862-4242",
    tollFree: "(866) 724-1050",
    fax: "(562) 862-4243",
    email: "downey@pct.com",
    hours: "Monday - Friday: 8:00 AM - 5:00 PM",
    coordinates: { lat: 33.9425, lng: -118.1320 },
    googleMapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.5!2d-118.1320!3d33.9425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s8141%20E%202nd%20St%20%23300%2C%20Downey%2C%20CA%2090241!5e0!3m2!1sen!2sus!4v1234567890",
    services: [
      "Residential Title Insurance",
      "Commercial Title Insurance",
      "Escrow Services",
      "1031 Exchange Services",
      "Mobile Signing Services",
    ],
  },
  {
    slug: "fresno",
    name: "Fresno",
    isHQ: false,
    address: {
      street: "7485 N. Palm Ave",
      suite: "Suite 110",
      city: "Fresno",
      state: "CA",
      zip: "93711",
    },
    phone: "(559) 436-2600",
    tollFree: "(866) 724-1050",
    fax: "(559) 436-2601",
    email: "fresno@pct.com",
    hours: "Monday - Friday: 8:00 AM - 5:00 PM",
    coordinates: { lat: 36.8281, lng: -119.8050 },
    googleMapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.5!2d-119.8050!3d36.8281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s7485%20N%20Palm%20Ave%20%23110%2C%20Fresno%2C%20CA%2093711!5e0!3m2!1sen!2sus!4v1234567890",
    services: [
      "Residential Title Insurance",
      "Commercial Title Insurance",
      "Escrow Services",
      "Mobile Signing Services",
    ],
  },
  {
    slug: "glendale",
    name: "Glendale",
    isHQ: false,
    address: {
      street: "655 N. Central Ave",
      suite: "Suite 1700",
      city: "Glendale",
      state: "CA",
      zip: "91203",
    },
    phone: "(818) 507-5050",
    tollFree: "(866) 724-1050",
    fax: "(818) 507-5051",
    email: "glendale@pct.com",
    hours: "Monday - Friday: 8:00 AM - 5:00 PM",
    coordinates: { lat: 34.1477, lng: -118.2551 },
    googleMapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.5!2d-118.2551!3d34.1477!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s655%20N%20Central%20Ave%20%231700%2C%20Glendale%2C%20CA%2091203!5e0!3m2!1sen!2sus!4v1234567890",
    services: [
      "Residential Title Insurance",
      "Commercial Title Insurance",
      "Escrow Services",
      "1031 Exchange Services",
      "Mobile Signing Services",
    ],
  },
  {
    slug: "inland-empire",
    name: "Inland Empire",
    isHQ: false,
    address: {
      street: "3401 Centrelake Dr",
      suite: "Suite 150",
      city: "Ontario",
      state: "CA",
      zip: "91761",
    },
    phone: "(909) 483-4700",
    tollFree: "(866) 724-1050",
    fax: "(909) 483-4701",
    email: "inlandempire@pct.com",
    hours: "Monday - Friday: 8:00 AM - 5:00 PM",
    coordinates: { lat: 34.0633, lng: -117.5877 },
    googleMapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.5!2d-117.5877!3d34.0633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s3401%20Centrelake%20Dr%20%23150%2C%20Ontario%2C%20CA%2091761!5e0!3m2!1sen!2sus!4v1234567890",
    services: [
      "Residential Title Insurance",
      "Commercial Title Insurance",
      "Escrow Services",
      "1031 Exchange Services",
      "Lender Services",
      "Mobile Signing Services",
    ],
  },
  {
    slug: "san-diego",
    name: "San Diego",
    isHQ: false,
    address: {
      street: "701 B Street",
      suite: "Suite 1020",
      city: "San Diego",
      state: "CA",
      zip: "92101",
    },
    phone: "(619) 236-0612",
    tollFree: "(866) 724-1050",
    fax: "(619) 236-0613",
    email: "sandiego@pct.com",
    hours: "Monday - Friday: 8:00 AM - 5:00 PM",
    coordinates: { lat: 32.7157, lng: -117.1611 },
    googleMapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.5!2d-117.1611!3d32.7157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s701%20B%20Street%20%231020%2C%20San%20Diego%2C%20CA%2092101!5e0!3m2!1sen!2sus!4v1234567890",
    services: [
      "Residential Title Insurance",
      "Commercial Title Insurance",
      "Escrow Services",
      "1031 Exchange Services",
      "Mobile Signing Services",
    ],
  },
]

// Helper function to get a location by slug
export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((location) => location.slug === slug)
}

// Get headquarters location
export function getHQLocation(): Location {
  return locations.find((location) => location.isHQ) || locations[0]
}

// Get all location slugs for static generation
export function getAllLocationSlugs(): string[] {
  return locations.map((location) => location.slug)
}

// Format full address
export function formatAddress(address: LocationAddress): string {
  const parts = [address.street]
  if (address.suite) parts.push(address.suite)
  parts.push(`${address.city}, ${address.state} ${address.zip}`)
  return parts.join(", ")
}

// Get Google Maps directions URL
export function getDirectionsUrl(address: LocationAddress): string {
  const fullAddress = `${address.street}${address.suite ? " " + address.suite : ""}, ${address.city}, ${address.state} ${address.zip}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`
}
