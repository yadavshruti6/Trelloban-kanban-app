import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        panelAlt: 'rgb(var(--color-panel-alt) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        accentSoft: 'rgb(var(--color-accent-soft) / <alpha-value>)'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.12)',
        panel: '0 12px 34px rgba(15, 23, 42, 0.10)'
      },
      backgroundImage: {
        'trelloban-radial': 'radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 34%), radial-gradient(circle at top right, rgba(255, 183, 77, 0.16), transparent 28%), linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 1))'
      }
    }
  },
  plugins: []
};

export default config;
