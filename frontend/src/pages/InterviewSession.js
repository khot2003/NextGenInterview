import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "../services/authService";
const InterviewSession = () => {
  const { interviewId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/interview/get_interview_details/${interviewId}`);
        setSessionData(res.data);
      } catch (error) {
        console.error("Error loading interview session:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviewDetails();
  }, [interviewId]);

  const startInterview = async () => {
    let userId;
    
    try {
      // Fetch the current user details
      const userResponse = await getCurrentUser();
      userId = userResponse.user_id;  // Adjust according to the response structure from your API
    } catch (err) {
      console.error("Failed to get user:", err);
      alert("User authentication failed. Please login.");
      return; // Exit if user fetching fails
    }
  
    try {
      // Call the API to start the interview session
      const res = await axios.post("http://localhost:8000/feedback/start_interview_session/", 
        new URLSearchParams({
          interview_id: interviewId,
          user_id: userId
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
  
      console.log("Interview session started:", res.data);
      navigate(`/interview/${interviewId}/questions`);
    } catch (error) {
      console.error("Failed to start interview session:", error);
      alert("Error: Unable to start session. Please try again.");
    }
  };
  
  const goBack = () => {
    navigate("/dashboard");
  };

  if (loading) return <div className="p-6 text-lg text-gray-700">Loading session...</div>;
  if (!sessionData) return <div className="p-6 text-red-600 text-lg">❌ Failed to load session.</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-2xl mt-8 space-y-8 animate-fade-in">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{sessionData.position} Interview</h1>
        <p className="text-gray-600 text-lg">{sessionData.job_description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-5 rounded-xl border shadow">
          <h3 className="text-sm text-gray-500">Interview Type</h3>
          <p className="text-lg font-semibold text-blue-700">{sessionData.interview_type}</p>
        </div>
        <div className="bg-green-50 p-5 rounded-xl border shadow">
          <h3 className="text-sm text-gray-500">Difficulty Level</h3>
          <p className="text-lg font-semibold text-green-700">{sessionData.difficulty_level}</p>
        </div>
        <div className="bg-purple-50 p-5 rounded-xl border shadow">
          <h3 className="text-sm text-gray-500">Scheduled On</h3>
          <p className="text-lg font-semibold text-purple-700">
            {new Date(sessionData.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-3 text-yellow-800">📋 Instructions</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 text-md">
          <li>You will be asked a set of questions.</li>
          <li>You can answer via voice or by typing.</li>
          <li><strong>Note:</strong> Once you move to the next question, you cannot go back to change your previous answer.</li>
          <li>Each question has a time limit of 2 minutes.</li>
          <li>Once you're done, submit your answers.</li>
        </ul>
      </div>

      <div className="text-center">
        <button
          onClick={startInterview}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-transform hover:scale-105 shadow-lg"
        >
          🚀 Start Interview
        </button>
      </div>
    </div>
  );
};

export default InterviewSession;
