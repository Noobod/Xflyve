import React, { useState } from "react";
import { Container, Typography, Grid, Paper, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleIcon from "@mui/icons-material/People";
import EventNoteIcon from "@mui/icons-material/EventNote";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ListAltIcon from "@mui/icons-material/ListAlt";

const iconMap = {
  Dashboard: <DashboardIcon fontSize="large" color="primary" />,
  "Manage Jobs": <WorkIcon fontSize="large" color="primary" />,
  "Manage Trucks": <LocalShippingIcon fontSize="large" color="primary" />,
  "Manage Drivers": <PeopleIcon fontSize="large" color="primary" />,
  "Assign Trucks": <LocalShippingIcon fontSize="large" color="primary" />,
  "Work Diary": <EventNoteIcon fontSize="large" color="primary" />,
  "Work Logs": <ListAltIcon fontSize="large" color="primary" />,
  "All PODs": <UploadFileIcon fontSize="large" color="primary" />,
};

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const adminButtons = [
    { label: "Manage Jobs", path: "/jobs" },
    { label: "Manage Trucks", path: "/trucks" },
    { label: "Manage Drivers", path: "/drivers" },
    { label: "Work Diary", path: "/work-diary" },
    { label: "Work Logs", path: "/logs" },
    { label: "All PODs", path: "/pods" },
  ];

  const buttons = adminButtons;

  const handleClick = (path, label) => {
    setActive(label);
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 6, sm: 8 },
        px: { xs: 2, sm: 0 },
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          fontWeight={900}
          color="primary.dark"
          sx={{ letterSpacing: 1, mb: 1 }}
        >
          Welcome, {user.name}!
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 4, fontWeight: 500, letterSpacing: 0.5 }}
        >
          Select an option below to get started
        </Typography>

        <Grid container spacing={{ xs: 3, sm: 5 }} justifyContent="center">
          {buttons.map(({ label, path }) => (
            <Grid item xs={12} sm={6} md={4} key={label} sx={{ display: "flex", justifyContent: "center" }}>
              <Paper
                elevation={active === label ? 16 : 8}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  width: { xs: "100%", sm: 260 },
                  height: { xs: 180, sm: 220 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  textAlign: "center",
                  boxShadow: active === label
                    ? "0 16px 32px rgba(25, 118, 210, 0.4)"
                    : "0 4px 16px rgba(0,0,0,0.08)",
                  bgcolor: active === label ? "primary.main" : "background.paper",
                  color: active === label ? "white" : "text.primary",
                  transform: active === label ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px) scale(1.05)",
                    boxShadow: "0 12px 24px rgba(25, 118, 210, 0.35)",
                    bgcolor: "primary.main",
                    color: "white",
                    "& svg": { color: "white" },
                  },
                  "& svg": {
                    fontSize: { xs: 40, sm: 50 },
                    color: active === label ? "white" : "primary.main",
                    transition: "color 0.3s ease",
                  },
                }}
                onClick={() => handleClick(path, label)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === "Enter" && handleClick(path, label)}
              >
                <Box
                  sx={{
                    mb: 2,
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
                    borderRadius: "50%",
                    bgcolor: active === label ? "primary.light" : "primary.lighter",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {iconMap[label]}
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  {label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
