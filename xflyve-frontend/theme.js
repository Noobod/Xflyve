// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue, customize as you like
    },
    secondary: {
      main: "#dc004e", // Pink/red accent
    },
    background: {
      default: "#f4f6f8", // Light gray background
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
