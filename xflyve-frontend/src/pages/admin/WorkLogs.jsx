import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  Stack,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { getAllWorkLogsAdmin, getWorkLogsByDriverAdmin, getAllDrivers } from "../../api";

const WorkLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await getAllDrivers();
        if (res.data.status === "success") {
          setDrivers(res.data.data || []);
        } else {
          setError("Failed to fetch drivers");
        }
      } catch {
        setError("Server error fetching drivers");
      }
    };
    fetchDrivers();
  }, []);

  const fetchLogs = async (driverId) => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (driverId) {
        res = await getWorkLogsByDriverAdmin(driverId);
      } else {
        res = await getAllWorkLogsAdmin();
      }
      if (res.data.success) {
        setLogs(res.data.data);
      } else {
        setError(res.data.message || "Failed to fetch logs");
        setLogs([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error fetching logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDriverChange = (event, newValue) => {
    setSelectedDriver(newValue);
    fetchLogs(newValue ? newValue._id : null);
  };

  const clearFilter = () => {
    setSelectedDriver(null);
    fetchLogs();
  };

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, sm: 4 }, bgcolor: "#f5f5f5" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 4, color: "#333" }}
        align="center"
      >
        Work Logs (Admin View)
      </Typography>

      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 900,
          p: 3,
          mb: 5,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Autocomplete
          sx={{ flexGrow: 1, minWidth: 200 }}
          options={drivers}
          getOptionLabel={(option) => option.name || ""}
          value={selectedDriver}
          onChange={handleDriverChange}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          renderInput={(params) => <TextField {...params} label="Filter by Driver" variant="outlined" />}
          clearOnEscape
          size="medium"
          disableClearable={false}
          noOptionsText="No drivers found"
        />

        <Button
          variant="outlined"
          color="secondary"
          onClick={clearFilter}
          disabled={!selectedDriver}
          sx={{ minWidth: 130, height: 40, fontWeight: "bold" }}
        >
          Clear Filter
        </Button>
      </Paper>

      <Paper elevation={2} sx={{ width: "100%", maxWidth: 900, bgcolor: "#fff" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress size={50} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : logs.length === 0 ? (
          <Typography variant="h6" align="center" color="textSecondary" sx={{ p: 3 }}>
            No work logs found.
          </Typography>
        ) : (
          <>
            {/* Desktop Table */}
            <Box sx={{ display: { xs: "none", sm: "block" }, overflowX: "auto" }}>
              <Table stickyHeader aria-label="work logs table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Driver Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Hours</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Kilometers</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Local Start Time</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Local End Time</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Interstate Start KM</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Interstate End KM</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Deliveries Done</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell>{log.driverId?.name || "Unknown"}</TableCell>
                      <TableCell>{log.date ? new Date(log.date).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{log.hours ?? "-"}</TableCell>
                      <TableCell>{log.kilometers ?? "-"}</TableCell>
                      <TableCell>{log.localStartTime || "-"}</TableCell>
                      <TableCell>{log.localEndTime || "-"}</TableCell>
                      <TableCell>{log.interstateStartKm ?? "-"}</TableCell>
                      <TableCell>{log.interstateEndKm ?? "-"}</TableCell>
                      <TableCell>{log.deliveriesDone ?? "-"}</TableCell>
                      <TableCell>{log.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* Mobile Cards */}
            <Stack spacing={2} sx={{ display: { xs: "block", sm: "none" }, p: 2 }}>
              {logs.map((log) => (
                <Paper key={log._id} sx={{ p: 2 }}>
                  <Typography><b>Driver Name:</b> {log.driverId?.name || "Unknown"}</Typography>
                  <Typography><b>Date:</b> {log.date ? new Date(log.date).toLocaleDateString() : "-"}</Typography>
                  <Typography><b>Hours:</b> {log.hours ?? "-"}</Typography>
                  <Typography><b>Kilometers:</b> {log.kilometers ?? "-"}</Typography>
                  <Typography><b>Local Start:</b> {log.localStartTime || "-"}</Typography>
                  <Typography><b>Local End:</b> {log.localEndTime || "-"}</Typography>
                  <Typography><b>Interstate Start KM:</b> {log.interstateStartKm ?? "-"}</Typography>
                  <Typography><b>Interstate End KM:</b> {log.interstateEndKm ?? "-"}</Typography>
                  <Typography><b>Deliveries Done:</b> {log.deliveriesDone ?? "-"}</Typography>
                  <Typography><b>Notes:</b> {log.notes || "-"}</Typography>
                </Paper>
              ))}
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default WorkLogs;
