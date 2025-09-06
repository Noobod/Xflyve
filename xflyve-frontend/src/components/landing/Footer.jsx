import React from "react";
import { Box, Typography, Link, Stack } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        py: { xs: 3, md: 4 },
        textAlign: "center",
        backgroundColor: "#1976d2",
        color: "white",
      }}
    >
      <Typography
        variant="body2"
        gutterBottom
        sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}
      >
        &copy; {new Date().getFullYear()} Xflyve Logistics. All rights reserved.
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ mt: 1, flexWrap: "wrap" }}
      >
        <Link href="#" color="inherit" underline="hover">
          Privacy Policy
        </Link>
        <Link href="#" color="inherit" underline="hover">
          Terms of Service
        </Link>
      </Stack>
    </Box>
  );
};

export default Footer;
