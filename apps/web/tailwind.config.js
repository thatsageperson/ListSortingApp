module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				teal: {
					50: '#F0FDFA',
					100: '#CCFBF1',
					200: '#99F6E4',
					300: '#5EEAD4',
					400: '#2DD4BF',
					500: '#14B8A6',
					600: '#0D9488',
					700: '#0F766E',
					800: '#115E59',
					900: '#134E4A',
				},
				orange: {
					sunset: '#FB923C',
				},
				amber: {
					DEFAULT: '#FBBF24',
				},
				cream: '#FFFBEB',
				charcoal: '#1F2937',
				'slate-surface': '#1E293B',
				'slate-bg': '#0F172A',
			},
			fontFamily: {
				logo: ['Lora', 'serif'],
				sans: ['Plus Jakarta Sans', 'sans-serif'],
			},
		},
	},
};
