import Nav from './components/Nav'
import { Box } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './styles/createTheme.js'

const App = () => {

  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        <Box sx={{ width: '100%'}}>
          <Nav/>
        </Box>
      </>
      
    </ThemeProvider>
    
      
  )
}

export default App
