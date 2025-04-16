from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SpeechAnalysis(BaseModel):
    clarity_score: float
    speech_speed_wpm: int
    pause_count: int
    hesitation_duration_seconds: float
    filler_word_count: int
    filler_words_list: List[str]
    pitch_variability: float
    tone_stability: float
    dominant_emotion: str
    confidence_score: float
    comments: str

class TextAnalysis(BaseModel):
    grammar_score: float
    relevance_score: float
    technical_depth_score: float
    structure_comments: str
    grammar_comments: str
    suggestions: List[str]

class QuestionFeedback(BaseModel):
    question_index: int
    user_answer_text: str
    timestamp: datetime
    answer_duration_seconds: float
    feedback: dict
    overall_comments: str
    sample_answer: str

class AttemptFeedback(BaseModel):
    attempt_number: int
    questions_feedback: List[QuestionFeedback]

class Feedback(BaseModel):
    interview_id: str
    user_id: str
    attempts: List[AttemptFeedback]


