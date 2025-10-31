import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Trading-specific colors
        profit: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          glow: '#10b98140',
        },
        loss: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
          glow: '#ef444440',
        },
        neutral: {
          DEFAULT: '#6b7280',
          light: '#9ca3af',
          dark: '#4b5563',
        },
        // Rank/Tier Colors
        rank: {
          bronze: {
            DEFAULT: '#CD7F32',
            light: '#E39253',
            dark: '#8B5A2B',
          },
          silver: {
            DEFAULT: '#C0C0C0',
            light: '#E0E0E0',
            dark: '#999999',
          },
          gold: {
            DEFAULT: '#FFD700',
            light: '#FFE55C',
            dark: '#CCAC00',
          },
          platinum: {
            DEFAULT: '#E5E4E2',
            light: '#F5F5F5',
            dark: '#B0AEAA',
          },
          diamond: {
            DEFAULT: '#B9F2FF',
            light: '#E0F9FF',
            dark: '#8AC7D9',
          },
          master: {
            DEFAULT: '#9B59B6',
            light: '#BB76D6',
            dark: '#7B3F96',
          },
          grandmaster: {
            DEFAULT: '#E74C3C',
            light: '#F27666',
            dark: '#C13C2E',
          },
          champion: {
            DEFAULT: '#F39C12',
            light: '#F5B041',
            dark: '#D68910',
          },
        },
        // Subscription Tiers
        tier: {
          free: {
            DEFAULT: '#6B7280',
            glow: '#6B728040',
          },
          grow: {
            DEFAULT: '#3B82F6',
            glow: '#3B82F640',
          },
          elite: {
            DEFAULT: '#8B5CF6',
            glow: '#8B5CF640',
          },
          gladiator: {
            DEFAULT: '#EAB308',
            glow: '#EAB30840',
          },
        },
        // Feature-specific gradients
        signal: {
          start: '#3B82F6',
          end: '#8B5CF6',
        },
        competition: {
          start: '#EC4899',
          end: '#F59E0B',
        },
        streaming: {
          start: '#8B5CF6',
          end: '#EC4899',
        },
        mentor: {
          start: '#10B981',
          end: '#3B82F6',
        },
      },
      backgroundImage: {
        // Premium Gradients
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-profit': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-loss': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
        'gradient-signal': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        'gradient-competition': 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
        'gradient-streaming': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'gradient-mentor': 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
        'gradient-champion': 'linear-gradient(135deg, #F39C12 0%, #FFD700 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'gradient-dark-glass': 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(59, 130, 246, 0.5)',
        'glow-md': '0 0 16px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 24px rgba(59, 130, 246, 0.5)',
        'glow-profit': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-loss': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-champion': '0 0 30px rgba(243, 156, 18, 0.6)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.7)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
      keyframes: {
        // Accordion
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Fade
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        // Slide
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        // Scale
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          from: { transform: 'scale(1)', opacity: '1' },
          to: { transform: 'scale(0.95)', opacity: '0' },
        },
        // Pulse & Glow
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' },
        },
        // Shimmer
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Float
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // Spin variations
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        // Bounce variations
        'bounce-horizontal': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
        },
        // Progress
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // Wiggle
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        // Accordion
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // Fade
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        // Slide
        'slide-in-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-right': 'slide-in-from-right 0.3s ease-out',
        // Scale
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',
        // Pulse & Glow
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        // Shimmer
        shimmer: 'shimmer 2s linear infinite',
        // Float
        float: 'float 3s ease-in-out infinite',
        // Spin
        'spin-slow': 'spin-slow 3s linear infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
        // Bounce
        'bounce-horizontal': 'bounce-horizontal 1s ease-in-out infinite',
        // Progress
        'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
        // Wiggle
        wiggle: 'wiggle 0.5s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
