/** @type {import('next').NextConfig} */
const config = {
  images: { unoptimized: true },
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,
  poweredByHeader: false,
};
export default config;
