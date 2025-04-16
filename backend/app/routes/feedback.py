from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime
import tempfile
import shutil
from typing import Optional
from app.models.feedback import Feedback, AttemptFeedback
from app.services.feedback_service import generate_feedback
from app.database import db

router = APIRouter()

@router.post("/start_interview_session/")
async def start_interview_session(interview_id: str = Form(...), user_id: str = Form(...)):
    try:
        existing_feedback = db.feedback_collection.find_one({"interview_id": interview_id, "user_id": user_id})
        if existing_feedback:
            attempts = existing_feedback.get("attempts", [])
            attempt_number = len(attempts) + 1
        else:
            attempt_number = 1

        new_attempt = AttemptFeedback(
            attempt_number=attempt_number,
            questions_feedback=[]
        )

        if existing_feedback:
            db.feedback_collection.update_one(
                {"interview_id": interview_id, "user_id": user_id},
                {"$push": {"attempts": new_attempt.dict()}},  # convert to dict for MongoDB
                upsert=True
            )
        else:
            new_feedback = Feedback(
                interview_id=interview_id,
                user_id=user_id,
                attempts=[new_attempt]
            )
            db.feedback_collection.insert_one(new_feedback.dict())

        return {"message": "Interview session started successfully", "attempt_number": attempt_number}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview session: {str(e)}")


@router.post("/analyze-feedback/")
async def analyze_and_save_feedback(
    interview_id: str = Form(...),
    question_index: int = Form(...),
    answer_text: str = Form(...),
    user_id: str = Form(...),
    duration: float = Form(...),
    audio: UploadFile = File(None),
    transcription_text: Optional[str] = Form(None)
):
    try:
        # Save audio file temporarily if provided
        audio_path = None
        if audio:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
                shutil.copyfileobj(audio.file, temp_audio)
                audio_path = temp_audio.name

        feedback_data = generate_feedback(
            audio_file=audio_path,
            user_answer=answer_text,
            interview_id=interview_id,
            question_index=question_index,
            transcription_text=transcription_text
        )

        interview = db.interviews.find_one({"interview_id": interview_id})
        sample_answer = ""
        if interview and "sample_answers" in interview and len(interview["sample_answers"]) > question_index:
            sample_answer = interview["sample_answers"][question_index]

        question_feedback = {
            "question_index": question_index,
            "user_answer_text": answer_text,
            "timestamp": datetime.utcnow().isoformat(),
            "answer_duration_seconds": duration,
            "feedback": feedback_data,
            "overall_comments": feedback_data.get("overall_review"),
            "sample_answer": sample_answer
        }

        existing_feedback = db.feedback_collection.find_one({"interview_id": interview_id, "user_id": user_id})

        if existing_feedback:
            attempts = existing_feedback.get("attempts", [])

            if not attempts:
                raise HTTPException(status_code=400, detail="No active session found. Start interview session first.")

            latest_attempt = attempts[-1]
            attempt_number = latest_attempt.get("attempt_number", 1)

            question_attempted = any(
                q["question_index"] == question_index for q in latest_attempt.get("questions_feedback", [])
            )

            if not question_attempted:
                latest_attempt["questions_feedback"].append(question_feedback)
                db.feedback_collection.update_one(
                    {"interview_id": interview_id, "user_id": user_id},
                    {"$set": {"attempts": attempts}},
                    upsert=True
                )

        else:
            raise HTTPException(status_code=400, detail="No session found. Start interview session first.")

        return JSONResponse(content={"message": "Feedback analysis complete and saved."}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback processing failed: {str(e)}")
    
@router.get("/feedback/{interview_id}")
async def get_feedback(interview_id: str, user_id: str):
    try:
        # Fetch feedback
        existing_feedback = db.feedback_collection.find_one({
            "interview_id": interview_id,
            "user_id": user_id
        })

        if not existing_feedback:
            raise HTTPException(status_code=404, detail="No feedback found for the given interview and user")

        # Fetch interview questions
        interview = db.interviews.find_one({"interview_id": interview_id})
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")

        questions_list = interview.get("questions", [])

        # Prepare feedback data
        feedback_data = []
        for attempt in existing_feedback.get("attempts", []):
            attempt_feedback = {
                "attempt_number": attempt["attempt_number"],
                "questions_feedback": []
            }

            for q_feedback in attempt.get("questions_feedback", []):
                q_index = q_feedback["question_index"]
                question_text = questions_list[q_index] if q_index < len(questions_list) else "Question not found"

                attempt_feedback["questions_feedback"].append({
                    "question_index": q_index,
                    "question_text": question_text,
                    "user_answer_text": q_feedback["user_answer_text"],
                    "timestamp": q_feedback["timestamp"],
                    "answer_duration_seconds": q_feedback["answer_duration_seconds"],
                    "overall_comments": q_feedback["overall_comments"],
                    "sample_answer": q_feedback["sample_answer"],
                    "feedback": q_feedback.get("feedback", "No feedback provided")
                })

            feedback_data.append(attempt_feedback)

        return JSONResponse(content={"feedback": feedback_data}, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve feedback: {str(e)}")
