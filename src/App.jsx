import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import AuthPage from './Pages/Auth';
import DashboardPage from './Pages/Dashboard';
import BoardPage from './Pages/Board';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#121212',
            paper: '#1e1e2d',
        },
        primary: {
            main: '#4f46e5',
        },
        secondary: {
            main: '#22c55e',
        },
    },
    typography: {
        fontFamily: 'Inter, Roboto, sans-serif',
    },
});

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) navigate("/auth");
    else navigate("/");
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route path="/board/:_id" element={<BoardPage />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </ThemeProvider>
  );
}

export default App;
