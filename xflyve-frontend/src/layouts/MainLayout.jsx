import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Box component="main" sx={{ minWidth: 0, overflowX: "hidden" }}>
        <Outlet />
      </Box>
    </>
  );
};

export default MainLayout;
