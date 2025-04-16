import axios from "axios";

const API_URL = "http://localhost:8000/auth"; // Change this if backend URL is different

// Signup
export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData, { withCredentials: true });
    return response.data;
  } catch (error) {
    return { error: error.response?.data.detail || "Signup failed" };
  }
};

// Login
export const login = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      { email, password },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    return { error: error.response?.data.detail || "Login failed" };
  }
};

// Logout
export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error("Logout failed");
  }
};

// Get Current User
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
    return response.data;
  } catch (error) {
    return null;
  }
};
