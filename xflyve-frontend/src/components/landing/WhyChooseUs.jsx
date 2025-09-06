import React from "react";
import { Box, Typography, Grid, List, ListItem, ListItemText } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const WhyChooseUs = () => {
  const points = [
    "5+ Years of industry experience",
    "Experienced & professional drivers",
    "Fleet of well-maintained trucks",
    "Competitive pricing and transparency",
    "Dedicated customer support",
  ];

  return (
    <section id="whychoose-section">
      <Box sx={{ py: { xs: 6, md: 8 }, px: { xs: 2, md: 6 } }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: { xs: 4, md: 6 }, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
        >
          Why Choose Xflyve Logistics?
        </Typography>

        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={8}>
            <List>
              {points.map((point, i) => (
                <ListItem
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    py: { xs: 1, md: 2 },
                  }}
                >
                  <CheckCircleIcon
                    color="primary"
                    sx={{ mr: 2, mt: '4px', fontSize: { xs: 22, md: 28 } }}
                  />
                  <ListItemText
                    primary={point}
                    primaryTypographyProps={{
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
                      lineHeight: 1.5,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Box>
    </section>
  );
};

export default WhyChooseUs;
