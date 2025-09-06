import React, { useEffect, useState } from "react";
import {
  Box, Button, Container, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField,
  Typography, Alert, MenuItem
} from "@mui/material";
import { getAllTrucks, createTruck, updateTruck, deleteTruck } from "../../api";

const statusOptions = ["available", "on route", "maintenance"];

const Trucks = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    truckNumber: "",
    capacity: "",
    status: "available",
  });

  const [editTruckId, setEditTruckId] = useState(null);
  const [deleteTruckId, setDeleteTruckId] = useState(null);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const res = await getAllTrucks();
      setTrucks(res.data.data);
    } catch (err) {
      setError("Failed to load trucks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.truckNumber || !formData.capacity) {
      setError("Please fill all required fields");
      return;
    }

    try {
      if (editTruckId) {
        await updateTruck(editTruckId, formData);
        setSuccess("Truck updated successfully");
      } else {
        await createTruck(formData);
        setSuccess("Truck created successfully");
      }
      setFormData({ truckNumber: "", capacity: "", status: "available" });
      setEditTruckId(null);
      fetchTrucks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save truck");
    }
  };

  const handleEdit = (truck) => {
    setEditTruckId(truck._id);
    setFormData({
      truckNumber: truck.truckNumber,
      capacity: truck.capacity,
      status: truck.status,
    });
  };

  const handleDeleteClick = (id) => setDeleteTruckId(id);
  const handleDeleteCancel = () => setDeleteTruckId(null);
  const handleDeleteConfirm = async () => {
    if (!deleteTruckId) return;
    setError(""); setSuccess("");
    try {
      await deleteTruck(deleteTruckId);
      setSuccess("Truck deleted successfully");
      setDeleteTruckId(null);
      fetchTrucks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete truck");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
        Manage Trucks
      </Typography>

      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3, textAlign: "center" }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 3, textAlign: "center" }}>{success}</Alert>}

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 4,
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h6" align="center" mb={2}>
          {editTruckId ? "Edit Truck" : "Create Truck"}
        </Typography>

        <TextField
          label="Truck Number"
          name="truckNumber"
          value={formData.truckNumber}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ style: { textAlign: "center", textTransform: "uppercase" } }}
          disabled={!!editTruckId}
        />
        <TextField
          label="Capacity"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ style: { textAlign: "center" }, min: 0 }}
        />
        <TextField
          select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          fullWidth
          inputProps={{ style: { textAlign: "center" } }}
        >
          {statusOptions.map(option => (
            <MenuItem key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button type="submit" fullWidth variant="contained" size="large">
            {editTruckId ? "Update Truck" : "Create Truck"}
          </Button>
          {editTruckId && (
            <Button
              variant="outlined"
              fullWidth
              color="secondary"
              onClick={() => {
                setEditTruckId(null);
                setFormData({ truckNumber: "", capacity: "", status: "available" });
                setError(""); setSuccess("");
              }}
            >
              Cancel Edit
            </Button>
          )}
        </Box>
      </Box>

      {/* Table for desktop, Cards for mobile */}
      <TableContainer component={Paper} elevation={3} sx={{ overflowX: "auto", display: { xs: "none", sm: "block" } }}>
        <Table>
          <TableHead>
            <TableRow>
              {["Truck Number", "Capacity", "Status", "Actions"].map(header => (
                <TableCell key={header} align="center" sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Loading trucks...</TableCell>
              </TableRow>
            ) : trucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ fontStyle: "italic" }}>No trucks found.</TableCell>
              </TableRow>
            ) : (
              trucks.map(truck => (
                <TableRow key={truck._id} hover>
                  <TableCell align="center">{truck.truckNumber}</TableCell>
                  <TableCell align="center">{truck.capacity}</TableCell>
                  <TableCell align="center" sx={{ textTransform: "capitalize" }}>{truck.status}</TableCell>
                  <TableCell align="center">
                    <Button variant="contained" size="small" onClick={() => handleEdit(truck)} sx={{ mr: 1 }}>Edit</Button>
                    <Button variant="contained" color="error" size="small" onClick={() => handleDeleteClick(truck._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile cards */}
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        {loading ? (
          <Typography align="center">Loading trucks...</Typography>
        ) : trucks.length === 0 ? (
          <Typography align="center" sx={{ fontStyle: "italic" }}>No trucks found.</Typography>
        ) : (
          trucks.map(truck => (
            <Paper key={truck._id} sx={{ p: 2, mb: 2 }}>
              <Typography><b>Truck:</b> {truck.truckNumber}</Typography>
              <Typography><b>Capacity:</b> {truck.capacity}</Typography>
              <Typography sx={{ textTransform: "capitalize" }}><b>Status:</b> {truck.status}</Typography>
              <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button size="small" variant="contained" onClick={() => handleEdit(truck)}>Edit</Button>
                <Button size="small" variant="contained" color="error" onClick={() => handleDeleteClick(truck._id)}>Delete</Button>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTruckId)} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this truck? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Trucks;
