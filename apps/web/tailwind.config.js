/** @type {import('tailwindcss').Config} */
module.exports = {    darkMode: ["class"],
    content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
 fontFamily: {
        'inter': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'poppins': ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
	   keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
		 carousel: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.333%)" },
        },
      },
      animation: {
        marquee: "marquee 25s linear infinite",
		carousel: "carousel 35s linear infinite",
      },

  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			// AB Creation brand palette — Figma design tokens + official brand
  			// guide ("colour pallet.png" at repo root: 70% cream / 20% black /
  			// 10% gold usage ratio).
  			brand: {
  				ink: '#1a1c1c',      // logo wordmark / darkest text
  				black: '#171717',    // Rich Black — logo, typography, strong elements
  				text: '#374151',     // nav + body text
  				muted: '#6b7280',    // secondary/placeholder text
  				// primary CTA — runtime-themable via Settings → Branding
  				// (layout injects --brand-orange-rgb when a custom colour is set)
  				orange: 'rgb(var(--brand-orange-rgb, 255 92 0) / <alpha-value>)',
  				rust: '#a04100',     // secondary button (footer Join)
  				footer: '#30302f',   // footer background
  				cream: '#F5F1EA',    // Luxury Cream — primary background
  				gold: '#CBAA75',     // Signature Gold — main accent
  				copper: '#B87D4C',   // Copper Gold — secondary accent (logo color)
  				rose: '#C79280',     // Rose Gold — soft accent
  				stone: '#E8E6E3'     // Soft Stone — neutral backgrounds
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
