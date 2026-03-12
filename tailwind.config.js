/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'mirror-blue': '#7ab0e8',
        'mirror-red':  '#e87a7a',
        'mirror-warm': '#f0c878',
        'room-wall':   '#c8aa82',
      },
      keyframes: {
        fadeUp:   { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        bob:      { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-5px)' } },
        pulseSoft:{ '0%,100%': { opacity: '1' }, '50%': { opacity: '0.65' } },
        shake:    { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-3px)' }, '75%': { transform: 'translateX(3px)' } },
        floatUp:  { '0%,100%': { transform: 'translateY(0) rotate(-0.5deg)' }, '50%': { transform: 'translateY(-6px) rotate(0.5deg)' } },
        warmGlow: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.85', transform: 'scale(1.015)' } },
        subtitleIn:{ from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        blink:    { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        charAppear:{ from: { opacity: '0', transform: 'scale(0.9)' }, to: { opacity: '1', transform: 'scale(1)' } },
        branchReveal: { from: { opacity: '0', filter: 'blur(6px)' }, to: { opacity: '1', filter: 'blur(0px)' } },
      },
      animation: {
        fadeUp:      'fadeUp 0.45s ease forwards',
        fadeIn:      'fadeIn 0.35s ease forwards',
        bob:         'bob 2s ease-in-out infinite',
        pulseSoft:   'pulseSoft 2.5s ease-in-out infinite',
        shake:       'shake 0.4s ease-in-out infinite',
        floatUp:     'floatUp 3s ease-in-out infinite',
        warmGlow:    'warmGlow 2s ease-in-out infinite',
        subtitleIn:  'subtitleIn 0.3s ease forwards',
        blink:       'blink 1s step-end infinite',
        charAppear:  'charAppear 0.5s ease forwards',
        branchReveal:'branchReveal 0.8s ease forwards',
      },
    },
  },
  plugins: [],
}
