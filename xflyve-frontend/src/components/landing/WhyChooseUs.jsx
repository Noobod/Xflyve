import React from "react";
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText } from "@mui/material";
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
    <Box sx={{ py: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Why Choose Xflyve Logistics?
      </Typography>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8}>
          <List>
            {points.map((point, i) => (
              <ListItem key={i}>
                <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
                <ListItemText primary={point} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WhyChooseUs;
