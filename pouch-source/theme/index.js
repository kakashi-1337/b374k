// Mantine theme

export default {
  fontFamily: 'Poppins, IBM Plex Sans, sans-serif',
  fontSizes: {
    xl: 20,
    lg: 16,
    md: 14, // default font size
    sm: 12,
    xs: 10
  },
  headings: {
    fontFamily: 'Poppins, IBM Plex Sans, sans-serif',
    sizes: {
      h1: { fontSize: 40 },
      h2: { fontSize: 35 },
      h3: { fontSize: 30 },
      h4: { fontSize: 28 },
      h5: { fontSize: 25 },
      h6: { fontSize: 20 }
    }
  },
  white: '#F9F9F9',
  black: '#637381',
  primaryColor: 'brand',
  colors: {
    brand: ['#F0E9FF', '#E1D3FF', '#D2BDFF', '#B491FF', '#A57AFF', '#9664FF', '#6922FF', '#5F1FE6', '#4A18B3', '#3F1499'],
    brandLight: ['#F9F6FF', '#F4EDFF', '#E9DCFF', '#E3D3FF', '#D8C1FF', '#D2B9FF', '#C7A7FF', '#B396E6', '#9f86CC', '#8B75B3'],
    transparent: [], // no color shown
    gray: ['#F8F9FA', '#F1F3F5', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#637381', '#495057', '#343A40', '#212529'],
    error: ['#FFE3E3', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B']
  },
  spacing: {
    xl: 30,
    lg: 20,
    md: 15,
    sm: 10,
    xs: 5
  },
  radius: {
    max: 999,
    xl: 30,
    lg: 20,
    md: 15,
    sm: 10,
    xs: 5
  },
  other: {
    light: {
      primary: '#6922FF',
      text: '#171717',
      secondary: '#777777',
      backgroundColor: '#F8F8F8',
      cardBgColor: '#FFFFFF',
      lightBgColor: '#FAF8FF',
      borderColor: '#E9E9E9',
      tableHeaderColor: '#9E9DA0',
      outline: '#E9ECEF',
      success: '#1CD787',
      error: '#FF3535',
    },
    dark: {
      primary: '#8C52FF',
      text: '#F8F8F8',
      secondary: '#777777',
      backgroundColor: '#27242D',
      cardBgColor: '#232028',
      lightBgColor: '#302D38',
      borderColor: '#544E64',
      tableHeaderColor: '#847F8C',
      outline: '#2C2E33',
      success: '#1CD787',
      error: '#FF6666',
    },
    success: '#1CD787',
    error: '#FF6B6B',
    warning: '#FFC46B',
    gradient: 'linear-gradient(145deg, #C7A7FF 0%, #6922FF 100%)'
  }
}
