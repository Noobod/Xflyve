import React from "react";
import { Box, Typography, Link, Stack, Container } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

const Footer = () => {
  return (
    <Box
      sx={{
        py: { xs: 4, md: 5 },
        backgroundColor: "#071827",
        color: "#E2E8F0",
        borderTop: "1px solid rgba(148, 163, 184, 0.14)",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                color: "#CCFBF1",
                background: "linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)",
              }}
            >
              <LocalShippingOutlinedIcon sx={{ fontSize: 21 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 950, color: "#FFFFFF" }}>
                XFlyve Operations
              </Typography>
              <Typography sx={{ color: "#94A3B8", fontSize: "0.86rem" }}>
                Logistics SaaS for small transport companies.
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Typography
              variant="body2"
              sx={{ color: "#94A3B8", textAlign: { xs: "left", sm: "right" } }}
            >
              &copy; {new Date().getFullYear()} XFlyve. All rights reserved.
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={{ xs: "flex-start", sm: "flex-end" }}
              sx={{ mt: 0.75, flexWrap: "wrap" }}
            >
              <Link href="#" color="inherit" underline="hover" sx={{ fontSize: "0.86rem" }}>
                Privacy
              </Link>
              <Link href="#" color="inherit" underline="hover" sx={{ fontSize: "0.86rem" }}>
                Terms
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
