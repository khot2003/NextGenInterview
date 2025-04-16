import speech_recognition as sr
import tempfile
import os

def convert_speech_to_text(audio_file):
    wav_path = None
    try:
        print("📥 Received audio file:", audio_file.filename)

        # Save uploaded file to a temporary .wav file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_wav:
            temp_wav.write(audio_file.file.read())
            wav_path = temp_wav.name
            print("📁 Temporary WAV file saved at:", wav_path)

        recognizer = sr.Recognizer()

        # Optional: adjust for ambient noise
        with sr.AudioFile(wav_path) as source:
            print("🎙️ Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            print("🎧 Recording audio from file...")
            audio_data = recognizer.record(source)

        # Transcribe using Google Web Speech API
        print("🧠 Transcribing audio...")
        text = recognizer.recognize_google(audio_data, language="en-US")
        print("✅ Transcribed Text:", text)

        return text

    except sr.UnknownValueError:
        print("❌ Could not understand the audio.")
        return "Speech was unclear. Try speaking more clearly."
    except sr.RequestError as e:
        print(f"🔌 Google Speech API error: {e}")
        return "Speech recognition service is unavailable."
    except Exception as e:
        print(f"⚠️ Unexpected error: {e}")
        return f"Error: {str(e)}"
    finally:
        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)
            print("🧹 Temporary file deleted:", wav_path)
