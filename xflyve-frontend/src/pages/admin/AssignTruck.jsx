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
  Box,
  Stack,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Form state
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedTruck, setSelectedTruck] = useState("");
  const [date, setDate] = useState("");

  // Feedback state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Assignments state
  const [assignments, setAssignments] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch data on mount
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
      date: new Date(assignment.date).toISOString().split("T")[0],
    });
    setEditOpen(true);
    setError("");
    setSuccess("");
  };

  // Handle edit change
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

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 2, md: 0 } }}>
      <Typography variant="h4" gutterBottom align="center">
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
        <Stack spacing={2}>
          <TextField
            select
            fullWidth
            label="Select Driver"
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
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
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={submitting}
          >
            {submitting ? "Assigning..." : "Assign Truck"}
          </Button>
        </Stack>
      </form>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Existing Truck Assignments
      </Typography>

      {/* Table responsive */}
      <Box sx={{ overflowX: "auto" }}>
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
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No assignments found.
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell>{assignment.driverId.name}</TableCell>
                  <TableCell>{assignment.truckId.truckNumber}</TableCell>
                  <TableCell>
                    {new Date(assignment.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction={isMobile ? "column" : "row"}
                      spacing={isMobile ? 1 : 1}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth={isMobile}
                        onClick={() => openEditDialog(assignment)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        fullWidth={isMobile}
                        onClick={() => handleDelete(assignment._id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Truck Assignment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Driver"
              name="driverId"
              value={editData?.driverId || ""}
              onChange={handleEditChange}
              fullWidth
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
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
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
