/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Amazon Ember", "Arial", "sans-serif"],
        ember: ["Amazon Ember", "Arial", "sans-serif"],
      },
      colors: {
        // Organizational 2-Color Palette: Deep Slate Navy (Primary) + Emerald Green (Accent)
        brand: {
          primary: '#0f172a',   // Deep Corporate Slate Navy
          secondary: '#1e293b', // Slate Navy Surface
          accent: '#059669',    // Enterprise Emerald Green
          accentHover: '#047857',
          light: '#ecfdf5',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.03)',
      },
    },
  },
  plugins: [],
};
