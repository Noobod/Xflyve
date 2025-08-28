import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "About", id: "about-section" },
  { label: "Services", id: "services-section" },
  { label: "Why Choose Us", id: "whychoose-section" },
  { label: "Team & Contact", id: "team&contact-section" },
];

const PublicNavbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    if (drawerOpen) setDrawerOpen(false);
  };

  return (
    <>
      <AppBar position="fixed" color="primary" elevation={1}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: "pointer" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Xflyve Logistics
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                edge="end"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                <Box sx={{ width: 250 }} role="presentation">
                  <List>
                    {navItems.map(({ label, id }) => (
                      <ListItem key={id} disablePadding>
                        <ListItemButton onClick={() => handleScrollTo(id)}>
                          <ListItemText primary={label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => navigate("/login")}>
                        <ListItemText primary="Login" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <Box>
              {navItems.map(({ label, id }) => (
                <Button
                  key={id}
                  color="inherit"
                  onClick={() => handleScrollTo(id)}
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  {label}
                </Button>
              ))}
              <Button
                variant="outlined"
                color="inherit"
                sx={{ ml: 2 }}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {/* Push content down so it's not hidden behind fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default PublicNavbar;
