import React from "react";
import { Box, Container, Typography, Stack } from "@mui/material";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";

const productValues = [
  {
    icon: <ScheduleRoundedIcon />,
    title: "Less admin chasing",
    body: "Keep jobs, work logs, PODs and diary files moving through one workflow instead of scattered messages.",
  },
  {
    icon: <PhoneIphoneRoundedIcon />,
    title: "Mobile-first for real teams",
    body: "Owners and drivers can check the day’s work, upload records and keep operations moving from the road.",
  },
  {
    icon: <FactCheckRoundedIcon />,
    title: "Cleaner records",
    body: "Prepare weekly pay and invoice checks with fewer missing documents and less end-of-week cleanup.",
  },
];

const AboutSection = () => {
  return (
    <section id="about-section">
      <Box sx={{ py: { xs: 7, md: 11 }, backgroundColor: "#F6F8FB" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
              gap: { xs: 4, md: 6 },
              alignItems: "start",
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#0F766E",
                  fontWeight: 950,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontSize: "0.78rem",
                }}
              >
                Product
              </Typography>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  mt: 1.5,
                  fontWeight: 950,
                  letterSpacing: "-0.055em",
                  lineHeight: 1.05,
                  fontSize: { xs: "2.05rem", md: "3.3rem" },
                  color: "#0F172A",
                }}
              >
                Built for owners who still run the business themselves.
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  color: "#475569",
                  lineHeight: 1.75,
                  fontSize: { xs: "1rem", md: "1.08rem" },
                }}
              >
                XFlyve is not a generic transport website. It is operations
                software for small logistics companies that need dispatch,
                driver records and document control without hiring extra admin
                support.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {productValues.map((item) => (
                <Stack
                  key={item.title}
                  spacing={1.5}
                  sx={{
                    height: "100%",
                    p: { xs: 2.25, md: 2.75 },
                    borderRadius: "26px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: "17px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "#ECFEFF",
                      color: "#0F766E",
                      "& svg": { fontSize: 24 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 950, color: "#0F172A" }}>
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#64748B",
                      lineHeight: 1.65,
                      fontSize: "0.92rem",
                    }}
                  >
                    {item.body}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </section>
  );
};

export default AboutSection;
