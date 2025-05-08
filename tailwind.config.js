const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx,ejs}'],
  media: false,
  theme: {
    fontFamily: {
      sans: ['Sora', 'Open Sans', 'ui-sans-serif', 'system-ui'],
      serif: ['ui-serif', 'Georgia'],
      mono: ['ui-monospace', 'SFMono-Regular'],
      roboto: ['Roboto', 'ui-sans-serif', 'system-ui'],
    },
    extend: {
      height: {
        13: '3.25rem',
      },
      minHeight: {
        table: '6rem',
      },
      width: {
        5.5: '22px',
        22.5: '5.6rem',
        125: '31.25rem',
      },
      rotate: {
        135: '135deg',
      },
      animation: {
        'reverse-spin': 'reverse-spin 1s linear infinite',
        slideDownAndFade:
          'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'rotate-once': 'rotate360 1s ease',
        smoothShimmer: 'smoothShimmer 3s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gold-glimmer': 'gold-glimmer 3s ease-in-out infinite alternate',
        'white-glimmer': 'white-glimmer 5s ease-in-out infinite alternate',
        sparkle: 'sparkle 2s ease-in-out infinite',
        party: 'party 1.5s ease-in-out infinite',
      },
      keyframes: {
        rotate360: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'reverse-spin': {
          from: {
            transform: 'rotate(360deg)',
          },
        },
        slideDownAndFade: {
          from: { opacity: 0, transform: 'translateY(-2px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideUpAndFade: {
          from: { opacity: 0, transform: 'translateY(2px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { left: '-20%' },
          '100%': { left: '120%' },
        },
        smoothShimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        'gold-glimmer': {
          '0%': {
            backgroundImage:
              'linear-gradient(45deg, rgba(251, 191, 36, 0.05) 0%, rgba(251, 190, 36, 0.35) 50%, rgba(251, 191, 36, 0.05) 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 0%',
          },
          '100%': {
            backgroundImage:
              'linear-gradient(45deg, rgba(165, 219, 231, 0.05) 0%, rgba(251, 190, 36, 0.35) 50%, rgba(251, 191, 36, 0.05) 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: '100% 0%',
          },
        },
        'white-glimmer': {
          '0%': {
            backgroundImage:
              'linear-gradient(45deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.20) 50%, rgba(255, 255, 255, 0.01) 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 0%',
          },
          '100%': {
            backgroundImage:
              'linear-gradient(45deg, rgba(255, 255, 255, 0.01) 0%, rgba(255, 255, 255, 0.20) 50%, rgba(255, 255, 255, 0.01) 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: '100% 0%',
          },
        },
        sparkle: {
          '0%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '25%': { transform: 'scale(1.5) rotate(30deg)', opacity: '0.8' },
          '50%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '75%': { transform: 'scale(1.5) rotate(-30deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        party: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-6px) rotate(-20deg)' },
          '50%': { transform: 'translateY(0) rotate(0deg)' },
          '75%': { transform: 'translateY(-6px) rotate(20deg)' },
          '100%': { transform: 'translateY(0) rotate(0deg)' },
        },
      },
      colors: {
        theme: {
          shade: 'var(--color-depth-100)',
          primary: 'var(--color-base)',
          secondary: 'var(--color-depth-10)',
          text: {
            DEFAULT: 'var(--color-text)',
          },
          tag: 'var(--color-depth-100)',
        },
        shade: 'var(--color-depth-100)',
        'rewards-progress': {
          DEFAULT: 'var(--color-depth-70)',
        },
        finnieBlue: {
          dark: '#030332',
          'dark-secondary': '#090933',
          light: '#211C52',
          'light-secondary': 'var(--color-depth-70)',
          'light-tertiary': 'var(--color-depth-80)',
          'light-4': '#54547B',
          DEFAULT: 'var(--color-depth-100)',
          'light-transparent': 'rgba(137, 137, 199, 0.25)',
        },
        blue: {
          1: '#0E0E44',
          2: '#030332',
        },
        orange: {
          2: '#FFC78F',
        },
        finniePurple: {
          DEFAULT: 'var(--color-depth-30)',
        },
        finnieTeal: {
          100: 'var(--color-depth-10)',
          DEFAULT: 'var(--color-depth-20)',
          700: '#237B75',
        },
        finnieOrange: {
          DEFAULT: '#FFC78F',
        },
        finnieEmerald: {
          DEFAULT: 'var(--color-highlight)',
          light: 'var(--color-depth-20)',
        },
        gray: {
          primary: '#E8EAEA',
          light: '#E3E0EB',
          DEFAULT: '#D6D6D6',
        },
        green: {
          dark: '#087980',
          1: '#49CE8B',
          2: 'var(--color-depth-20)',
        },
        finnieGray: {
          DEFAULT: '#F2F2F2',
          light: '#F5F5F5',
          secondary: '#9B9BB2',
          tertiary: '#D6D6D6',
          100: '#D5D8DC',
        },
        neutral: { ...colors.neutral, 200: '#EAEAEA' },
        finnieRed: {
          DEFAULT: '#FFA6A6',
          500: '#FF4141',
        },
        purple: {
          ...colors.purple,
          1: '#8989C7',
          3: 'var(--color-depth-90)',
          4: 'var(--color-depth-40)',
          5: 'var(--color-depth-60)',
          6: '#8989C733',
          'light-transparent': 'rgba(137, 137, 199, 0.25)',
        },
      },
      backgroundImage: {
        'main-gradient': 'var(--gradient-main)',
      },
      blur: {
        4.5: '4.5px',
      },
      opacity: {
        90: '0.9',
      },
      fontSize: {
        '4xs': '7px',
        '2xs': '11px',
      },
      padding: { 0.75: '3px' },
      spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '48px',
        xxl: '62px',
        1.5: '0.375rem',
        2.5: '0.625rem',
        2.75: '0.6875rem',
        3.25: '0.8125rem',
        3.5: '0.875rem',
        3.75: '0.9375rem',
        4.375: '1.09375rem',
        5.25: '1.3125rem',
        5.5: '1.375rem',
        6.25: '1.5625rem',
        6.5: '1.625rem',
        9.5: '2.375rem',
        9.75: '2.4375rem',
        13: '3.25rem',
        27.5: '6.875rem',
        30.5: '7.625rem',
        34.5: '8.625rem',
        41.25: '10.3125rem',
        44.75: '11.1875rem',
        59.25: '14.8125rem',
        71: '17.75rem',
        79.5: '19.875rem',
        98.5: '24.625rem',
        102.75: '25.6875rem',
        108.25: '27.0625rem',
        116: '29rem',
        128: '32rem',
        144.75: '35.9375rem',
        151.25: '37.8125rem',
        156: '39rem',
        249.75: '62.4375rem',
      },
      letterSpacing: {
        'finnieSpacing-tighter': '-0.02em',
        'finnieSpacing-tight': '-0.01em',
        'finnieSpacing-wide': '0.015em',
        'finnieSpacing-wider': '0.03em',
      },
      borderRadius: {
        'finnie-small': '3px',
        finnie: '4px',
      },
      gridTemplateColumns: {
        'first-task': '3.4rem repeat(16, minmax(0, 1fr)) 3rem',
        'my-node':
          'minmax(180px, 0.9fr) minmax(120px, 1.7fr) minmax(150px, 3fr) minmax(270px, 1.5fr) minmax(80px, 0.55fr) minmax(68px, 0.72fr) 80px',
        'available-tasks':
          'minmax(180px, 1fr) minmax(178px, 1.3fr) minmax(230px, 1.3fr) minmax(80px, 0.55fr) minmax(160px, 1.3fr) minmax(80px, 0.82fr) 80px',
        'add-private-task': '14fr 3fr 2fr 2fr',
        'accounts-headers': '1fr 4fr 7fr 6fr',
        accounts: '1fr 1fr 3fr 5fr 2fr 3fr 1fr 1fr',
      },
      gridColumnStart: {
        2: '2',
        13: '13',
        15: '15',
      },
      screens: {
        md2: '1740px',
        md2h: { raw: '(min-height: 900px)' },
        xl1: '1900px',
        xl2: '2150px',
        lgh: { raw: '(min-height: 1000px)' },
        lgh2: { raw: '(min-height: 1100px)' },
      },
    },
  },

  variants: {
    extend: {},
  },
  plugins: [],
};
