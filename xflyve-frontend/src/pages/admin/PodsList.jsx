import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Paper,
} from "@mui/material";

import { getAllDrivers, listPodsByDriver, deletePod, getPod } from "../../api";

const AdminPODs = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await getAllDrivers();
        if (res.data.status === "success") setDrivers(res.data.data);
        else setError("Failed to load drivers");
      } catch (err) {
        setError(err.response?.data?.message || "Server error loading drivers");
      }
    };
    fetchDrivers();
  }, []);

  useEffect(() => {
    setError("");
    setSuccess("");
    if (!selectedDriver) return setPods([]);

    const fetchPods = async () => {
      setLoading(true);
      setError("");
      try {
        const items = await listPodsByDriver(selectedDriver);
        setPods(items);
      } catch (err) {
        setError(err.response?.data?.message || "Server error fetching PODs");
      } finally {
        setLoading(false);
      }
    };
    fetchPods();
  }, [selectedDriver]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this POD?")) return;
    try {
      await deletePod(id);
      setSuccess("POD deleted");
      setPods((prev) => prev.filter((d) => d._id !== id));
    } catch {
      setError("Failed to delete POD");
    }
  };

  const handleDownload = async (pod) => {
    try {
      const blob = await getPod(pod._id);
      const driverName =
        drivers.find((d) => d._id === pod.driverId)?.name || "Driver";
      const dateStr = new Date(pod.uploadDate).toISOString().slice(0, 10);
      const filename = `POD-${driverName.replace(/\s+/g, "_")}-${dateStr}.pdf`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Failed to download POD");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        POD Management (Admin)
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="driver-select-label">Select Driver</InputLabel>
        <Select
          labelId="driver-select-label"
          value={selectedDriver}
          label="Select Driver"
          onChange={(e) => setSelectedDriver(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {drivers.map((driver) => (
            <MenuItem key={driver._id} value={driver._id}>
              {driver.name} ({driver.email})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : pods.length === 0 ? (
        <Typography>No PODs found for selected driver.</Typography>
      ) : (
        <>
          {/* Table for larger screens */}
          <Box sx={{ display: { xs: "none", sm: "block" }, overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pods.map((pod) => (
                  <TableRow key={pod._id}>
                    <TableCell>
                      {new Date(pod.uploadDate || Date.now()).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {drivers.find((d) => d._id === pod.driverId)?.name || "-"}
                    </TableCell>
                    <TableCell>{pod.notes || "-"}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDownload(pod)}
                        >
                          Download
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(pod._id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Card layout for mobile */}
          <Stack spacing={2} sx={{ display: { xs: "block", sm: "none" } }}>
            {pods.map((pod) => (
              <Paper key={pod._id} sx={{ p: 2 }}>
                <Typography variant="subtitle1">
                  Upload Date: {new Date(pod.uploadDate || Date.now()).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Driver: {drivers.find((d) => d._id === pod.driverId)?.name || "-"}
                </Typography>
                <Typography variant="body2">Notes: {pod.notes || "-"}</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mt={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleDownload(pod)}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(pod._id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default AdminPODs;
