import React from "react";
import { Box, Typography, Container } from "@mui/material";

const HeroSection = () => {
  return (
    <Box
      sx={{
        minHeight: { xs: "70vh", md: "90vh" },
        backgroundImage: `url("https://plus.unsplash.com/premium_photo-1664297213086-9edac5ffa4cf?q=80&w=1661&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
        px: { xs: 2, md: 0 }, // padding on small screens
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
            fontWeight: "bold",
          }}
        >
          Reliable Logistics Solutions
        </Typography>
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
          }}
        >
          Serving interstate and local deliveries with 5 years of trusted
          experience.
        </Typography>
      </Container>
    </Box>
  );
};

export default HeroSection;
