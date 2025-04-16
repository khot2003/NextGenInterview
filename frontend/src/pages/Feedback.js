import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';

const Feedback = () => {
  const { interviewId } = useParams();
  const [feedbackData, setFeedbackData] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionText, setQuestionText] = useState(""); // Store question text here
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null); // Track the expanded section

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const userResponse = await getCurrentUser();
        const userId = userResponse.user_id;

        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/feedback/feedback/${interviewId}?user_id=${userId}`
        );
        setFeedbackData(response.data.feedback);
      } catch (err) {
        console.error(err);
        setError('Error fetching feedback data');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [interviewId]);

  const handleAttemptClick = (attemptNumber) => {
    const attempt = feedbackData.find(a => a.attempt_number === attemptNumber);
    setSelectedAttempt(attempt);
    setSelectedQuestion(null);
    setQuestionText(""); // Reset question text when a new attempt is selected
    setExpandedSection(null); // Reset the expanded section when a new attempt is selected
  };

  const handleQuestionClick = (questionIndex) => {
    const question = selectedAttempt.questions_feedback.find(q => q.question_index === questionIndex);
    setSelectedQuestion(question);
    
    // Fetch and set the corresponding question text
    const questionText = selectedAttempt.questions_feedback[questionIndex].question_text;
    setQuestionText(questionText);
    
    document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSectionClick = (section) => {
    // Toggle the clicked section
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return <div className="text-center mt-16 text-lg font-medium">⏳ Loading feedback...</div>;
  }

  if (error) {
    return <div className="text-center mt-16 text-red-600 font-semibold">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-10 bg-white rounded-2xl shadow-lg mt-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-gray-800 mb-8 text-center"
      >
        📝 Interview Feedback
      </motion.h1>

      {/* Attempt Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {feedbackData.length === 0 ? (
          <p className="text-gray-500">No feedback available.</p>
        ) : (
          feedbackData.map((attempt) => (
            <motion.div
              key={attempt.attempt_number}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border shadow transition cursor-pointer ${
                selectedAttempt?.attempt_number === attempt.attempt_number
                  ? 'bg-blue-100 border-blue-400'
                  : 'bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={() => handleAttemptClick(attempt.attempt_number)}
            >
              <h2 className="text-xl font-semibold text-blue-700">
                Attempt <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-sm ml-1">{attempt.attempt_number}</span>
              </h2>
              <p className="text-gray-600 mt-1">🧠 Questions: {attempt.questions_feedback.length}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Question Selection */}
      {selectedAttempt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📋 Questions in Attempt {selectedAttempt.attempt_number}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedAttempt.questions_feedback.map((question, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border shadow transition cursor-pointer ${
                  selectedQuestion?.question_index === question.question_index
                    ? 'bg-green-100 border-green-400'
                    : 'bg-green-50 hover:bg-green-100'
                }`}
                onClick={() => handleQuestionClick(question.question_index)}
              >
                <h3 className="text-lg font-semibold text-green-700">
                  Question {question.question_index + 1}
                </h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Feedback Display */}
      <AnimatePresence>
        {selectedQuestion && (
          <motion.div
            id="feedback-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="mt-10 bg-gray-50 p-6 rounded-xl shadow border border-gray-300"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              📌 Feedback for Question {selectedQuestion.question_index + 1}
            </h3>
            <div className="space-y-6">
              {/* Clickable Question Text Section */}
              <motion.div
                onClick={() => handleSectionClick('questionText')}
                className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded cursor-pointer transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-sm text-gray-500 font-semibold uppercase mb-1">❓ Question</p>
                <p className="text-gray-800 text-base">{expandedSection === 'questionText' ? questionText : `${questionText.substring(0, 100)}...`}</p>
              </motion.div>

              {/* Clickable Your Answer Section */}
              <motion.div
                onClick={() => handleSectionClick('userAnswer')}
                className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded cursor-pointer transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-sm text-gray-500 font-semibold uppercase mb-1">🗣️ Your Answer</p>
                <p className="text-gray-800 text-base">{expandedSection === 'userAnswer' ? selectedQuestion.user_answer_text : `${selectedQuestion.user_answer_text.substring(0, 100)}...`}</p>
              </motion.div>

              {/* Clickable Overall Comments Section */}
              <motion.div
                onClick={() => handleSectionClick('overallComments')}
                className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded cursor-pointer transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-sm text-gray-500 font-semibold uppercase mb-1">💬 Overall Comments</p>
                <p className="text-gray-800 text-base">{expandedSection === 'overallComments' ? selectedQuestion.overall_comments : `${selectedQuestion.overall_comments.substring(0, 100)}...`}</p>
              </motion.div>

              {/* Clickable Sample Answer Section */}
              <motion.div
                onClick={() => handleSectionClick('sampleAnswer')}
                className="p-4 bg-green-50 border-l-4 border-green-400 rounded cursor-pointer transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-sm text-gray-500 font-semibold uppercase mb-1">📚 Sample Answer</p>
                <p className="text-gray-800 text-base">{expandedSection === 'sampleAnswer' ? selectedQuestion.sample_answer : `${selectedQuestion.sample_answer.substring(0, 100)}...`}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Feedback;
