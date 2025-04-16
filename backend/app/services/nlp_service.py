import google.generativeai as genai
import pdfplumber
import docx
import json
import os
import re
from io import BytesIO
import time
# Set up Gemini API key
genai.configure(api_key="AIzaSyDIjvZGH15g1RzJirM7DAd6HoYh8crWoMc")

# Prompt for extracting structured details
prompt_extract_resume_details = """
Extract the following structured information from the resume file provided. If a specific section is missing, return it as 'Not Found'.
Ensure the output is well-structured, clear, and concise in JSON format.

1. **Basic Information**
   - Name
   - Contact Details (Phone, Email, Address, LinkedIn, Website/Portfolio, GitHub)
   - Profile Summary / Objective

2. **Professional Details**
   - Work Experience: For each entry, include:
     - Company Name
     - Job Title
     - Duration (Start Date - End Date)
     - Key Responsibilities / Achievements
   - Internships: Follow the same format as Work Experience

3. **Education**
   - Degree Name
   - Institution Name
   - Duration (Start Date - End Date)
   - Specialization

4. **Technical and Other Skills**
   - Technical Skills (Programming languages, tools, software)
   - Soft Skills (e.g., leadership, communication, problem-solving)

5. **Certifications and Courses**
   - Certifications
   - Online Courses / Trainings (Include course name, platform/institution, completion date)

6. **Projects / Portfolio**
   - Project Title
   - Description
   - Tools/Technologies Used

7. **Awards and Recognition**
   - Honors and Awards
   - Scholarships

8. **Extracurriculars**
   - Volunteer Experience
   - Leadership Roles
   - Clubs/Organizations/Societies

9. **Research and Publications**
   - Research Papers
   - Publications
   - Patents

If a section is missing, return it as 'Not Found'. Output should be in JSON format.
"""

def extract_text_from_pdf(file_bytes):
    """Extracts text from an in-memory PDF file."""
    text = ""
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text.strip()

def extract_text_from_docx(file_bytes):
    """Extracts text from an in-memory DOCX file."""
    doc = docx.Document(BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])

def process_resume(file_content, filename):
    """Parses an in-memory resume and extracts structured details."""
    
    # Extract text based on file type
    if filename.endswith(".pdf"):
        resume_text = extract_text_from_pdf(file_content)
    elif filename.endswith(".docx"):
        resume_text = extract_text_from_docx(file_content)
    else:
        return {"error": "Unsupported file format."}

    # Extract structured data using Gemini API
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([f"{prompt_extract_resume_details}\n\n{resume_text}"])

    if not response:
        return {"error": "No response received from the API."}

    # Ensure the response structure is properly navigated
    try:
        if hasattr(response, "candidates") and response.candidates:
            response_text = response.candidates[0].content.parts[0].text  # Extract response text

            # Remove markdown formatting if present
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()

            return json.loads(response_text)  # Convert string to JSON
        return {"error": "Invalid API response format."}

    except (json.JSONDecodeError, AttributeError, IndexError) as e:
        print("Parsing error:", e)
        return {"error": "Failed to parse API response."}

def filter_questions(questions_list):
    """Filters out non-question lines (ensuring each line starts with a number)."""
    return [q for q in questions_list if re.match(r"^\d+\.", q)]

def generate_questions(parsed_resume, interview_type, difficulty_level, position, job_description):
    """
    Generates questions based on interview type (Technical/Behavioral) and difficulty level, position, and job description.
    Also includes strict formatting rules for generating the questions.
    """
    questions = []
    technical_skills = parsed_resume.get("Technical and Other Skills", {}).get("Technical Skills", [])
    projects = parsed_resume.get("Projects / Portfolio", "Not Found")
    soft_skills = parsed_resume.get("Technical and Other Skills", {}).get("Soft Skills", [])
    extracurricular = parsed_resume.get("Extracurriculars", {})

    # Strict formatting rules
    rules = (
        "IMPORTANT: FOLLOW THE RULES STRICTLY\n"
        "RULE 1: Write only the questions\n"
        "RULE 2: Start each question with a number (e.g., 1., 2.)\n"
        "RULE 3: Do NOT include any title, heading, extra lines, or explanations\n"
        "RULE 4: Return ONLY the 5 questions, nothing else\n"
    )

    prompts = {
        "technical": {
            "basic": f"{rules}\nGenerate 5 basic level technical interview questions for a candidate with skills: {technical_skills}, project experience: {projects}, job description: {job_description}, and position: {position}. Focus on fundamental concepts.",
            "intermediate": f"{rules}\nGenerate 5 intermediate level technical interview questions for a candidate with skills: {technical_skills}, project experience: {projects}, job description: {job_description}, and position: {position}. Focus on practical applications and problem-solving.",
            "advanced": f"{rules}\nGenerate 5 advanced level technical interview questions for a candidate with skills: {technical_skills}, project experience: {projects}, job description: {job_description}, and position: {position}. Focus on real-world challenges and system design."
        },
        "behavioral": {
            "basic": f"{rules}\nGenerate 5 basic level behavioral interview questions based on projects: {projects}, extracurricular activities: {extracurricular}, soft skills: {soft_skills}, job description: {job_description}, and position: {position}. Focus on teamwork, communication, and adaptability.",
            "intermediate": f"{rules}\nGenerate 5 intermediate level behavioral interview questions based on projects: {projects}, extracurricular activities: {extracurricular}, soft skills: {soft_skills}, job description: {job_description}, and position: {position}. Focus on conflict resolution and problem-solving.",
            "advanced": f"{rules}\nGenerate 5 advanced level behavioral interview questions based on projects: {projects}, extracurricular activities: {extracurricular}, soft skills: {soft_skills}, job description: {job_description}, and position: {position}. Focus on leadership and complex decision-making."
        }
    }

    selected_prompt = prompts.get(interview_type, {}).get(difficulty_level.lower())
    print(f"Selected Prompt: {selected_prompt}")
    
    if selected_prompt:
        # Directly call the Gemini API to generate the questions
        model = genai.GenerativeModel("gemini-1.5-flash")
        try:
            response = model.generate_content([selected_prompt])
            if response and response.text:
                generated_questions = response.text.strip().split("\n")
                questions = filter_questions(generated_questions)
                print(f"Generated Questions: {questions}")
        except Exception as e:
            print(f"Error generating questions: {e}")

    return questions


def generate_answers_from_questions(questions, parsed_resume, interview_type, difficulty_level, position, job_description):
    """
    Generate direct answers for a list of interview questions based on resume context.
    Only returns a list of answers in the same order as the questions list.
    """
    
    technical_skills = parsed_resume.get("Technical and Other Skills", {}).get("Technical Skills", "Not Provided")
    projects = parsed_resume.get("Projects / Portfolio", "Not Provided")
    soft_skills = parsed_resume.get("Technical and Other Skills", {}).get("Soft Skills", "Not Provided")
    basic_info = parsed_resume.get("Basic Information", "Not Provided")
    extracurricular = parsed_resume.get("Extracurriculars", "Not Provided")

    sample_answers = []
    request_count = 0
    batch_start_time = time.time()
    model = genai.GenerativeModel("gemini-1.5-flash")

    for idx, question in enumerate(questions, start=1):
        request_count += 1
        if request_count == 15:
            elapsed_time = time.time() - batch_start_time
            if elapsed_time < 60:
                time.sleep(60 - elapsed_time)
            batch_start_time = time.time()
            request_count = 0

        if interview_type.lower() == "technical":
            context_info = f"Technical Skills: {technical_skills}. Project Experience: {projects}. Job Description: {job_description}. Position: {position}."
        else:
            context_info = f"Project Experience: {projects}. Soft Skills: {soft_skills}. Basic Info: {basic_info}. Extracurricular: {extracurricular}. Job Description: {job_description}. Position: {position}."

        prompt = (
            f"Candidate context:\n{context_info}\n\n"
            f"Question {idx} [{interview_type} - {difficulty_level}]: {question}\n\n"
            "Answer this as you would in a real interview. Be concise, provide examples where possible, "
            "and focus on your relevant skills and experiences. Show your enthusiasm for the position."
             "Provide your answer with key points and examples, with no extra commentary."
        )

        try:
            print(f"Generating answer for Q{idx}: {question}")
            response = model.generate_content(prompt)
            answer_text = response.text.strip() if response and response.text else "No answer generated."
        except Exception as e:
            answer_text = f"Error: {str(e)}"

        sample_answers.append(answer_text)

    return sample_answers
