import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { FaUser, FaLock } from "react-icons/fa";  // Import icons
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";  // Import eye icons
import loginImage from "./gemini5.jpeg"; // Keep the existing image

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);  // State to toggle password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await login(formData.email, formData.password);
    if (response.error) {
      setMessage(response.error);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left side - Full-width Image */}
      <div className="w-1/2 hidden md:block">
        <img src={loginImage} alt="Login" className="h-full w-full object-cover" />
      </div>

      {/* Right side - Larger Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-[450px] p-10 bg-white rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back!</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input with Icon */}
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-500 text-lg" />
              <input 
                name="email" 
                type="email" 
                placeholder="Email" 
                onChange={handleChange} 
                className="w-full pl-12 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-lg"
              />
            </div>

            {/* Password Input with Icon & Eye Toggle */}
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-500 text-lg" />
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                onChange={handleChange} 
                className="w-full pl-12 pr-12 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-lg"
              />
              {/* Eye icon to toggle password visibility */}
              {showPassword ? (
                <AiFillEyeInvisible 
                  className="absolute right-4 top-4 text-gray-500 text-lg cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <AiFillEye 
                  className="absolute right-4 top-4 text-gray-500 text-lg cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-600 text-white p-4 rounded-lg text-lg font-semibold hover:bg-green-700 transform transition-transform hover:scale-105"
            >
              Login
            </button>
          </form>

          {message && <p className="text-red-500 text-sm text-center mt-3">{message}</p>}

          <p className="text-center mt-4">
            <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot Password?</Link>
          </p>
          <p className="text-center mt-3 text-gray-700 text-lg">
            New here? <Link to="/signup" className="text-blue-500 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
