import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { getAllTrucks, getAllTruckAssignments, getAllDrivers, createJob } from "../../api";

const CreateJob = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [trucks, setTrucks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    truckId: "",
    assignedTo: "",
    jobDate: "",
    pickupLocation: "",
    deliveryLocation: "",
    jobType: "",
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trucksRes, assignmentsRes, driversRes] = await Promise.all([
          getAllTrucks(),
          getAllTruckAssignments(),
          getAllDrivers(),
        ]);
        setTrucks(trucksRes.data.data || []);
        setAssignments(assignmentsRes.data.data || []);
        setDrivers(driversRes.data.data || []);
      } catch {
        setError("Failed to load trucks, assignments, or drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle form input
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleTruckSelect = (truckId) => {
    setFormData((prev) => ({ ...prev, truckId }));

    const assignment = assignments.find((a) => a.truckId._id === truckId);
    if (assignment) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: assignment.driverId._id,
        jobDate: assignment.date.split("T")[0],
      }));
    } else {
      setFormData((prev) => ({ ...prev, assignedTo: "", jobDate: "" }));
    }
  };

  const isValidDate = () => {
    const assignment = assignments.find((a) => a.truckId._id === formData.truckId);
    if (!assignment) return true;
    return new Date(formData.jobDate).toDateString() === new Date(assignment.date).toDateString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const requiredFields = [
      "title",
      "description",
      "truckId",
      "assignedTo",
      "jobDate",
      "pickupLocation",
      "deliveryLocation",
      "jobType",
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setError("Please fill all required fields");
        return;
      }
    }

    if (!isValidDate()) {
      setError("Job date must match truck assignment date.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...formData, assignedTruck: formData.truckId };
      delete payload.truckId;

      await createJob(payload);
      setSuccess("Job created successfully!");
      setFormData({
        title: "",
        description: "",
        truckId: "",
        assignedTo: "",
        jobDate: "",
        pickupLocation: "",
        deliveryLocation: "",
        jobType: "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, px: { xs: 2, sm: 0 } }}>
      <Typography variant="h4" gutterBottom align="center">
        Create Job
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Job Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Job Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            required
          />
          <TextField
            fullWidth
            label="Pickup Location"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Delivery Location"
            name="deliveryLocation"
            value={formData.deliveryLocation}
            onChange={handleChange}
            required
          />
          <TextField
            select
            fullWidth
            label="Select Truck"
            name="truckId"
            value={formData.truckId}
            onChange={(e) => handleTruckSelect(e.target.value)}
            required
          >
            {trucks.map((truck) => {
              const isAssigned = assignments.some((a) => a.truckId._id === truck._id);
              return (
                <MenuItem key={truck._id} value={truck._id} disabled={isAssigned}>
                  {truck.truckNumber} {isAssigned && "(Already Assigned)"}
                </MenuItem>
              );
            })}
          </TextField>
          <TextField
            select
            fullWidth
            label="Assigned Driver"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            required
          >
            {drivers.map((driver) => (
              <MenuItem key={driver._id} value={driver._id}>{driver.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Job Date"
            type="date"
            name="jobDate"
            value={formData.jobDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            select
            fullWidth
            label="Job Type"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            required
          >
            <MenuItem value="local">Local</MenuItem>
            <MenuItem value="interstate">Interstate</MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size={isMobile ? "large" : "medium"}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : "Create Job"}
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default CreateJob;
