import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getJobsByDriver, updateJob } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const DriverJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await getJobsByDriver(user._id);
        setJobs(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleStatusChange = async (jobId, newStatus) => {
    setError("");
    try {
      await updateJob(jobId, { status: newStatus });
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId ? { ...job, status: newStatus } : job
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Assigned Jobs
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : jobs.length === 0 ? (
        <Typography>No jobs assigned to you currently.</Typography>
      ) : (
        // Make table scrollable on small screens
        <Box sx={{ overflowX: "auto" }}>
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  {[
                    "Title",
                    "Truck",
                    "Pickup Location",
                    "Delivery Location",
                    "Job Type",
                    "Status",
                    "POD",
                    "Work Diary",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        whiteSpace: "nowrap", // prevent breaking header text
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job._id} hover>
                    <TableCell align="center">{job.title}</TableCell>
                    <TableCell align="center">
                      {job.assignedTruck?.truckNumber || "-"}
                    </TableCell>
                    <TableCell align="center">{job.pickupLocation}</TableCell>
                    <TableCell align="center">{job.deliveryLocation}</TableCell>
                    <TableCell
                      align="center"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {job.jobType}
                    </TableCell>
                    <TableCell align="center">
                      <Select
                        value={job.status}
                        onChange={(e) =>
                          handleStatusChange(job._id, e.target.value)
                        }
                        size="small"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        variant={job.podUploaded ? "contained" : "outlined"}
                        color="primary"
                        size="small"
                        onClick={() =>
                          navigate(`/driver/pods/upload/${job._id}`)
                        }
                      >
                        {job.podUploaded ? "Edit POD" : "Upload POD"}
                      </Button>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        variant={job.workDiaryUploaded ? "contained" : "outlined"}
                        color="primary"
                        size="small"
                        onClick={() =>
                          navigate(`/driver/work-diary/${job._id}`)
                        }
                      >
                        {job.workDiaryUploaded ? "Edit Diary" : "Upload Diary"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
};

export default DriverJobs;
