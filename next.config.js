/** @type {import('next').NextConfig} */

// Security headers applied to every response (defense-in-depth).
const securityHeaders = [
  // Force HTTPS for 2 years (Vercel serves HTTPS; this prevents downgrade).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Anti-clickjacking: the app must never be framed by another site.
  { key: "X-Frame-Options", value: "DENY" },
  // Block MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (which may carry context) to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful browser features the app doesn't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Modern clickjacking + injection hardening. Kept minimal so inline
  // styles (Tailwind) and the theme-init script keep working.
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework version to attackers.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
