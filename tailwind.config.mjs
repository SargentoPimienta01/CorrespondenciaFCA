/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
		colors: {
			transparent: 'transparent',
      		current: 'currentColor',
			'azul': '#1F284C',
			'amarillo': '#F9B818',
			'white': '#fbfbfb',
			'gray': {
				100: '#f3f4f6',
        		200: '#e5e7eb',
        		300: '#d1d5db',
        		400: '#9ca3af',
        		500: '#6b7280',
        		600: '#4b5563',
        		700: '#374151',
        		800: '#1f2937',
        		900: '#111827',
			}, 
			'black': '#000',
		},
	},
	plugins: [],
}
