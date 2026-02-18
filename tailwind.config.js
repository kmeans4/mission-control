/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'agent-sam': '#3b82f6',
        'agent-quinn': '#8b5cf6',
        'agent-dex': '#22c55e',
        'agent-mantis': '#f59e0b',
        'agent-echo': '#06b6d4',
        'agent-hawthorne': '#6b7280',
        'status-active': '#22c55e',
        'status-busy': '#f59e0b',
        'status-idle': '#6b7280',
      },
    },
  },
  plugins: [],
}
