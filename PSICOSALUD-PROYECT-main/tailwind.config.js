/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        'primary-container': 'var(--primary-container)',
        'primary-fixed': 'var(--primary-fixed)',
        'primary-fixed-dim': 'var(--primary-fixed-dim)',
        'on-primary-fixed': 'var(--on-primary-fixed)',
        'on-primary-fixed-variant': 'var(--on-primary-fixed-variant)',
        'inverse-primary': 'var(--inverse-primary)',
        
        secondary: 'var(--secondary)',
        'on-secondary': 'var(--on-secondary)',
        'secondary-container': 'var(--secondary-container)',
        'secondary-fixed': 'var(--secondary-fixed)',
        'secondary-fixed-dim': 'var(--secondary-fixed-dim)',
        'on-secondary-container': 'var(--on-secondary-container)',
        'on-secondary-fixed': 'var(--on-secondary-fixed)',
        'on-secondary-fixed-variant': 'var(--on-secondary-fixed-variant)',
        
        tertiary: 'var(--tertiary)',
        'tertiary-container': 'var(--tertiary-container)',
        'tertiary-fixed': 'var(--tertiary-fixed)',
        'tertiary-fixed-dim': 'var(--tertiary-fixed-dim)',
        'on-tertiary': 'var(--on-tertiary)',
        'on-tertiary-container': 'var(--on-tertiary-container)',
        'on-tertiary-fixed': 'var(--on-tertiary-fixed)',
        'on-tertiary-fixed-variant': 'var(--on-tertiary-fixed-variant)',
        
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-dim': 'var(--surface-dim)',
        'surface-bright': 'var(--surface-bright)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'surface-variant': 'var(--surface-variant)',
        'surface-tint': 'var(--surface-tint)',
        'inverse-surface': 'var(--inverse-surface)',
        'inverse-on-surface': 'var(--inverse-on-surface)',
        
        'on-surface': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'on-background': 'var(--on-background)',
        
        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        
        error: 'var(--error)',
        'error-container': 'var(--error-container)',
        'on-error': 'var(--on-error)',
        'on-error-container': 'var(--on-error-container)',
        
        'accent-green': 'var(--accent-green)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
