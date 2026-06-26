// src/pages/LandingPage.jsx
import React from "react";
import { Box } from "@mui/material";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import ServicesSection from "../components/landing/ServicesSection";
import WhyChooseUs from "../components/landing/WhyChooseUs";
import TeamContactSection from "../components/landing/TeamContactSection";
import FooterSection from "../components/landing/Footer";
import PublicNavbar from "../components/landing/PublicNavbar";

const LandingPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        overflowX: "hidden",
        bgcolor: "#F6F8FB",
        color: "#0F172A",
      }}
    >
      <PublicNavbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <WhyChooseUs />
      <TeamContactSection />
      <FooterSection />
    </Box>
  );
};

export default LandingPage;
