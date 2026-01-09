/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        ellipsis: {
          '0%, 20%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        ellipsis: 'ellipsis 1.4s infinite',
        'ellipsis-delay-1': 'ellipsis 1.4s infinite 0.2s',
        'ellipsis-delay-2': 'ellipsis 1.4s infinite 0.4s',
      },
    },
  },
}
