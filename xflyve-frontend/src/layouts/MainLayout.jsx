import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </>
  );
};

export default MainLayout;
