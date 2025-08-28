import React, { useState } from "react";
import { Container, Typography, Grid, Paper, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ListAltIcon from '@mui/icons-material/ListAlt';

const iconMap = {
  Dashboard: <DashboardIcon fontSize="large" color="primary" />,
  "Manage Jobs": <WorkIcon fontSize="large" color="primary" />,
  "Manage Trucks": <LocalShippingIcon fontSize="large" color="primary" />,
  "Manage Drivers": <PeopleIcon fontSize="large" color="primary" />,
  "Assign Trucks": <LocalShippingIcon fontSize="large" color="primary" />,
  "Work Diary": <EventNoteIcon fontSize="large" color="primary" />,
  "Work Logs": <ListAltIcon fontSize="large" color="primary" />,
  "All PODs": <UploadFileIcon fontSize="large" color="primary" />,
  "My Work Diary": <EventNoteIcon fontSize="large" color="primary" />,
  "Upload POD": <UploadFileIcon fontSize="large" color="primary" />,
  "View Jobs": <WorkIcon fontSize="large" color="primary" />,
  "My Work Logs": <ListAltIcon fontSize="large" color="primary" />,
};

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const adminButtons = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Manage Jobs", path: "/jobs" },
    { label: "Manage Trucks", path: "/trucks" },
    { label: "Manage Drivers", path: "/drivers" },
    { label: "Work Diary", path: "/work-diary" },
    { label: "Work Logs", path: "/logs" },
    { label: "All PODs", path: "/pods" },
  ];

  const driverButtons = [
    { label: "My Work Diary", path: "/work-diary" },
    { label: "Upload POD", path: "/pods/upload" },
    { label: "View Jobs", path: "/jobs" },
    { label: "My Work Logs", path: "/logs" },
  ];

  const buttons = user.role === "admin" ? adminButtons : driverButtons;

  const handleClick = (path, label) => {
    setActive(label);
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          gutterBottom
          align="center"
          fontWeight={900}
          color="primary.dark"
          sx={{ letterSpacing: 1.2, mb: 1 }}
        >
          Welcome, {user.name}!
        </Typography>

        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, fontWeight: 500, letterSpacing: 0.5 }}
        >
          Select an option below to get started
        </Typography>

        <Grid container spacing={5} justifyContent="center">
          {buttons.map(({ label, path }) => (
            <Grid
              item
              xs={12}
              sm={6} // 2 cards per row on small screens and up
              key={label}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Paper
                elevation={active === label ? 16 : 8}
                sx={{
                  cursor: "pointer",
                  borderRadius: 4,
                  width: 280,
                  height: 220,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  textAlign: "center",
                  boxShadow: active === label 
                    ? "0 20px 40px rgba(25, 118, 210, 0.5)"
                    : "0 6px 18px rgba(0,0,0,0.1)",
                  color: active === label ? "white" : "text.primary",
                  bgcolor: active === label ? "primary.main" : "background.paper",
                  userSelect: "none",
                  transform: active === label ? "scale(1.08)" : "scale(1)",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.05)",
                    boxShadow: "0 16px 32px rgba(25, 118, 210, 0.35)",
                    bgcolor: "primary.main",
                    color: "white",
                    "& svg": {
                      color: "white",
                    },
                  },
                  "& svg": {
                    fontSize: 50,
                    color: active === label ? "white" : "primary.main",
                    transition: "color 0.3s ease",
                  },
                }}
                onClick={() => handleClick(path, label)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleClick(path, label);
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: active === label ? "primary.light" : "primary.lighter",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: active === label ? "primary.dark" : "primary.main",
                    fontSize: 44,
                    transition: "background-color 0.3s ease, color 0.3s ease",
                    "&:hover": {
                      bgcolor: active === label ? "primary.main" : "primary.light",
                      color: active === label ? "white" : "primary.dark",
                    },
                  }}
                >
                  {iconMap[label]}
                </Box>

                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ userSelect: "none", pointerEvents: "none" }}
                >
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
