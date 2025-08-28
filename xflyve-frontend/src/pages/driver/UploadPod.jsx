import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadPod } from "../../api"; // make sure this path is correct

const UploadPod = () => {
  const { jobId } = useParams(); // get jobId from URL if you have it
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
    if (!jobId) {
      setMessage("Job ID missing. Cannot upload.");
      return;
    }

    const formData = new FormData();
    formData.append("podFile", file);   // name must match backend middleware
    formData.append("jobId", jobId);    // backend expects jobId in body

    setLoading(true);
    try {
      const res = await uploadPod(jobId, formData);
      console.log("Upload response:", res.data);
      setMessage("POD uploaded successfully!");
      setFile(null);

      // optionally navigate back to jobs page
      navigate("/driver/jobs");
    } catch (err) {
      console.error("Upload error:", err.response || err);
      setMessage(
        err.response?.data?.message || "Error uploading POD. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload POD</h2>

      <input type="file" onChange={handleFileChange} accept=".pdf" />
      <button
        onClick={handleUpload}
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && <p className="mt-2 text-red-600">{message}</p>}
    </div>
  );
};

export default UploadPod;
