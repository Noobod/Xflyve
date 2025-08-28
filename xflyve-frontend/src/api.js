import axios from "axios";

// Create Axios instance with backend base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
});

// Attach JWT token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== AUTH ROUTES =====
export const login = (credentials) => api.post("/auth/login", credentials);
export const signup = (userData) => api.post("/auth/signup", userData);
export const getProfile = () => api.get("/auth/profile"); // Requires authMiddleware in backend

// ===== ADMIN ROUTES =====
export const getAllDrivers = () => api.get("/admin/drivers");
export const createDriver = (driverData) => api.post("/admin/drivers", driverData);
export const deleteDriver = (driverId) => api.delete(`/admin/drivers/${driverId}`);

export const exportDriversExcel = () =>
  api.get("/admin/export-drivers", { responseType: "blob" });

export const getSystemStats = () => api.get("/admin/stats");

export const downloadAllPods = () =>
  api.get("/admin/download-all-pods", { responseType: "blob" });

// Trucks
export const getAllTrucks = () => api.get("/admin/trucks");
export const createTruck = (truckData) => api.post("/admin/trucks", truckData);
export const updateTruck = (truckId, truckData) => api.put(`/admin/trucks/${truckId}`, truckData);
export const deleteTruck = (truckId) => api.delete(`/admin/trucks/${truckId}`);

// Jobs
export const getAllJobs = () => api.get("/jobs"); // Admin: get all jobs
export const getJobsByDriver = (driverId) => api.get(`/jobs/assigned/${driverId}`); // Driver/Admin: get jobs assigned to driver
// Removed invalid route: export const getMyJobs = () => api.get("/jobs/driver"); 
export const createJob = (jobData) => api.post("/jobs/create", jobData); // Admin: create job
export const updateJob = (jobId, jobData) => api.put(`/jobs/${jobId}`, jobData); // Admin: update job
export const deleteJob = (jobId) => api.delete(`/jobs/${jobId}`); // Admin: delete job
export const markJobComplete = (jobId) => api.put(`/jobs/complete/${jobId}`); // Driver: mark complete

// Truck Assignments
export const assignTruck = (assignmentData) =>
  api.post("/admin/truck-assignments", assignmentData);

export const getAllTruckAssignments = () =>
  api.get("/admin/truck-assignments");

export const getDriverTruckAssignment = (driverId, date) =>
  api.get(`/admin/truck-assignments/${driverId}/${date}`);

export const updateTruckAssignment = (assignmentId, updatedData) =>
  api.put(`/admin/truck-assignments/${assignmentId}`, updatedData);

export const deleteTruckAssignment = (assignmentId) =>
  api.delete(`/admin/truck-assignments/${assignmentId}`);

// Permanent Truck Assignment APIs
export const assignPermanentTruck = (assignmentData) =>
  api.post("/permanent-assign/assign", assignmentData);

export const getPermanentTruck = (driverId) =>
  api.get(`/permanent-assign/${driverId}`);

// ===== WORK LOGS (Driver) =====
export const createWorkLog = (workLogData) => api.post("/worklogs", workLogData);
export const updateWorkLog = (logId, updatedData) => api.put(`/worklogs/${logId}`, updatedData);
export const deleteWorkLog = (logId) => api.delete(`/worklogs/${logId}`);

// New: Get work logs for a driver (driver API)
export const getWorkLogsByDriver = (driverId) => api.get(`/worklogs/${driverId}`);
// Get work logs for currently logged-in driver (no param needed)
export const getWorkLogsByCurrentDriver = () => api.get("/worklogs/me");

// ===== WORK LOGS (Admin) =====
export const getAllWorkLogsAdmin = () => api.get("/worklogs/admin");
export const getWorkLogsByDriverAdmin = (driverId) =>
  api.get(`/worklogs/admin/${driverId}`);

// ===== WORK DIARY =====
// Upload Work Diary PDF (driver only, multipart/form-data)
export const uploadWorkDiary = (formData) =>
  api.post("/workDiaries/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Get work diary PDF by ID (admin or driver)
export const getWorkDiary = (workDiaryId) =>
  api.get(`/workDiaries/${workDiaryId}`, { responseType: "blob" });

// List all work diaries by driver (admin or driver)
export const listWorkDiariesByDriver = (driverId) =>
  api.get(`/workDiaries/driver/${driverId}`);

// Delete work diary by ID (you need to add this route if missing in backend)
export const deleteWorkDiary = (workDiaryId) =>
  api.delete(`/workDiaries/${workDiaryId}`);

// ===== POD ROUTES =====
// ===== POD ROUTES =====
export const fetchAllPods = () => api.get("/jobpods/admin/all");

export const uploadPod = (jobId, formData) => {
  // backend expects jobId inside formData
  formData.append("jobId", jobId);
  return api.post("/jobpods/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updatePod = (jobId, formData) => {
  formData.append("jobId", jobId);
  return api.put(`/jobpods/upload/${jobId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getPOD = (jobId) => {
  return api.get(`/jobpods/${jobId}`, { responseType: "blob" });
};

export const deletePod = (jobId) => {
  return api.delete(`/jobpods/${jobId}`);
};

export default api;
