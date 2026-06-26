import React from "react";
import { Box, Typography, Container, Button, Stack, Link } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const contactDetails = [
  { icon: <EmailIcon />, label: "Email", value: "XYZ@xflyve.com", href: "mailto:business@xflyve.com" },
  { icon: <PhoneIcon />, label: "Phone", value: "0423347XXX", href: "tel:0423347000" },
];

const TeamSection = () => {
  return (
    <section id="team&contact-section">
      <Box sx={{ py: { xs: 7, md: 11 }, backgroundColor: "#FFFFFF" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              p: { xs: 2.5, sm: 3.5, md: 5 },
              borderRadius: { xs: "30px", md: "40px" },
              background:
                "radial-gradient(circle at top right, rgba(20,184,166,0.18), transparent 30%), linear-gradient(135deg, #071827 0%, #0F172A 100%)",
              color: "#FFFFFF",
              border: "1px solid rgba(153, 246, 228, 0.16)",
              boxShadow: "0 30px 80px rgba(7, 24, 39, 0.18)",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 3, md: 5 },
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ maxWidth: 620 }}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: "20px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(20, 184, 166, 0.14)",
                  color: "#5EEAD4",
                  mb: 2,
                }}
              >
                <CalendarMonthRoundedIcon />
              </Box>
              <Typography
                sx={{
                  color: "#5EEAD4",
                  fontWeight: 950,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontSize: "0.78rem",
                }}
              >
                Request demo
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  mt: 1.4,
                  fontWeight: 950,
                  letterSpacing: "-0.055em",
                  lineHeight: 1.05,
                  fontSize: { xs: "2rem", md: "3.15rem" },
                }}
              >
                See how XFlyve could fit your transport workflow.
              </Typography>
              <Typography sx={{ mt: 2, color: "#CBD5E1", lineHeight: 1.75 }}>
                Book a practical walkthrough for jobs, drivers, PODs, work
                logs, compliance records and owner review workflows. No booking
                backend is connected yet — this is a contact placeholder.
              </Typography>
            </Box>

            <Stack
              spacing={1.5}
              sx={{
                width: { xs: "100%", md: 360 },
                flex: "0 0 auto",
              }}
            >
              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                href="mailto:business@xflyve.com?subject=XFlyve demo request"
                sx={{
                  minHeight: 56,
                  borderRadius: "18px",
                  textTransform: "none",
                  fontWeight: 950,
                  bgcolor: "#14B8A6",
                  color: "#042F2E",
                  boxShadow: "0 18px 36px rgba(20, 184, 166, 0.24)",
                  "&:hover": { bgcolor: "#5EEAD4" },
                }}
              >
                Book Demo
              </Button>

              {contactDetails.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.75,
                    borderRadius: "18px",
                    bgcolor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "15px",
                      display: "grid",
                      placeItems: "center",
                      color: "#5EEAD4",
                      bgcolor: "rgba(20, 184, 166, 0.12)",
                      "& svg": { fontSize: 21 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#94A3B8", fontSize: "0.78rem", fontWeight: 800 }}>
                      {item.label}
                    </Typography>
                    <Link
                      href={item.href}
                      underline="hover"
                      sx={{ color: "#FFFFFF", fontWeight: 850 }}
                    >
                      {item.value}
                    </Link>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </section>
  );
};

export default TeamSection;
