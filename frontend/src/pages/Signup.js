import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/authService";
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa"; 
import signupImage from "./gemini5.jpeg"; 

const Signup = () => {
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let newErrors = {};

    if (!formData.username.trim()) newErrors.username = "Full Name is required.";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}/.test(formData.password)) {
      newErrors.password = "Password must have 8+ characters, uppercase, lowercase, number & special character.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error while typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const response = await signup(formData);
    setLoading(false);

    if (response.error) {
      setMessage(response.error);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Side - Signup Image */}
      <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-200">
        <img src={signupImage} alt="Signup" className="w-full h-full object-cover" />
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-[450px] p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <FaUserPlus /> Create an Account
          </h2>

          {/* Display error message when signup fails */}
          {message && <p className="text-red-500 text-center mb-4">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div className="flex items-center border rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500">
              <FaUser className="text-gray-500 mr-3" />
              <input
                name="username"
                type="text"
                placeholder="Full Name"
                value={formData.username}
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

            {/* Email Field */}
            <div className="flex items-center border rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500">
              <FaEnvelope className="text-gray-500 mr-3" />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full outline-none"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            {/* Password Field with Eye Icon */}
            <div className="flex items-center border rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500 relative">
              <FaLock className="text-gray-500 mr-3" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full outline-none"
              />
              {/* Toggle Password Visibility */}
              <span
                className="absolute right-4 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white p-4 rounded-md transition duration-300 flex items-center justify-center gap-2 
                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
              `}
            >
              <FaUserPlus /> {loading ? "Signing up..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
