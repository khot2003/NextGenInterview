from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth,interview , feedback
from app.routes import audio
app = FastAPI(title="NextGen Interview Coach API", version="1.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # Adjust if needed http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(interview.router, prefix="/interview")
app.include_router(audio.router, prefix="/audio")
app.include_router(feedback.router, prefix="/feedback")

@app.get("/")
def root():
    return {"message": "API is running successfully 🚀"}
