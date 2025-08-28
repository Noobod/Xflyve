import React, { useEffect, useState } from "react";
import { getAllWorkLogsAdmin, getWorkLogsByDriverAdmin, getAllDrivers } from "../../api";
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
  Tooltip,
  IconButton,
  Snackbar,
  Paper,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const WorkLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [copySuccess, setCopySuccess] = useState(false);

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

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
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
          renderInput={(params) => (
            <TextField {...params} label="Filter by Driver" variant="outlined" />
          )}
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

      <Paper
        elevation={2}
        sx={{ width: "100%", maxWidth: 900, overflowX: "auto", bgcolor: "#fff" }}
      >
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
          <Table stickyHeader aria-label="work logs table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Driver Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Hours</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Kilometers</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Job IDs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => {
                const jobIdsStr = (log.jobIds || [])
                  .map((id) => (typeof id === "object" ? id._id : id))
                  .join(", ");
                return (
                  <TableRow key={log._id} hover>
                    <TableCell>
                      {log.driverId?.name || "Unknown"}{" "}
                      <Tooltip title="Copy driver name">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(log.driverId?.name || "")}
                          sx={{ cursor: "pointer" }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {log.date ? new Date(log.date).toLocaleDateString() : "-"}{" "}
                      <Tooltip title="Copy date">
                        <IconButton
                          size="small"
                          onClick={() =>
                            copyToClipboard(
                              log.date ? new Date(log.date).toLocaleDateString() : ""
                            )
                          }
                          sx={{ cursor: "pointer" }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {log.hours ?? "-"}{" "}
                      <Tooltip title="Copy hours">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(String(log.hours || ""))}
                          sx={{ cursor: "pointer" }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {log.kilometers ?? "-"}{" "}
                      <Tooltip title="Copy kilometers">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(String(log.kilometers || ""))}
                          sx={{ cursor: "pointer" }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {log.notes || "-"}{" "}
                      {log.notes && (
                        <Tooltip title="Copy notes">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(log.notes)}
                            sx={{ cursor: "pointer" }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      {jobIdsStr || "-"}{" "}
                      {jobIdsStr && (
                        <Tooltip title="Copy job IDs">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(jobIdsStr)}
                            sx={{ cursor: "pointer" }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Snackbar
        open={copySuccess}
        autoHideDuration={1500}
        onClose={() => setCopySuccess(false)}
        message="Copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default WorkLogs;
