import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Button,
  Paper,
  TextField,
  MenuItem,
} from "@mui/material";
import api from "../../api"; // axios instance

const PodsList = () => {
  const [pods, setPods] = useState([]);
  const [filteredPods, setFilteredPods] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filterDriver, setFilterDriver] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchPods = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/jobpods/admin/all");
      if (res.data.status === "success") {
        setPods(res.data.data);
        setFilteredPods(res.data.data);
      } else {
        setError(res.data.message || "Failed to fetch PODs");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error fetching PODs");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get("/drivers/all");
      if (res.data.status === "success") {
        setDrivers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    }
  };

  useEffect(() => {
    fetchPods();
    fetchDrivers();
  }, []);

  const handleDownload = async (jobId, jobName = "pod") => {
    try {
      const res = await api.get(`/jobpods/${jobId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${jobName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download POD error:", err);
      alert(err.response?.data?.message || "Failed to download POD");
    }
  };

  const handleDelete = async (podId) => {
    if (!window.confirm("Are you sure you want to delete this POD?")) return;
    try {
      await api.delete(`/jobpods/${podId}`);
      fetchPods();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete POD");
    }
  };

  const handleFilter = () => {
    let filtered = [...pods];
    if (filterDriver) {
      filtered = filtered.filter((p) => p.driverId?._id === filterDriver);
    }
    if (filterDate) {
      filtered = filtered.filter((p) => p.uploadedAt?.split("T")[0] === filterDate);
    }
    setFilteredPods(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [filterDriver, filterDate, pods]);

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        PODs Uploaded by Drivers
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          select
          label="Filter by Driver"
          value={filterDriver}
          onChange={(e) => setFilterDriver(e.target.value)}
          size="small"
        >
          <MenuItem value="">All</MenuItem>
          {drivers.map((d) => (
            <MenuItem key={d._id} value={d._id}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Filter by Date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : filteredPods.length === 0 ? (
        <Typography>No PODs found.</Typography>
      ) : (
        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Truck Number</TableCell>
                <TableCell>Job Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Driver Name</TableCell>
                <TableCell>Uploaded At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPods.map((pod) => (
                <TableRow key={pod._id}>
                  <TableCell>{pod.jobId?.title || "N/A"}</TableCell>
                  <TableCell>{pod.jobId?.assignedTruck?.truckNumber || "N/A"}</TableCell>
                  <TableCell>{pod.jobId?.jobType || "-"}</TableCell>
                  <TableCell>{pod.jobId?.status || "-"}</TableCell>
                  <TableCell>{pod.driverId?.name || "Unknown"}</TableCell>
                  <TableCell>
                    {pod.uploadedAt ? new Date(pod.uploadedAt).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => handleDownload(pod.jobId?._id, pod.jobId?.title || "pod")}
                      sx={{ mr: 1 }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => handleDelete(pod._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default PodsList;
