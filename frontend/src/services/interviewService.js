// services/interviewService.js
import axios from "axios";
export const fetchUserInterviews = async (userId) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/interview/user_interviews?user_id=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch interviews");
    }
    const data = await response.json();
    return data.interviews;
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
};
