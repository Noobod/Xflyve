import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";

const palette = {
  ink: "#0b1220",
  muted: "#697586",
  line: "rgba(15, 23, 42, 0.075)",
  panel: "rgba(255, 255, 255, 0.88)",
  teal: "#0e7c76",
  blue: "#2563eb",
};

const AuthLoadingState = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      px: 2,
      background: `radial-gradient(circle at 0% 0%, ${alpha(
        palette.teal,
        0.13
      )}, transparent 32%), radial-gradient(circle at 100% 8%, ${alpha(
        palette.blue,
        0.1
      )}, transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)`,
    }}
  >
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 360,
        p: 4,
        borderRadius: 5,
        textAlign: "center",
        border: "1px solid",
        borderColor: palette.line,
        bgcolor: palette.panel,
        boxShadow: "0 24px 70px rgba(15, 23, 42, 0.08)",
      }}
    >
      <CircularProgress size={34} sx={{ color: palette.teal }} />
      <Typography
        variant="h6"
        fontWeight={900}
        sx={{ mt: 2, color: palette.ink, letterSpacing: "-0.035em" }}
      >
        Loading workspace
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.75, color: palette.muted }}>
        Checking your secure session...
      </Typography>
    </Paper>
  </Box>
);

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingState />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // or an Unauthorized page
  }

  return <Outlet />;
};

export default PrivateRoute;
