/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'agent-active': '#10b981',
        'agent-waiting': '#f59e0b',
        'agent-blocked': '#ef4444',
        'agent-completed': '#6b7280',
        'agent-idle': '#9ca3af',
      }
    },
  },
  plugins: [],
}

