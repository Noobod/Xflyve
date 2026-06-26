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
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Product", id: "about-section" },
  { label: "Features", id: "services-section" },
  { label: "Why XFlyve", id: "whychoose-section" },
  { label: "Book Demo", id: "team&contact-section" },
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
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "rgba(247, 250, 252, 0.88)",
          color: "#0F172A",
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1240,
            width: "100%",
            mx: "auto",
            minHeight: { xs: 68, md: 76 },
            px: { xs: 2, sm: 3, md: 4 },
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              cursor: "pointer",
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                color: "#CCFBF1",
                background:
                  "linear-gradient(135deg, #071827 0%, #0F766E 100%)",
                boxShadow: "0 14px 30px rgba(15, 118, 110, 0.18)",
              }}
            >
              <LocalShippingOutlinedIcon sx={{ fontSize: 21 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.08rem" },
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                XFlyve
              </Typography>
              <Typography
                sx={{
                  mt: 0.35,
                  color: "#64748B",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                Operations
              </Typography>
            </Box>
          </Box>

          {isMobile ? (
            <>
              <IconButton
                edge="end"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "16px",
                  color: "#0F172A",
                  border: "1px solid rgba(15, 23, 42, 0.1)",
                  bgcolor: "#FFFFFF",
                }}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                <Box
                  sx={{
                    width: { xs: 310, sm: 360 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    bgcolor: "#F8FAFC",
                  }}
                >
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ p: 2.25 }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          letterSpacing: "-0.03em",
                          color: "#0F172A",
                        }}
                      >
                        XFlyve
                      </Typography>
                      <IconButton
                        onClick={() => setDrawerOpen(false)}
                        aria-label="close menu"
                        sx={{
                          borderRadius: "14px",
                          border: "1px solid rgba(15, 23, 42, 0.08)",
                          bgcolor: "#FFFFFF",
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                    <Divider />
                    <List sx={{ p: 1.5 }}>
                    {navItems.map(({ label, id }) => (
                      <ListItem key={id} disablePadding>
                        <ListItemButton
                          onClick={() => handleScrollTo(id)}
                          sx={{
                            minHeight: 52,
                            borderRadius: "16px",
                            mb: 0.5,
                            color: "#0F172A",
                          }}
                        >
                          <ListItemText
                            primary={label}
                            primaryTypographyProps={{ fontWeight: 800 }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    </List>
                  </Box>
                  <Box sx={{ p: 2.25 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate("/login")}
                      sx={{
                        minHeight: 52,
                        borderRadius: "16px",
                        textTransform: "none",
                        fontWeight: 900,
                        bgcolor: "#0F766E",
                        boxShadow: "0 16px 30px rgba(15, 118, 110, 0.22)",
                        "&:hover": { bgcolor: "#115E59" },
                      }}
                    >
                      Login to Operations
                    </Button>
                  </Box>
                </Box>
              </Drawer>
            </>
          ) : (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              {navItems.map(({ label, id }) => (
                <Button
                  key={id}
                  onClick={() => handleScrollTo(id)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    color: "#334155",
                    borderRadius: "999px",
                    px: 1.8,
                    "&:hover": {
                      bgcolor: "rgba(15, 118, 110, 0.08)",
                      color: "#0F766E",
                    },
                  }}
                >
                  {label}
                </Button>
              ))}
              <Button
                variant="contained"
                sx={{
                  ml: 1,
                  borderRadius: "999px",
                  px: 2.6,
                  minHeight: 44,
                  textTransform: "none",
                  fontWeight: 900,
                  bgcolor: "#071827",
                  color: "#FFFFFF",
                  boxShadow: "0 14px 28px rgba(7, 24, 39, 0.18)",
                  "&:hover": {
                    bgcolor: "#0F172A",
                    transform: "translateY(-1px)",
                    boxShadow: "0 18px 34px rgba(7, 24, 39, 0.22)",
                  },
                }}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Toolbar />
    </>
  );
};

export default PublicNavbar;
