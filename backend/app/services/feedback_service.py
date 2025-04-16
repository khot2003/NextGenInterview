import os 
import numpy as np
import torch
import librosa
import torchaudio
import language_tool_python
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
import google.generativeai as genai
from faster_whisper import WhisperModel  # Import Whisper for transcription
from speechbrain.inference.interfaces import foreign_class
from app.models.interview import InterviewSession
from app.database import db
from typing import Optional
# === Configure Gemini ===
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))  # Use .env for security
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

# === Load NLP Models ===
grammar_tool = language_tool_python.LanguageTool('en-US')

# === Load Speechbrain Models ===
whisper_model = WhisperModel("base")  # Use "medium" or "large" if needed
classifier = foreign_class(
    source="speechbrain/emotion-recognition-wav2vec2-IEMOCAP",
    pymodule_file="custom_interface.py",
    classname="CustomEncoderWav2vec2Classifier"
)

def generate_feedback( audio_file: str, user_answer: str, interview_id: str, question_index: int,transcription_text: Optional[str] = None):
    try:
        # 1. Get Sample Answer from DB
        sample_answer = get_sample_answer(interview_id, question_index)

        # 2. Audio Analysis (speech speed, pauses, pitch, etc.)
        audio_features = analyze_audio_features(audio_file, transcription_text)

        # 3. Text Analysis
        text_features = analyze_text_features(transcription_text, user_answer, sample_answer)

        # 4. Combine Context for Gemini
        context_data = {
            "transcript": transcription_text,
            "audio_analysis": audio_features,
            "text_analysis": text_features,
        }

        msg = (
            f"Context = {context_data} \n"
            "The above context represents the data of an interviewee. "
            "Please write a 500-700 word review neatly for him/her, providing suggestions for areas of improvement based on the above context."
            "\nIMPORTANT : PLEASE FOLLOW THE BELOW RULES\n"
            "RULE 1: Write the review as if you are directly TALKING WITH HIM/HER."
            "RULE 2: Don't write anything extra, only write the review."
            "RULE 3: Dont include any main headings such as 'review', use side-headings for explaining."
            "RULE 4: If emotion analysis data is present then USE that for review also."
            "RULE 5: This review is for an interview given in an website where anyone take mock interviews,"
            "so write review based on that, but dont tell hi,thank u and all."
        )

        response = gemini_model.generate_content(msg)
        final_review = response.text

        return {
            "speech_analysis": audio_features,
            "text_analysis": text_features,
            "overall_review": final_review
        }

    except Exception as e:
        print(f"Error in feedback generation: {e}")
        return {"error": str(e)}

def get_sample_answer(interview_id: str, question_index: int):
    interview = db.interviews.find_one({"interview_id": interview_id})
    if interview and "sample_answers" in interview and len(interview["sample_answers"]) > question_index:
        return interview["sample_answers"][question_index]
    return "Sample answer not found."

def analyze_audio_features(audio_file: str, transcript: str):
    waveform, sr = librosa.load(audio_file, sr=16000)
    total_words = len(transcript.split())
    duration = librosa.get_duration(y=waveform, sr=sr)
    wpm = round((total_words / duration) * 60)

    segments, _ = torchaudio.load(audio_file)
    if segments.shape[0] > 1:
        segments = torch.mean(segments, dim=0, keepdim=True)

    # Pause calculation
    pauses = []
    try:
        timestamps = [i / sr for i in range(0, len(waveform), sr // 2)]
        pauses = [timestamps[i + 1] - timestamps[i] for i in range(len(timestamps) - 1)]
    except Exception:
        pauses = []

    pause_count = sum(1 for p in pauses if p > 0.5)
    hesitation_duration = sum(p for p in pauses if p > 0.5)

    # Pitch
    f0, _, _ = librosa.pyin(waveform, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    pitch_variability = np.nanstd(f0)
    tone_stability = 1 - (np.nanstd(np.diff(f0[np.isfinite(f0)])) if np.count_nonzero(np.isfinite(f0)) > 1 else 0)

    # Emotion Detection using SpeechBrain's Wav2Vec2 model
    emotion_prob, emotion_score, emotion_index, emotion_label = classifier.classify_file(audio_file)

    return {
        "clarity_score": round(1 - (pause_count) / (total_words + 1), 2),
        "speech_speed_wpm": wpm,
        "pause_count": pause_count,
        "hesitation_duration_seconds": round(hesitation_duration, 2),
        "pitch_variability": round(pitch_variability, 2) if not np.isnan(pitch_variability) else 0.0,
        "tone_stability": round(tone_stability, 2),
        "dominant_emotion": emotion_label,
        "comments": "Focus on reducing unnecessary pauses and maintaining a consistent tone."
    }

def analyze_text_features(transcript: str, user_answer: str, sample_answer: str):
    grammar_matches = grammar_tool.check(transcript)
    grammar_score = max(0, 1 - len(grammar_matches) / (len(transcript.split()) + 1))

    try:
        relevance_prompt = f"On a scale of 0 to 1, how relevant is the following answer to the expected one?\nUser Answer: {transcript}\nSample Answer: {sample_answer}"
        depth_prompt = f"On a scale of 0 to 1, rate the technical depth of this answer:\n{transcript}"

        relevance_response = gemini_model.generate_content(relevance_prompt)
        depth_response = gemini_model.generate_content(depth_prompt)

        relevance_score = float(relevance_response.text.strip().split()[0])
        technical_depth_score = float(depth_response.text.strip().split()[0])

    except Exception:
        relevance_score = 0.5
        technical_depth_score = 0.5

    return {
        "grammar_score": round(grammar_score, 2),
        "relevance_score": round(relevance_score, 2),
        "technical_depth_score": round(technical_depth_score, 2),
        "grammar_comments": [m.message for m in grammar_matches[:3]] if grammar_matches else ["No grammar issues detected."]
    }