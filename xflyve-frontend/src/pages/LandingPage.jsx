// src/pages/LandingPage.jsx
import React from "react";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import ServicesSection from "../components/landing/ServicesSection";
import WhyChooseUs from "../components/landing/WhyChooseUs";
import TeamContactSection from "../components/landing/TeamContactSection";
import FooterSection from "../components/landing/Footer";
import PublicNavbar from "../components/landing/PublicNavbar";

const LandingPage = () => {
  return (
    <>
      <PublicNavbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <WhyChooseUs />
      <TeamContactSection />
      <FooterSection />
    </>
  );
};

export default LandingPage;
