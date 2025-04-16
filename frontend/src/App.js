import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import NewSession from "./pages/NewSession";
import InterviewSession from "./pages/InterviewSession";
import InterviewList from './pages/InterviewList';
import Feedback from "./pages/Feedback";
import ConceptPage from "./pages/ConceptPage";
import PracticePage from "./pages/PracticePage";
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        
        {/* Protected Route for Dashboard */}
        <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/new-session" element={<NewSession />} />
        <Route path="/interview/:interviewId" element={<InterviewSession />} />
        <Route path="/interview/:interviewId/questions" element={<InterviewList />} />
          
        
        <Route path="/feedback/:interviewId" element={<Feedback />} />


        <Route path="/concepts" element={<ConceptPage />} />
        
        <Route path="/practice" element={<PracticePage />} />
        </Route>
        
        
      </Routes>
    </Router>
  );
};

export default App;
