import React from "react";
import { Box, Typography } from "@mui/material";

const ErrorPage = () => {
  return (
    <Box sx={{ textAlign: "center", mt: 10 }}>
      <Typography variant="h2" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1">
        Sorry, the page you're looking for doesn't exist.
      </Typography>
    </Box>
  );
};

export default ErrorPage;
