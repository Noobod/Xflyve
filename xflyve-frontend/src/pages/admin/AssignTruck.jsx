import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  getAllDrivers,
  getAllTrucks,
  assignTruck,
  getAllTruckAssignments,
  updateTruckAssignment,
  deleteTruckAssignment,
} from "../../api";

const AssignAndManageTrucks = () => {
  // Form state
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedTruck, setSelectedTruck] = useState("");
  const [date, setDate] = useState("");

  // Assign form feedback
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // List and edit state
  const [assignments, setAssignments] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch drivers, trucks, and assignments on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [driversRes, trucksRes, assignmentsRes] = await Promise.all([
          getAllDrivers(),
          getAllTrucks(),
          getAllTruckAssignments(),
        ]);
        setDrivers(driversRes.data.data || []);
        setTrucks(trucksRes.data.data || []);
        setAssignments(assignmentsRes.data.data || []);
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Handle new assignment submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedDriver || !selectedTruck || !date) {
      setError("Please select driver, truck, and date.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await assignTruck({
        driverId: selectedDriver,
        truckId: selectedTruck,
        date,
      });
      if (res.data.success) {
        setSuccess("Truck assigned successfully!");
        setSelectedDriver("");
        setSelectedTruck("");
        setDate("");
        // Refresh assignments list
        const assignmentsRes = await getAllTruckAssignments();
        setAssignments(assignmentsRes.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign truck.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (assignment) => {
    setEditData({
      id: assignment._id,
      driverId: assignment.driverId._id,
      truckId: assignment.truckId._id,
      date: new Date(assignment.date).toISOString().split("T")[0], // yyyy-mm-dd
    });
    setEditOpen(true);
    setError("");
    setSuccess("");
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit edit
  const handleEditSubmit = async () => {
    const { id, driverId, truckId, date } = editData;
    if (!driverId || !truckId || !date) {
      setError("All fields are required.");
      return;
    }
    try {
      await updateTruckAssignment(id, { driverId, truckId, date });
      const assignmentsRes = await getAllTruckAssignments();
      setAssignments(assignmentsRes.data.data || []);
      setEditOpen(false);
      setEditData(null);
      setError("");
      setSuccess("Assignment updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  };

  // Delete assignment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await deleteTruckAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      setSuccess("Assignment deleted successfully!");
      setError("");
    } catch {
      setError("Delete failed.");
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Assign Truck to Driver
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Assign Form */}
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          select
          fullWidth
          label="Select Driver"
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
          margin="normal"
          required
        >
          {drivers.map((driver) => (
            <MenuItem key={driver._id} value={driver._id}>
              {driver.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Select Truck (Rego)"
          value={selectedTruck}
          onChange={(e) => setSelectedTruck(e.target.value)}
          margin="normal"
          required
        >
          {trucks.map((truck) => (
            <MenuItem key={truck._id} value={truck._id}>
              {truck.truckNumber}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          margin="normal"
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={submitting}
          sx={{ mt: 2, mb: 4 }}
        >
          {submitting ? "Assigning..." : "Assign Truck"}
        </Button>
      </form>

      <Typography variant="h5" gutterBottom>
        Existing Truck Assignments
      </Typography>

      {/* Assignments Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Driver</TableCell>
            <TableCell>Truck (Rego)</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {assignments.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No assignments found.
              </TableCell>
            </TableRow>
          )}

          {assignments.map((assignment) => (
            <TableRow key={assignment._id}>
              <TableCell>{assignment.driverId.name}</TableCell>
              <TableCell>{assignment.truckId.truckNumber}</TableCell>
              <TableCell>{new Date(assignment.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => openEditDialog(assignment)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => handleDelete(assignment._id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Truck Assignment</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Driver"
            name="driverId"
            value={editData?.driverId || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          >
            {drivers.map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Truck"
            name="truckId"
            value={editData?.truckId || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          >
            {trucks.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.truckNumber}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date"
            type="date"
            name="date"
            value={editData?.date || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignAndManageTrucks;
