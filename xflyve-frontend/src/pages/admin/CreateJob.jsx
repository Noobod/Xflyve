import React, { useEffect, useState } from "react";
import {
  Container, Typography, TextField, MenuItem, Button, Alert, CircularProgress
} from "@mui/material";
import { getAllTrucks, getAllTruckAssignments, getAllDrivers, createJob } from "../../api";

const CreateJob = () => {
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

  // Fetch trucks, assignments & drivers
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
      } catch (err) {
        setError("Failed to load trucks, assignments, or drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle truck selection
  const handleTruckSelect = (truckId) => {
    setFormData(prev => ({ ...prev, truckId }));

    // Auto-assign driver if truck has assignment
    const assignment = assignments.find(a => a.truckId._id === truckId);
    if (assignment) {
      setFormData(prev => ({
        ...prev,
        assignedTo: assignment.driverId._id,
        jobDate: assignment.date.split("T")[0], // yyyy-mm-dd
      }));
    } else {
      setFormData(prev => ({ ...prev, assignedTo: "", jobDate: "" }));
    }
  };

  // Validate date against assignment
  const isValidDate = () => {
    const assignment = assignments.find(a => a.truckId._id === formData.truckId);
    if (!assignment) return true;
    return new Date(formData.jobDate).toDateString() === new Date(assignment.date).toDateString();
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.title ||
      !formData.description ||
      !formData.truckId ||
      !formData.assignedTo ||
      !formData.jobDate ||
      !formData.pickupLocation ||
      !formData.deliveryLocation ||
      !formData.jobType
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (!isValidDate()) {
      setError("Job date must match truck assignment date.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        assignedTruck: formData.truckId,
      };
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

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Create Job</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Job Title" name="title"
          value={formData.title} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label="Job Description" name="description"
          value={formData.description} onChange={handleChange} margin="normal"
          multiline rows={3} required />
        <TextField fullWidth label="Pickup Location" name="pickupLocation"
          value={formData.pickupLocation} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label="Delivery Location" name="deliveryLocation"
          value={formData.deliveryLocation} onChange={handleChange} margin="normal" required />

        {/* Select Truck */}
        <TextField select fullWidth label="Select Truck" name="truckId"
          value={formData.truckId} onChange={(e) => handleTruckSelect(e.target.value)}
          margin="normal" required>
          {trucks.map(truck => {
            const isAssigned = assignments.some(a => a.truckId._id === truck._id);
            return (
              <MenuItem key={truck._id} value={truck._id} disabled={isAssigned}>
                {truck.truckNumber} {isAssigned && "(Already Assigned)"}
              </MenuItem>
            );
          })}
        </TextField>

        {/* Assigned Driver */}
        <TextField select fullWidth label="Assigned Driver" name="assignedTo"
          value={formData.assignedTo} onChange={handleChange} margin="normal" required>
          {drivers.map(driver => (
            <MenuItem key={driver._id} value={driver._id}>{driver.name}</MenuItem>
          ))}
        </TextField>

        <TextField fullWidth label="Job Date" type="date" name="jobDate"
          value={formData.jobDate} onChange={handleChange} margin="normal"
          InputLabelProps={{ shrink: true }} required />

        <TextField select fullWidth label="Job Type" name="jobType"
          value={formData.jobType} onChange={handleChange} margin="normal" required>
          <MenuItem value="local">Local</MenuItem>
          <MenuItem value="interstate">Interstate</MenuItem>
        </TextField>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}
          disabled={submitting}>
          {submitting ? <CircularProgress size={24} /> : "Create Job"}
        </Button>
      </form>
    </Container>
  );
};

export default CreateJob;
