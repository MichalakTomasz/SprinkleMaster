import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    background: {
      default: '#f1f8e9 ', // jasny zielony kolor
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#e8f5e9    ',
          minHeight: '100vh',
        },
      },
    },
  },
});