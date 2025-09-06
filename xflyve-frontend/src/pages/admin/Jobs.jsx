import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Grid,
  Stack,
} from "@mui/material";
import { getAllJobs, deleteJob, getAllTrucks, getAllTruckAssignments, getAllDrivers, updateJob } from "../../api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [filterDriver, setFilterDriver] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const res = await getAllJobs();
      setJobs(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrucksDrivers = async () => {
    try {
      const [trucksRes, assignmentsRes, driversRes] = await Promise.all([
        getAllTrucks(),
        getAllTruckAssignments(),
        getAllDrivers(),
      ]);
      setTrucks(trucksRes.data.data || []);
      setAssignments(assignmentsRes.data.data || []);
      setDrivers(driversRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchTrucksDrivers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      setJobs(jobs.filter((job) => job._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete job");
    }
  };

  const openEdit = (job) => {
    setEditJob({
      _id: job._id,
      title: job.title,
      description: job.description,
      pickupLocation: job.pickupLocation,
      deliveryLocation: job.deliveryLocation,
      truckId: job.assignedTruck?._id || "",
      assignedTo: job.assignedTo?._id || "",
      jobType: job.jobType,
      jobDate: job.jobDate ? dayjs(job.jobDate).format("YYYY-MM-DD") : "",
    });
    setEditError("");
    setEditSuccess("");
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    setEditJob((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTruckChange = (e) => {
    const truckId = e.target.value;
    setEditJob((prev) => ({
      ...prev,
      truckId,
      assignedTo: "",
    }));

    const assignment = assignments.find((a) => a.truckId._id === truckId);
    if (assignment) {
      setEditJob((prev) => ({
        ...prev,
        assignedTo: assignment.driverId._id,
        jobDate: assignment.date.split("T")[0],
      }));
    }
  };

  const handleEditSubmit = async () => {
    if (
      !editJob.title ||
      !editJob.description ||
      !editJob.truckId ||
      !editJob.assignedTo ||
      !editJob.jobDate ||
      !editJob.pickupLocation ||
      !editJob.deliveryLocation ||
      !editJob.jobType
    ) {
      setEditError("Please fill all required fields");
      return;
    }

    setEditSubmitting(true);
    setEditError("");
    setEditSuccess("");

    try {
      const payload = {
        title: editJob.title,
        description: editJob.description,
        pickupLocation: editJob.pickupLocation,
        deliveryLocation: editJob.deliveryLocation,
        assignedTruck: editJob.truckId,
        assignedTo: editJob.assignedTo,
        jobType: editJob.jobType,
        jobDate: editJob.jobDate,
      };

      await updateJob(editJob._id, payload);
      setEditSuccess("Job updated successfully!");
      setEditOpen(false);
      fetchJobs();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update job");
    } finally {
      setEditSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesDriver = filterDriver ? job.assignedTo?._id === filterDriver : true;
    const matchesStartDate = filterStartDate ? dayjs(job.jobDate).isAfter(dayjs(filterStartDate).subtract(1, "day")) : true;
    const matchesEndDate = filterEndDate ? dayjs(job.jobDate).isBefore(dayjs(filterEndDate).add(1, "day")) : true;
    return matchesDriver && matchesStartDate && matchesEndDate;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Jobs
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => navigate("/jobs/create")}
      >
        Create New Job
      </Button>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Driver"
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
            >
              <MenuItem value="">All Drivers</MenuItem>
              {drivers.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => {
                setFilterDriver("");
                setFilterStartDate("");
                setFilterEndDate("");
              }}
              sx={{ mt: { xs: 1, sm: 0 } }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Table for larger screens */}
          <TableContainer component={Paper} elevation={3} sx={{ display: { xs: "none", sm: "block" }, overflowX: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {["Title", "Description", "Pickup", "Delivery", "Driver", "Truck", "Type", "Status", "Date", "Actions"].map((header) => (
                    <TableCell key={header} align="center" sx={{ fontWeight: "bold", minWidth: 120 }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job._id} hover>
                    <TableCell align="center">{job.title}</TableCell>
                    <TableCell align="center">{job.description}</TableCell>
                    <TableCell align="center">{job.pickupLocation}</TableCell>
                    <TableCell align="center">{job.deliveryLocation}</TableCell>
                    <TableCell align="center">{job.assignedTo?.name || "N/A"}</TableCell>
                    <TableCell align="center">{job.assignedTruck?.truckNumber || "N/A"}</TableCell>
                    <TableCell align="center">{job.jobType}</TableCell>
                    <TableCell align="center">{job.status}</TableCell>
                    <TableCell align="center">{job.jobDate ? dayjs(job.jobDate).format("DD-MM-YYYY") : "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => openEdit(job)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(job._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Card layout for mobile */}
          <Stack spacing={2} sx={{ display: { xs: "block", sm: "none" } }}>
            {filteredJobs.map((job) => (
              <Paper key={job._id} sx={{ p: 2 }}>
                <Typography variant="h6">{job.title}</Typography>
                <Typography variant="body2">{job.description}</Typography>
                <Typography variant="body2">Pickup: {job.pickupLocation}</Typography>
                <Typography variant="body2">Delivery: {job.deliveryLocation}</Typography>
                <Typography variant="body2">Driver: {job.assignedTo?.name || "N/A"}</Typography>
                <Typography variant="body2">Truck: {job.assignedTruck?.truckNumber || "N/A"}</Typography>
                <Typography variant="body2">Type: {job.jobType}</Typography>
                <Typography variant="body2">Status: {job.status}</Typography>
                <Typography variant="body2">Date: {job.jobDate ? dayjs(job.jobDate).format("DD-MM-YYYY") : "-"}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button variant="contained" size="small" onClick={() => openEdit(job)}>Edit</Button>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(job._id)}>Delete</Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </>
      )}

      {error && <Typography color="error">{error}</Typography>}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Job</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>{editSuccess}</Alert>}

          <TextField fullWidth label="Job Title" name="title" value={editJob?.title || ""} onChange={handleEditChange} margin="normal" required />
          <TextField fullWidth label="Job Description" name="description" value={editJob?.description || ""} onChange={handleEditChange} margin="normal" multiline rows={3} required />
          <TextField fullWidth label="Pickup Location" name="pickupLocation" value={editJob?.pickupLocation || ""} onChange={handleEditChange} margin="normal" required />
          <TextField fullWidth label="Delivery Location" name="deliveryLocation" value={editJob?.deliveryLocation || ""} onChange={handleEditChange} margin="normal" required />

          <TextField select fullWidth label="Truck" name="truckId" value={editJob?.truckId || ""} onChange={handleTruckChange} margin="normal" required>
            {trucks.map((truck) => {
              const isAssigned = assignments.some((a) => a.truckId._id === truck._id);
              return (
                <MenuItem key={truck._id} value={truck._id} disabled={isAssigned && truck._id !== editJob?.truckId}>
                  {truck.truckNumber} {isAssigned && truck._id !== editJob?.truckId ? "(Already Assigned)" : ""}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField select fullWidth label="Driver" name="assignedTo" value={editJob?.assignedTo || ""} onChange={handleEditChange} margin="normal" required>
            {drivers.filter((d) => {
              const assignment = assignments.find((a) => a.driverId._id === d._id);
              return !assignment || assignment.truckId._id === editJob?.truckId;
            }).map((driver) => (
              <MenuItem key={driver._id} value={driver._id}>{driver.name}</MenuItem>
            ))}
          </TextField>

          <TextField select fullWidth label="Job Type" name="jobType" value={editJob?.jobType || ""} onChange={handleEditChange} margin="normal" required>
            <MenuItem value="local">Local</MenuItem>
            <MenuItem value="interstate">Interstate</MenuItem>
          </TextField>

          <TextField fullWidth label="Job Date" type="date" name="jobDate" value={editJob?.jobDate || ""} onChange={handleEditChange} margin="normal" InputLabelProps={{ shrink: true }} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary" disabled={editSubmitting}>
            {editSubmitting ? <CircularProgress size={24} /> : "Update Job"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Jobs;
