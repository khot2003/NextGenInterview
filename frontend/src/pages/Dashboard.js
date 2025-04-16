import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { fetchUserInterviews } from "../services/interviewService";
import { PlusIcon, PlayIcon, ClipboardListIcon } from "lucide-react"; // ✅ Install lucide-react

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getCurrentUser();
      if (!userData) {
        navigate("/login");
      } else {
        setUser(userData);
        const interviewData = await fetchUserInterviews(userData.user_id);
        setInterviews(interviewData);
      }
    };
    fetchUserData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Welcome Back{user?.username ? `, ${user.username}` : ""} 👋
        </h2>

        <div
          className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-xl shadow-md text-center cursor-pointer flex items-center justify-center gap-2 transition-all duration-300"
          onClick={() => navigate("/new-session")}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="text-lg font-semibold">Start New Interview</span>
        </div>

        <h3 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          Previous Mock Interviews
        </h3>

        {interviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviews.map((interview) => (
              <div
                key={interview.interview_id}
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-blue-700">{interview.position}</h4>
                  <ClipboardListIcon className="w-5 h-5 text-gray-400" />
                </div>

                <p className="text-sm text-gray-500">
                  📅 Created: {new Date(interview.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">🎯 Type: {interview.interview_type}</p>
                <p className="text-sm text-gray-500">⚙️ Difficulty: {interview.difficulty_level}</p>

                <div className="flex justify-end gap-2 mt-4">
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
                                    onClick={() => navigate(`/feedback/${interview.interview_id}`)}>
                    Feedback
                  </button>
                  <button
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm"
                    onClick={() => navigate(`/interview/${interview.interview_id}`)}
                  >
                    <PlayIcon className="w-4 h-4" />
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            <img
              src="https://www.svgrepo.com/show/7485/empty-box.svg"
              alt="No data"
              className="mx-auto w-32 opacity-60 mb-4"
            />
            <p>No mock interviews yet. Start one now!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
