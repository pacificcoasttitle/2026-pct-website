/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Consolidate /title-services/* → /learn/* or /services/*
      {
        source: "/title-services/what-is-title-insurance",
        destination: "/learn/what-is-title-insurance",
        permanent: true,
      },
      {
        source: "/title-services/benefits-title-insurance",
        destination: "/learn/benefits-of-title-insurance",
        permanent: true,
      },
      {
        source: "/title-services/life-of-title-search",
        destination: "/learn/life-of-title-search",
        permanent: true,
      },
      {
        source: "/title-services/top-10-title-problems",
        destination: "/learn/top-10-title-problems",
        permanent: true,
      },
      {
        source: "/title-services/what-is-escrow",
        destination: "/learn/what-is-escrow",
        permanent: true,
      },
      {
        source: "/title-services/life-of-escrow",
        destination: "/learn/life-of-escrow",
        permanent: true,
      },
      {
        source: "/title-services/residential",
        destination: "/services/title",
        permanent: true,
      },
      {
        source: "/title-services/commercial",
        destination: "/services/commercial",
        permanent: true,
      },
      // Consolidate duplicate top-level routes
      {
        source: "/1031-exchange",
        destination: "/services/1031-exchange",
        permanent: true,
      },
      {
        source: "/credit-unions",
        destination: "/services/credit-unions",
        permanent: true,
      },
      {
        source: "/tsg-division",
        destination: "/services/tsg",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
