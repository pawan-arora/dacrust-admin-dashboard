import SalesDashboard from './pages/SalesDashboard';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kicks in the theme's background color and resets default browser margins */}
      <CssBaseline /> 
      <SalesDashboard />
    </ThemeProvider>
  );
}

export default App;