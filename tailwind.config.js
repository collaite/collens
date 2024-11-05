
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,md}'],
	theme: {
		extend: {
			dropShadow: {
        'custom': '5px 5px 5px rgba(0, 0, 0, 0.1)',
      },
			typography: {
        DEFAULT: {
					css: {
						table: {
							width: '100%',
							overflowX: 'auto',
						},

            a: {
							textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
            	  },
          	  },
        		},
      		},
      	},
		}
	},
	plugins: [
		require('daisyui'),
		require('@tailwindcss/typography'),
		require('@tailwindcss/forms'),
		require('@tailwindcss/container-queries')
	],
	daisyui: {
		themes: [
			{
				collaite: {
					primary: '#0D151E',
					'primary-focus': '#182738',
					'primary-content': '#D8D2C6',
					secondary: '#ffb83d',
					'secondary-focus': '#db8b00',
					'secondary-content': 'black',
					accent: '#37cdbe',
					'accent-focus': '#2aa79b',
					'accent-content': '#FFFFFF',
					neutral: '#3d4451',
					'neutral-focus': '#2a2e37',
					'neutral-content': '#ffffff',
					'base-100': '#D8D2C6',
					'base-200': '#D8D2C6',
					'base-250': '#212121',
					'base-300': '#D8D2C6',
					'base-350': '#2e2e2e',
					'base-content': '#0D151E',
					info: '#2094f3',
					success: '#009485',
					warning: '#FF9900',
					error: '#ff5724',
				}
			}
		]
	}
};
