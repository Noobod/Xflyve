import React from "react";
import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

const AboutSection = () => {
  return (
    <section id="about">
      <Box
        sx={{ py: 8, backgroundColor: "#f9f9f9" }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            About Xflyve Logistics
          </Typography>

          <Typography
            variant="body1"
            align="center"
            sx={{ mb: 6, maxWidth: 720, mx: "auto", color: "text.secondary" }}
          >
            With over 5 years of dedicated service, Xflyve Logistics
            specializes in reliable interstate and local delivery. We connect
            businesses and communities through efficient, secure, and timely
            transportation.
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <PeopleAltIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Experienced Team
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our trained drivers and logistics experts ensure excellence at
                  every mile — always professional, always prepared.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <EmojiPeopleIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Customer Focus
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We’re committed to communication and reliability — your goals
                  become our mission with every delivery.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <VerifiedUserIcon
                  color="primary"
                  sx={{ fontSize: 40, mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Safety & Reliability
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
