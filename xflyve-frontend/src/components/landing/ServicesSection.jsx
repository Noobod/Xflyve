import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";

const ServicesSection = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: "#f9f9f9" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Our Services
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Interstate Delivery
            </Typography>
            <Typography>
              Reliable and timely interstate transport across states with a
              fleet of experienced drivers and well-maintained trucks.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Local Delivery
            </Typography>
            <Typography>
              Fast and efficient local deliveries for your business needs,
              ensuring every shipment reaches its destination safely.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServicesSection;
