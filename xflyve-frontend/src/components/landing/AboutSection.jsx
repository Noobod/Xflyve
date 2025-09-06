import React from "react";
import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

const AboutSection = () => {
  return (
    <section id="about-section">
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: "#f9f9f9" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            align="center"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.8rem", md: "2.2rem" },
            }}
          >
            About Xflyve Logistics
          </Typography>

          <Typography
            variant="body1"
            align="center"
            sx={{
              mb: { xs: 4, md: 6 },
              maxWidth: 720,
              mx: "auto",
              color: "text.secondary",
              fontSize: { xs: "0.95rem", md: "1rem" },
            }}
          >
            With over 5 years of dedicated service, Xflyve Logistics
            specializes in reliable interstate and local delivery. We connect
            businesses and communities through efficient, secure, and timely
            transportation.
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, md: 4 },
                  textAlign: "center",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <PeopleAltIcon
                  color="primary"
                  sx={{ fontSize: { xs: 30, md: 40 }, mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Experienced Team
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                >
                  Our trained drivers and logistics experts ensure excellence at
                  every mile — always professional, always prepared.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, md: 4 },
                  textAlign: "center",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <EmojiPeopleIcon
                  color="primary"
                  sx={{ fontSize: { xs: 30, md: 40 }, mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Customer Focus
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                >
                  We’re committed to communication and reliability — your goals
                  become our mission with every delivery.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, md: 4 },
                  textAlign: "center",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <VerifiedUserIcon
                  color="primary"
                  sx={{ fontSize: { xs: 30, md: 40 }, mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Safety & Reliability
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                >
                  We follow strict safety protocols and modern tracking to
                  guarantee your goods arrive safely and on time.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </section>
  );
};

export default AboutSection;
