import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";

const ServicesSection = () => {
  return (
    <section id="services-section">
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: "#f9f9f9" }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", fontSize: { xs: "1.8rem", md: "2.5rem" } }}
        >
          Our Services
        </Typography>

        <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, md: 4 },
                textAlign: "center",
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, fontWeight: "bold" }}
              >
                Interstate Delivery
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, color: "text.secondary" }}>
                Reliable and timely interstate transport across states with a fleet of experienced drivers and well-maintained trucks.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, md: 4 },
                textAlign: "center",
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" }, fontWeight: "bold" }}
              >
                Local Delivery
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, color: "text.secondary" }}>
                Fast and efficient local deliveries for your business needs, ensuring every shipment reaches its destination safely.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </section>
  );
};

export default ServicesSection;
