import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import RecordRTC from "recordrtc";
import { getCurrentUser } from "../services/authService";
const InterviewList = () => {
  const { interviewId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(120);
  const intervalRef = useRef(null);
  const audioRef = useRef();
  const navigate = useNavigate();
  const [lockedQuestions, setLockedQuestions] = useState({});
  

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(lockedQuestions).length !== questions.length) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [lockedQuestions, questions]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/interview/get_questions/${interviewId}`);
        const fetchedQuestions = res.data.questions || [];
        setQuestions(fetchedQuestions);
        setAnswers(
          new Array(fetchedQuestions.length).fill().map(() => ({
            typed: "",
            transcribed: "",
            audioBlob: null,
            duration: 0,
          }))
        );
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();
  }, [interviewId]);

  useEffect(() => {
    if (recording && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    if (timer === 0 && recording) {
      stopRecording();
    }
    return () => clearInterval(intervalRef.current);
  }, [recording, timer]);

  useEffect(() => {
    if (answers.length > 0) {
      const current = answers[currentQuestion];
      setAudioURL(current?.audioBlob ? URL.createObjectURL(current.audioBlob) : null);
      setTimer(120);
      setRecording(false);
      clearInterval(intervalRef.current);
    }
  }, [currentQuestion, answers]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newRecorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
      });
      newRecorder.startRecording();
      setRecorder(newRecorder);
      setRecording(true);
      setTimer(120);
    } catch (err) {
      alert("Microphone permission denied.");
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        processAudio(blob);
        updateAnswer("audioBlob", blob);

        const audio = new Audio(url);
      audio.addEventListener("loadedmetadata", () => {
        const durationInSeconds = Math.round(audio.duration);
        updateAnswer("duration", durationInSeconds);
        console.log("Audio duration:", durationInSeconds, "seconds");
      });
      });
    }
    setRecording(false);
    clearInterval(intervalRef.current);
  };

  const resetRecording = () => {
    setAudioURL(null);
    setTimer(120);
    setRecording(false);
    clearInterval(intervalRef.current);
    updateAnswer("typed", "");
    updateAnswer("transcribed", "");
    updateAnswer("audioBlob", null);
  };

  const processAudio = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "answer.wav");

    try {
      setProcessingAudio(true);
      const response = await axios.post("http://127.0.0.1:8000/audio/process_audio/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const transcript = response.data.transcribed_text || "";
      updateAnswer("transcribed", transcript);

      const current = answers[currentQuestion];
      if (!current.typed.trim()) {
        updateAnswer("typed", transcript);
      }
    } catch (err) {
      console.error("Transcription error:", err);
      alert("Transcription failed.");
    } finally {
      setProcessingAudio(false);
    }
  };

  const updateAnswer = (type, value) => {
    setAnswers((prev) => {
      const updated = [...prev];
      const current = updated[currentQuestion];
      updated[currentQuestion] = {
        ...current,
        [type]: value,
      };
      return updated;
    });
  };
  const submitSingleAnswer = async (index) => {
    const { typed, transcribed, audioBlob,duration } = answers[index];
    const finalAnswer = typed.trim() || transcribed.trim();
    
    // Get the current user (this assumes getCurrentUser is working properly)
    let userId;
    try {
      const userResponse = await getCurrentUser();
      userId = userResponse.user_id;  // Adjust according to the response structure from your API
    } catch (err) {
     console.error("Failed to get user:", err);
     alert("User authentication failed. Please login.");
      return;
    }
  
    const formData = new FormData();
    formData.append("interview_id", interviewId);
    formData.append("question_index", index);
    formData.append("answer_text", finalAnswer);
    formData.append("duration", duration);
    formData.append("user_id", userId); // Add user ID to the form data

    if (audioBlob) {
      formData.append("audio", audioBlob, `answer${index}.wav`);
    }
    // Append transcription only if it's not empty
  if (transcribed && transcribed.trim() !== "") {
    formData.append("transcription_text", transcribed);
  }


    console.log("Submitting single answer with following data:");
    for (let [key, value] of formData.entries()) {
        if (value instanceof Blob) {
         console.log(`${key}: [Blob - ${value.name}, size: ${value.size} bytes]`);
    } else {
      console.log(`${key}: ${value}`);
    }
  }
  try {
    // Send POST request to the backend (make sure the endpoint is correct)
    const response = await axios.post("http://127.0.0.1:8000/feedback/analyze-feedback", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      //Authorization: `Bearer ${your_jwt_token_here}`  // Add this if using JWT tokens

      
    });
    
    console.log(`Answer for question ${index + 1} saved.`, response.data);
  } catch (err) {
    console.error(`Failed to save answer for question ${index + 1}:`, err);
    alert(`Failed to save answer for question ${index + 1}`);
  }
  };
  
//   const handleNextQuestion = async () => {
//     await submitSingleAnswer(currentQuestion); // ⬅️ send current answer
//     setLockedQuestions((prev) => ({
//       ...prev,
//       [currentQuestion]: true,
//     }));
//     setCurrentQuestion((prev) => prev + 1);
//   };
const handleNextQuestion = async () => {
    const currentIndex = currentQuestion;
  
    if (!lockedQuestions[currentIndex]) {
      await submitSingleAnswer(currentIndex);
      setLockedQuestions((prev) => ({
        ...prev,
        [currentIndex]: true,
      }));
    }
  
    setCurrentQuestion((prev) => prev + 1);
  };
  
  
  const handleSubmit = async () => {
    if (!lockedQuestions[currentQuestion]) {
    await submitSingleAnswer(currentQuestion);
  }
  navigate("/feedback");
  };

  const formatQuestion = (q) => q.replace(/\*\*/g, "").replace(/^Q\d+:\s*/, "").trim();

  if (!questions.length) {
    return <div className="p-6 text-gray-500">Loading questions...</div>;
  }

  const isLastQuestion = currentQuestion === questions.length - 1;
  const current = answers[currentQuestion] || {};
  const currentAnswered = current.typed.trim() !== "" || current.transcribed.trim() !== "";

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-center">🎤 Mock Interview</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`w-10 h-10 rounded-full text-sm font-bold border ${
              index === currentQuestion
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-blue-700">
          Q{currentQuestion + 1}: {formatQuestion(questions[currentQuestion])}
        </h2>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col gap-3">
            <button
              onClick={startRecording}
              disabled={recording || currentAnswered || processingAudio}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              🎤 Start
            </button>
            <button
              onClick={stopRecording}
              disabled={!recording}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              ⏹️ Stop
            </button>
            <button
              onClick={resetRecording}
              disabled={recording || lockedQuestions[currentQuestion]}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              🔁 Reset
            </button>
            {audioURL && (
              <button
                onClick={() => audioRef.current?.play()}
                disabled={recording}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                ▶️ Play
              </button>
            )}
            {recording && (
              <div className="text-red-600 text-center font-semibold">{timer}s</div>
            )}
          </div>

          <textarea
            value={current.typed}
            onChange={(e) => updateAnswer("typed", e.target.value)}
            disabled={recording || lockedQuestions[currentQuestion]}
            rows={6}
            className="w-full p-4 border rounded-xl text-gray-700 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
            placeholder="✍️ Type your answer here or use voice recording..."
          />
        </div>

        {audioURL && (
          <audio
            ref={audioRef}
            src={audioURL}
            controls
            className="mt-2 w-full"
            onError={() => alert("Playback error. Try re-recording.")}
          />
        )}

        {processingAudio && <p className="text-gray-400 italic">Transcribing your answer...</p>}

        {current.transcribed && (
          <div className="mt-4 bg-gray-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="text-md font-semibold text-blue-700 mb-2">📝 Transcription:</h4>
            <p className="text-gray-800 whitespace-pre-line">{current.transcribed}</p>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => navigate("interview/${interviewId}/questions")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            ← Back to Interview Page
          </button>

          {!isLastQuestion ? (
            <button
              onClick={handleNextQuestion}
              disabled={!currentAnswered}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
                currentAnswered ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!currentAnswered}

              className={`px-6 py-2 rounded-lg font-semibold text-white transition ${
                currentAnswered ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              ✅ Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewList;
