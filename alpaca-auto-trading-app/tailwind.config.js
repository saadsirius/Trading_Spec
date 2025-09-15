/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6E56CF",
        secondary: "#22D3EE",
        accent: "#F472B6",
        support: "#10B981",
        ink: "#0B1020",
        // Legacy colors for backward compatibility
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shift: { '0%': { transform: 'translateX(0)' }, '50%': { transform: 'translateX(-20px)' }, '100%': { transform: 'translateX(0)' } },
        wave: { 
          '0%': { d: 'path("M0,64L80,80C160,96,320,128,480,138.7C640,149,800,139,960,117.3C1120,96,1280,64,1360,48L1440,32V160H0Z")' },
          '50%': { d: 'path("M0,80L80,74.7C160,69,320,58,480,74.7C640,91,800,133,960,149.3C1120,165,1280,155,1360,149.3L1440,144V160H0Z")' },
          '100%': { d: 'path("M0,64L80,80C160,96,320,128,480,138.7C640,149,800,139,960,117.3C1120,96,1280,64,1360,48L1440,32V160H0Z")' } 
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        shift: "shift 12s ease-in-out infinite",
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      boxShadow: {
        glass: "inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 30px rgba(0,0,0,0.15)",
      },
      backdropBlur: { 
        xl: "20px",
        '2xl': "40px"
      },
      borderRadius: { 
        '2xl': "1.25rem",
      },
    },
  },
  plugins: [],
};
