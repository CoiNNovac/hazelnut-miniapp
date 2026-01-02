/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F47621',
        dark: '#1A1D3D',
        'dark-card': '#252842',
        'text-muted': '#8E92BC',
        success: '#4ADE80',
        error: '#EF4444',
        'blue-accent': '#3B82F6',
      },
    },
  },
  plugins: [],
};
