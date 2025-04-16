import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

const NewSession = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    position: "",
    job_description: "",
    interview_type: "",
    difficulty_level: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setFormData((prev) => ({ ...prev, user_id: user.user_id }));
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      const response = await axios.post("http://127.0.0.1:8000/interview/upload_resume/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Resume processed successfully!");
      navigate(`/interview/${response.data.interview_id}`);
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      alert("Error processing resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-6 transition-all">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-2xl animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Start a New Interview</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Position</label>
            <input
              type="text"
              name="position"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Job Description</label>
            <textarea
              name="job_description"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all min-h-[100px]"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Interview Type</label>
              <select
                name="interview_type"
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all"
              >
                <option value="">Select Type</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Difficulty Level</label>
              <select
                name="difficulty_level"
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all"
              >
                <option value="">Select Level</option>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Upload Resume (PDF/DOCX)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all"
            />
          </div>

          <div className="flex justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-center py-2.5 rounded-xl font-semibold transition duration-300 ${
                loading
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Processing..." : "Start Interview"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSession;
