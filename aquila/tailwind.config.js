/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        headings: ['Poppins', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E3A5F', // Midnight Blue
          dark: '#16243B', // Darker Midnight Blue
          light: '#274D73', // Lighter Midnight Blue
        },
        accent: {
          DEFAULT: '#D4AF37', // Soft Gold
          light: '#E5C16D', // Lighter Gold for hover
        },
        text: {
          primary: '#FFF', // White text
          secondary: '#D4AF37', // Soft Gold text
        },
        background: {
          default: '#1E3A5F', // Midnight Blue background
          card: '#2A4466', // Slightly lighter blue for cards
        },
      },
    },
  },
  plugins: [],
};
