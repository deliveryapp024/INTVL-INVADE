/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			display: ['Rajdhani', 'sans-serif'],
  			body: ['Inter', 'sans-serif'],
  		},
  		colors: {
  			primary: {
  				DEFAULT: '#00D1FF',
  				dark: '#00A8CC',
  				light: '#4DE1FF',
  				50: '#E6F9FF',
  				100: '#B3F0FF',
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: '#FF9500',
  				dark: '#E68600',
  				light: '#FFB84D',
  				foreground: '#FFFFFF'
  			},
  			cyber: {
  				navy: '#1A1A2E',
  				dark: '#0A0A0F',
  				surface: '#252542',
  			},
  			success: '#00C853',
  			warning: '#FFAB00',
  			error: '#FF3B30',
  			territory: {
  				mine: '#00D1FF',
  				opponent: '#FF3B30',
  				neutral: '#8E8E93',
  				contested: '#FF9500',
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
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
