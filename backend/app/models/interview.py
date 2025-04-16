from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class InterviewSession(BaseModel):
    interview_id: str
    user_id: str
    position: str
    job_description: str
    interview_type: str
    difficulty_level: str
    parsed_resume: Dict
    questions: Optional[Dict] = None
    sample_answers:Optional[Dict] = None
    created_at: datetime
