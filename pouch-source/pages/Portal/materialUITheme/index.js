import { createTheme } from '@mui/material/styles';

export default createTheme({
  palette: {
    background: {
      default: '#FFF'
    },
    primary: {
      main: '#6922FF',
      light: '#F9F5FF',
      dark: '#5315D7'
    }
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
        borderRadius: '6px',
        '&.MuiButton-containedPrimary': {
          boxShadow: '0px 3px 20px rgba(105, 34, 255, 0.25)',
          '&:hover': {
            boxShadow: '0px 3px 20px rgba(105, 34, 255, 0.25)'
          }
        },
        '&:disabled': {
          boxShadow: 'none'
        }
      }
    },
    MuiPaper: {
      root: {
        '&.MuiPaper-outlined': {
          boxShadow: '0px 12px 26px 12px rgba(237, 240, 242, 0.5)',
          border: '1px solid #EDF0F2'
        }
      }
    },
    MuiAlert: {
      root: {
        '&.MuiAlert-outlinedError': {
          background: '#FDEDED'
        }
      }
    },
    MuiAccordionSummary: {
      root: {
        minHeight: 48,
        '&$expanded': {
          minHeight: 48
        }
      },
      content: {
        '&$expanded': {
          margin: '10px 0'
        }
      },
      expanded: {}
    }
  }
})
