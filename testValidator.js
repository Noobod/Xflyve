app.get("/api/admin/stats", (req, res) => {
  res.json({
    status: "success",
    data: {
      totalJobs: 15,
      totalDrivers: 5,
      totalTrucks: 6,
      totalLogs: 3,
    },
  });
});
