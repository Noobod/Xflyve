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
import {
  getAllDrivers,
  createDriver,
  deleteDriver,
  getPublicDrivers,
} from "../../api";

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

  // Fetch REAL drivers
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await getAllDrivers(`?ts=${Date.now()}`);
      setDrivers(res.data.data);
    } catch (err) {
      console.error("Fetch drivers error:", err.response || err);
      setError("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch DEMO fake drivers (100 users)
  const fetchDemoDrivers = async () => {
    setLoading(true);
    try {
      const res = await getPublicDrivers();
      setDrivers(res.data.users); // public demo 100 users
      setSuccess("Showing 100 demo users for presentation.");
    } catch (err) {
      console.error("Demo drivers error:", err.response || err);
      setError("Failed to load demo drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers(); // default real data
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

  const handleDeleteClick = (id) => setDeleteDriverId(id);
  const handleDeleteCancel = () => setDeleteDriverId(null);

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

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        fontWeight="bold"
        sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
      >
        Manage Drivers
      </Typography>

      {/* SWITCH BUTTONS */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3, gap: 2 }}>
        <Button variant="contained" color="primary" onClick={fetchDrivers}>
          Load Real Drivers
        </Button>

        <Button variant="contained" color="secondary" onClick={fetchDemoDrivers}>
          Load Demo Drivers (100)
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Create Driver Form (Real Project Feature Still Works) */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1, sm: 2 },
          mb: 5,
          p: { xs: 2, sm: 3 },
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h6" align="center" mb={2}>
          Create Driver
        </Typography>

        <TextField label="Name" name="name" value={formData.name} onChange={handleChange} required fullWidth />
        <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required fullWidth />
        <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required fullWidth />

        <TextField select label="Driver Type" name="driverType" value={formData.driverType} onChange={handleChange} required fullWidth>
          <MenuItem value="local">Local</MenuItem>
          <MenuItem value="interstate">Interstate</MenuItem>
        </TextField>

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Create Driver
        </Button>
      </Box>

      {/* Drivers Table */}
      <TableContainer component={Paper} elevation={3} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 300 }}>
          <TableHead>
            <TableRow>
              {["Name", "Email", "Driver Type", "Role", "Actions"].map((header) => (
                <TableCell key={header} align="center" sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No drivers found.
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver._id}>
                  <TableCell align="center">{driver.name}</TableCell>
                  <TableCell align="center">{driver.email}</TableCell>
                  <TableCell align="center">{driver.driverType}</TableCell>
                  <TableCell align="center">{driver.role}</TableCell>
                  <TableCell align="center">
                    <Button variant="contained" color="error" size="small" onClick={() => handleDeleteClick(driver._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Pop-up */}
      <Dialog open={Boolean(deleteDriverId)} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this driver?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Drivers;
