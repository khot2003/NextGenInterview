from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from app.services.nlp_service import process_resume, generate_questions,generate_answers_from_questions
from app.database import db
import datetime
import uuid
import json

router = APIRouter()

@router.post("/upload_resume")
async def upload_resume(
    user_id: str = Form(...),
    position: str = Form(...),
    job_description: str = Form(...),
    interview_type: str = Form(...),
    difficulty_level: str = Form(...),
    file: UploadFile = File(...)
):
    """Uploads a resume, parses it in memory, and generates interview questions."""
    
    # Ensure file is a valid format
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".docx")):
        raise HTTPException(status_code=400, detail="Only PDF or DOCX files are allowed.")

    # Read the file content in memory
    file_content = await file.read()

    # Parse resume in memory
    parsed_resume = process_resume(file_content, file.filename)

    # Generate questions
    questions = generate_questions(parsed_resume, interview_type, difficulty_level,position , job_description)

    answers = generate_answers_from_questions(questions, parsed_resume,interview_type, difficulty_level,position , job_description)
    # Generate unique interview ID
    interview_id = str(uuid.uuid4())

    # Store only parsed text in MongoDB
    interview_data = {
        "interview_id": interview_id,
        "user_id": user_id,
        "position": position,
        "job_description": job_description,
        "interview_type": interview_type,
        "difficulty_level": difficulty_level,
        "parsed_resume": parsed_resume,
        "questions": questions,
        "sample_answers": answers,
        "created_at": datetime.datetime.utcnow().isoformat()
    }

    db.interviews.insert_one(interview_data)

    
    print(interview_data)
    return {"message": "Resume processed successfully!", "interview_id": interview_id, "questions": questions, "sample_answers":answers}
@router.get("/get_interview_details/{interview_id}")
def get_interview_details(interview_id: str):
    interview = db.interviews.find_one({"interview_id": interview_id}, {"_id": 0})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview
@router.get("/get_next_question/{interview_id}")
def get_next_question(interview_id: str, index: int = Query(0, ge=0)):
    interview = db.interviews.find_one({"interview_id": interview_id})
    if not interview or "questions" not in interview:
        raise HTTPException(status_code=404, detail="Interview or questions not found")

    questions = interview["questions"]  # It's already a list
    if index >= len(questions):
        return {"message": "No more questions", "is_complete": True}

    return {
        "question_number": index + 1,
        "question": questions[index],
        "is_complete": False
    }
@router.get("/get_questions/{interview_id}")
def get_all_questions(interview_id: str):
    interview = db.interviews.find_one({"interview_id": interview_id}, {"_id": 0, "questions": 1})
    if not interview or "questions" not in interview:
        raise HTTPException(status_code=404, detail="Interview or questions not found")
    return {"questions": interview["questions"]}


@router.get("/user_interviews")
def get_user_interviews(user_id: str = Query(...)):
    interviews_cursor = db.interviews.find(
        {"user_id": user_id},
        {
            "_id": 0,
            "interview_id": 1,
            "position": 1,
            "interview_type": 1,
            "difficulty_level": 1,
            "created_at": 1
        }
    )
    interviews = list(interviews_cursor)
    if not interviews:
        raise HTTPException(status_code=404, detail="No interviews found for this user")
    return {"interviews": interviews}