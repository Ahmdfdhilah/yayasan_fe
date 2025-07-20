import type { Config } from "tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "src/app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "../../packages/ui/src/components/**/*.{ts,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Proxima Soft", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
        satoshi: ["Satoshi", "sans-serif"],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        'accordion-up': {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Primary colors using CSS variables with computed intensities
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "color-mix(in srgb, hsl(var(--primary)) 5%, white)",
          100: "color-mix(in srgb, hsl(var(--primary)) 10%, white)",
          200: "color-mix(in srgb, hsl(var(--primary)) 30%, white)",
          300: "color-mix(in srgb, hsl(var(--primary)) 50%, white)",
          400: "color-mix(in srgb, hsl(var(--primary)) 70%, white)",
          500: "hsl(var(--primary))",
          600: "color-mix(in srgb, hsl(var(--primary)) 80%, black)",
          700: "color-mix(in srgb, hsl(var(--primary)) 60%, black)",
          800: "color-mix(in srgb, hsl(var(--primary)) 40%, black)",
          900: "color-mix(in srgb, hsl(var(--primary)) 20%, black)",
        },
        
        // Secondary colors using CSS variables with computed intensities
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "color-mix(in srgb, hsl(var(--secondary)) 5%, white)",
          100: "color-mix(in srgb, hsl(var(--secondary)) 10%, white)",
          200: "color-mix(in srgb, hsl(var(--secondary)) 30%, white)",
          300: "color-mix(in srgb, hsl(var(--secondary)) 50%, white)",
          400: "color-mix(in srgb, hsl(var(--secondary)) 70%, white)",
          500: "hsl(var(--secondary))",
          600: "color-mix(in srgb, hsl(var(--secondary)) 80%, black)",
          700: "color-mix(in srgb, hsl(var(--secondary)) 60%, black)",
          800: "color-mix(in srgb, hsl(var(--secondary)) 40%, black)",
          900: "color-mix(in srgb, hsl(var(--secondary)) 20%, black)",
        },
        
        // Accent using CSS variables
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          light: "hsl(var(--accent-light))",
          dark: "hsl(var(--accent-dark))",
        },
        
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
    },
  },
  plugins: [],
} satisfies Config;