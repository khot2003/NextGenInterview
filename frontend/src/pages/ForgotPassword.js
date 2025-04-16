import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/auth/forgot-password", { email });
      setMessage(response.data.message || "Check your email for reset instructions.");
    } catch (error) {
      setMessage(error.response?.data.detail || "Failed to send reset email.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md"
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md">
            Send Reset Link
          </button>
        </form>
        {message && <p className="text-center mt-3 text-green-600">{message}</p>}
        <p className="text-center mt-2">
          <Link to="/login" className="text-blue-500">Remembered your password? Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
