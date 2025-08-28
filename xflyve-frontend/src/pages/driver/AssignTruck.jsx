import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { getDriverTruckAssignment } from "../../api"; // Your API call function
import { useAuth } from "../../contexts/AuthContext"; // Correct folder name

const DriverTruckAssignment = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError("");
      try {
        const res = await getDriverTruckAssignment(user.id, date);
        setAssignment(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load assignment.");
        setAssignment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [user, date]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Truck Assignment
      </Typography>

      <TextField
        label="Select Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
        sx={{ mb: 3 }}
        disabled={loading}
      />

      {loading && <CircularProgress />}

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {!loading && !error && !assignment && (
        <Alert severity="info">No truck assigned for this date.</Alert>
      )}

      {!loading && assignment && (
        <Card>
          <CardContent>
            <Typography variant="h6">Truck Details:</Typography>
            <Typography>Truck Number: {assignment.truckId?.truckNumber || "N/A"}</Typography>
            <Typography>Model: {assignment.truckId?.model || "N/A"}</Typography>
            <Typography>Assigned Date: {new Date(assignment.date).toLocaleDateString()}</Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default DriverTruckAssignment;
