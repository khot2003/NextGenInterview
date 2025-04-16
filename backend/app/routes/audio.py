from fastapi import APIRouter, UploadFile, File
from app.utils.audio_processing import convert_speech_to_text

router = APIRouter()

@router.post("/process_audio/")
async def process_audio(audio: UploadFile = File(...)):
    text_result = convert_speech_to_text(audio)
    return {"transcribed_text": text_result}
