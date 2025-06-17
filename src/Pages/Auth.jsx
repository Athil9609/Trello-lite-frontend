import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Box,
  InputAdornment,
  IconButton,
  Fade,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { userLog, userReg } from "../services/allApis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const nav = useNavigate();
  const [tab, setTab] = useState(0); // 0: Login, 1: Signup
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tab === 0) {
      // Login
      const res = await userLog({
        email: formData.email,
        password: formData.password,
      });
      console.log(res);
      if (res.status === 200) {
        toast.success("Login Successful!");
        sessionStorage.setItem("token", res.data.token);
        nav("/");
      } else {
        toast.error("Login Failed!");
      }
    } else {
      // Signup
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters!");
        return;
      }

      const res = await userReg(formData);
      console.log(res);
      if (res.status === 200) {
        toast.success("Registration Successful!");
        setFormData({
          name: "",
          email: formData.email,
          password: "",
        });
        setTab(0); // Go to Login tab
      } else {
        toast.error("Registration Failed!");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={6} sx={{ mt: 12, px: 4, py: 5, borderRadius: 3 }}>
        <Typography variant="h5" align="center" sx={{ mt: 1, fontWeight: 600 }}>
          {tab === 0 ? "Login" : "Create Your Account"}
        </Typography>

        <Fade in>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {tab === 1 && (
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            )}

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{
                        '&:focus': {
                          outline: 'none',
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 3,
                py: 1.5,
                textTransform: "none",
                '&:focus': {
                  outline: 'none',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)',
                },
              }}
            >
              {tab === 0 ? "Login" : "Sign Up"}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              {tab === 0 ? (
                <>
                  Don’t have an account?{" "}
                  <Link
                    component="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTab(1);
                    }}
                    underline="hover"
                    sx={{
                      fontWeight: 500,
                      '&:focus': {
                        outline: 'none',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)',
                      },
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    component="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setTab(0);
                    }}
                    underline="hover"
                    sx={{
                      fontWeight: 500,
                      '&:focus': {
                        outline: 'none',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)',
                      },
                    }}
                  >
                    Login
                  </Link>
                </>
              )}
            </Typography>
          </Box>
        </Fade>
      </Paper>
    </Container>
  );
};

export default AuthPage;
