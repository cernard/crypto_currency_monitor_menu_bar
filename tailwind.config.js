module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      grayscale: {
        50: '50%',
        80: '80%',
      },
    },
  },
  variants: {
    extend: {
      dropShadow: ['hover', 'focus'],
      margin: ['first', 'last'],
      boxShadow: ['active'],
      backgroundImage: ['active'],
      gradientColorStops: ['active'],
    },
  },
  plugins: [],
};
