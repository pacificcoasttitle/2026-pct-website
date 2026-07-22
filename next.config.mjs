/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Turbopack (Next.js 16 default bundler) alias for pdfjs-dist's optional
  // require('canvas') — we only use pdfjs in the browser so stub it out.
  turbopack: {
    resolveAlias: {
      canvas: './lib/canvas-stub.js',
    },
  },
  // Webpack fallback (used when --webpack flag or older Next.js)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }
    return config
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
      // Legacy PDF links — QR codes and old bookmarks point to pct.com/industry-documents/
      // but the files live on documents.pct.com
      {
        source: "/industry-documents/:path*",
        destination: "https://documents.pct.com/industry-documents/:path*",
        permanent: true,
      },
      // Bare /team (no slug) → /contact. Legacy /team/{slug} bookmarks and
      // QR codes heal onto the canonical rep page at /{slug}. The vCard
      // download at /api/team/{slug}/vcf is unaffected (/api/... does not
      // match this /team/:slug* source).
      {
        source: "/team",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/team/:slug*",
        destination: "/:slug*",
        permanent: true,
      },
      // Rep requested shorter public URL; keep old slug bookmarks/QR codes alive.
      {
        source: "/corey-velasquez",
        destination: "/corey",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
