import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Alert } from "@mui/material";
import { login } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect logged-in users away from login page
  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/home");
      } else if (user.role === "driver") {
        navigate("/driver-home");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      const { token, data } = res.data;

      loginUser(data, token); // Save user + token in context + localStorage

      // Redirect based on role after login
      if (data.role === "admin") {
        navigate("/home");
      } else if (data.role === "driver") {
        navigate("/driver-home");
      } else {
        navigate("/"); // fallback route
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Xflyve Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;
