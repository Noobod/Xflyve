import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box sx={{ py: 4, textAlign: "center", backgroundColor: "#1976d2", color: "white" }}>
      <Typography variant="body2" gutterBottom>
        &copy; {new Date().getFullYear()} Xflyve Logistics. All rights reserved.
      </Typography>
      <Typography variant="body2">
        <Link href="#" color="inherit" underline="hover" sx={{ mx: 1 }}>
          Privacy Policy
        </Link>
        |
        <Link href="#" color="inherit" underline="hover" sx={{ mx: 1 }}>
          Terms of Service
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
