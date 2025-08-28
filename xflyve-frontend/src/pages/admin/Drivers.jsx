import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Alert,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { getAllDrivers, createDriver, deleteDriver } from "../../api";

const Drivers = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    driverType: "local",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDriverId, setDeleteDriverId] = useState(null);

  // Fetch drivers with cache busting query param to avoid stale cache
  const fetchDrivers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Add timestamp query param to bust cache
      const res = await getAllDrivers(`?ts=${Date.now()}`);
      setDrivers(res.data.data);
    } catch (err) {
      console.error("Fetch drivers error:", err.response || err);
      setError("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createDriver(formData);
      setSuccess("Driver created successfully!");
      setFormData({ name: "", email: "", password: "", driverType: "local" });
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create driver");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDriverId(id);
  };

  const handleDeleteCancel = () => {
    setDeleteDriverId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDriverId) return;
    setError("");
    setSuccess("");
    try {
      await deleteDriver(deleteDriverId);
      setSuccess("Driver deleted successfully!");
      setDeleteDriverId(null);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete driver");
    }
  };

  // ✅ Export Drivers to Excel
  const handleExportExcel = async () => {
    try {
      const res = await exportDriversExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "drivers.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export drivers");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
        Manage Drivers
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3, textAlign: "center" }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 3, textAlign: "center" }}>
          {success}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 5,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h6" align="center" mb={2}>
          Create Driver
        </Typography>

        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
        />

        <TextField
          select
          label="Driver Type"
          name="driverType"
          value={formData.driverType}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
        >
          <MenuItem value="local">Local</MenuItem>
          <MenuItem value="interstate">Interstate</MenuItem>
        </TextField>

        <Button type="submit" variant="contained" color="primary" size="large">
          Create Driver
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table aria-label="drivers table" sx={{ minWidth: 300 }}>
          <TableHead>
            <TableRow>
              {["Name", "Email", "Driver Type", "Role", "Actions"].map((header) => (
                <TableCell
                  key={header}
                  align="center"
                  sx={{ fontWeight: "bold", bgcolor: "grey.100" }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading drivers...
                </TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ fontStyle: "italic" }}>
                  No drivers found.
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver._id} hover>
                  <TableCell align="center">{driver.name}</TableCell>
                  <TableCell align="center">{driver.email}</TableCell>
                  <TableCell align="center" sx={{ textTransform: "capitalize" }}>
                    {driver.driverType}
                  </TableCell>
                  <TableCell align="center" sx={{ textTransform: "capitalize" }}>
                    {driver.role}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteClick(driver._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteDriverId)} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this driver? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Drivers;
