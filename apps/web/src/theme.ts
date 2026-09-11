import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#d28cff" },
    secondary: { main: "#16a085" },
    background: { default: "#121212", paper: "#1c1c1c" },
    error: { main: "#e07a6e" },
    success: { main: "#1abc9c" },
    text: { primary: "#f0f0f5", secondary: "#9aa3b8" },
    divider: "rgba(240,240,245,0.08)",
  },
  typography: {
    fontFamily: '"Instrument Sans", sans-serif',
    h3: { fontFamily: '"Instrument Serif", serif', fontWeight: 400 },
    h4: { fontFamily: '"Instrument Serif", serif', fontWeight: 400 },
    h5: { fontFamily: '"Instrument Serif", serif', fontWeight: 400 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButton: {
      styleOverrides: {
        containedPrimary: { color: "#121212" },
      },
    },
  },
});
