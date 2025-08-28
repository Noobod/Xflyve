import React from "react";
import { Box, Typography, Grid, Paper, Avatar, Link } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

const team = [
  {
    name: "Parampreet Singh",
    role: "Founder & CEO",
    phone: "0423347XXX",
  },
];

const TeamSection = () => {
  return (
    <Box sx={{ py: 10, px: { xs: 2, md: 6 }, backgroundColor: "#f0f4f8" }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 700, mb: 6, color: "#1a202c" }}
      >
        Team & Contact
      </Typography>

      <Grid
        container
        justifyContent="center"
        alignItems="stretch"
        sx={{ maxWidth: 450, mx: "auto" }}
      >
        {team.map(({ name, role, phone }, index) => (
          <Grid
            item
            key={index}
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 5,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: 4,
                height: 340,
                width: "100%",
                boxSizing: "border-box",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                backgroundColor: "#fff",
                cursor: "default",
                "&:hover": {
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.15)",
                  transform: "translateY(-6px)",
                },
                userSelect: "none",
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 3,
                  bgcolor: "primary.main",
                  fontSize: 42,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {name.charAt(0)}
              </Avatar>
              <Typography variant="h6" fontWeight={700} color="#111" mb={1}>
                {name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" mb={3}>
                {role}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                <PhoneIcon color="primary" sx={{ fontSize: 22 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {phone}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Redesigned email section */}
      <Box
        sx={{
          mt: 8,
          display: "flex",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 6,
            maxWidth: 450,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background:
              "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
            color: "white",
            boxShadow:
              "0 12px 30px rgba(255, 126, 95, 0.4)",
            userSelect: "text",
          }}
        >
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.3)",
              borderRadius: "50%",
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow:
                "0 4px 12px rgba(255,255,255,0.5)",
            }}
          >
            <EmailIcon sx={{ fontSize: 44, color: "white" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              userSelect: "text",
              textAlign: "center",
              lineHeight: 1.4,
              letterSpacing: 0.5,
            }}
          >
            Have questions or want to get in touch? <br />
            Email us at{" "}
            <Link
              href="mailto:business@xflyve.com"
              underline="always"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              XYZ@xflyve.com
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default TeamSection;
