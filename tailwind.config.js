/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                'accent-red': '#d93427',
                'accent-orange': '#f6894f',
                'accent-orange-bg': '#ffead3',
                'accent-orange-text': '#865a19',
                'accent-yellow-bg': '#fff6ec',
                'accent-latte': '#fff3e5',
                'accent-brown': '#401f10'
            },
            fontFamily: {
                display: [ 'Lora', 'Noto Sans CJK SC', 'system-ui', 'serif' ],
                body: ['Noto Sans CJK SC', 'system-ui', 'sans-serif']
            }
        },
    },
    plugins: [],
}

