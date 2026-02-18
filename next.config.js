/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  env: {
    WORKSPACE_PATH: process.env.WORKSPACE_PATH || '/Users/sam/.openclaw/workspace',
  },
}

module.exports = nextConfig