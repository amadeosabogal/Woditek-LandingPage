/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Superficies oscuras de la landing */
        ink: {
          950: '#050a14',
          900: '#0a1222',
          800: '#101a2f',
          700: '#18233d',
        },
        woditek: {
          electric: '#0047FF',
          dark: '#020617',
          medium: '#0c1a40',
          blueBrilliant: '#00D1FF',
          ice: '#F0F4FF',
        },
        /* Mapped CRM tokens to AdminLayout theme */
        "background": "#f8f9fa", /* slate-50 equivalent from AdminLayout */
        "surface": "#ffffff", /* white panels */
        "surface-muted": "#f1f5f9", /* slate-100 hover backgrounds */
        "surface-variant": "#f1f5f9",
        "on-background": "#0f172a", /* slate-900 text */
        "on-surface": "#0f172a", /* slate-900 text */
        "on-surface-variant": "#64748b", /* slate-500 text */
        "border-subtle": "#cbd5e1", /* slate-300 borders */
        "outline": "#94a3b8", /* slate-400 */
        "outline-variant": "#e2e8f0", /* slate-200 */
        
        "primary": "#3162fa", /* Woditek Blue */
        "on-primary": "#ffffff",
        "primary-container": "#eff6ff", /* blue-50 */
        "on-primary-container": "#1e3a8a", /* blue-900 */
        
        "secondary": "#334155", /* slate-700 */
        "on-secondary": "#ffffff",
        "secondary-container": "#f1f5f9",
        "on-secondary-container": "#0f172a",
        
        "status-qp": "#F59E0B",
        "status-pp": "#10B981",
        "status-na": "#94a3b8",
        "status-ip": "#3B82F6",
        "status-hp": "#EF4444",
        "error": "#ef4444",
        "on-error": "#ffffff",
        "error-container": "#fee2e2",
        
        /* Fallbacks */
        "inverse-primary": "#b6c4ff",
        "surface-tint": "#3162fa",
        "inverse-on-surface": "#f8f9fa",
        "surface-dim": "#e2e8f0",
        "surface-bright": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container": "#f8f9fa",
        "surface-container-high": "#f1f5f9"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
        /* Círculo/píldora real para la landing (rounded-full queda en 0.75rem por el panel admin) */
        "pill": "9999px"
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'grow-y': {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' }
        },
        'grow-x': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' }
        },
        blob: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(40px, -30px, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-30px, 30px, 0) scale(0.95)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.9)', opacity: '0' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        draw: {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        'grow-y': 'grow-y 1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'grow-x': 'grow-x 1.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        blob: 'blob 18s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        draw: 'draw 1.6s ease-out both'
      },
      spacing: {
        "density-compact": "8px",
        "unit": "4px",
        "density-comfortable": "16px",
        "gutter": "16px",
        "container-margin": "24px"
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        heading: ['Archivo', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        "body-sm": ["Inter", "sans-serif"],
        "display-lg": ["Hanken Grotesk", "sans-serif"],
        "data-mono": ["JetBrains Mono", "monospace"],
        "headline-md": ["Hanken Grotesk", "sans-serif"],
        "headline-sm": ["Hanken Grotesk", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "body-sm": ["13px", { "lineHeight": "18px", "fontWeight": "400" }],
        "display-lg": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "data-mono": ["13px", { "lineHeight": "16px", "fontWeight": "400" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-sm": ["18px", { "lineHeight": "24px", "fontWeight": "600" }],
        "label-caps": ["11px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
