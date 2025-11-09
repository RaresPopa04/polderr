import base64
from io import BytesIO
import PyPDF2
import docx
from PIL import Image
import requests

from llm.LlmClient import LlmClient
import subprocess
import tempfile
import os
from config.PrivateKeys import _api_key

# Whisper is commented out - using Azerion API instead
# import whisper
# _WHISPER_MODEL = whisper.load_model("small")

class File:
    _img_extensions = (".png", ".jpg", ".jpeg", ".webp")
    _doc_extensions = (".txt", ".md", ".pdf", ".docx")
    _video_extensions = (".mp4", ".mov", ".avi")
    _audio_extensions = (".mp3", ".wav", ".m4a")

    def __init__(self, content: bytes, path: str):
        self.content = content
        self.path = path

    def read(self) -> str:
        lower = self.path.lower()

        if lower.endswith(self._img_extensions):
            return self._read_image()
        if lower.endswith(self._doc_extensions):
            return self._read_document()
        if lower.endswith(self._video_extensions):
            return self._read_video()
        if lower.endswith(self._audio_extensions):
            return self._read_audio()

        return "Unsupported file type"

    # ---------- documents ----------

    def _read_document(self) -> str:
        lower = self.path.lower()

        if lower.endswith((".txt", ".md")):
            return self.content.decode(errors="ignore")

        if lower.endswith(".pdf"):
            reader = PyPDF2.PdfReader(BytesIO(self.content))
            return "\n".join(page.extract_text() or "" for page in reader.pages)

        if lower.endswith(".docx"):
            doc = docx.Document(BytesIO(self.content))
            return "\n".join(p.text for p in doc.paragraphs)

        return "Unsupported document format"


    def _read_video(self) -> str:
        """
        Convert the video at self.path to mp3 with ffmpeg
        and reuse _read_audio() on the extracted audio.
        """
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                audio_path = os.path.join(tmpdir, "extracted_audio.mp3")

                # ffmpeg: video file on disk -> mp3 audio
                cmd = [
                    "ffmpeg",
                    "-y",
                    "-i", self.path,   # use the actual video path
                    "-vn",
                    "-acodec", "mp3",
                    audio_path,
                ]
                subprocess.run(
                    cmd,
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )

                # read the mp3 bytes
                with open(audio_path, "rb") as af:
                    audio_bytes = af.read()

                # reuse audio handler
                return File(audio_bytes, "temp_audio.mp3")._read_audio()

        except subprocess.CalledProcessError:
            return "ffmpeg failed to extract audio."
        except Exception as e:
            return f"Error during video processing: {e}"

    # def _read_audio(self) -> str:
    #     """
    #     Transcribe audio bytes (mp3/wav/m4a) to text using local Whisper.
    #     """
    #     with tempfile.NamedTemporaryFile(suffix=".audio") as tmp:
    #         tmp.write(self.content)
    #         tmp.flush()
    #
    #         # language can be auto-detected; add language="nl" for Dutch-only
    #         result = _WHISPER_MODEL.transcribe(tmp.name, fp16=False)
    #
    #         return result.get("text", "").strip()

    def _read_audio(self) -> str:
        """
        Transcribe audio bytes (mp3/wav/m4a) to text using Azerion's ElevenLabs-Scribe model.
        """
        headers = {
            "Authorization": f"Bearer {_api_key}",}

        files = {
            "file": ("audio.mp3", self.content, "audio/mpeg"),}

        data = {
            "model": "elevenlabs-scribe",
            "stream": "false",}

        try:
            response = requests.post(
                "https://api.azerion.ai/v1/audio/transcriptions",
                headers=headers,
                files=files,
                data=data,
            )

            if response.status_code == 200:
                result = response.json()
                return result.get("text", result.get("response", "No transcription found"))

            return f"Request failed with status code {response.status_code}: {response.text}"

        except Exception as e:
            return f"Request failed: {str(e)}"

    # ---------- image ----------

    def _read_image(self) -> str:
        llm_client = LlmClient("http://localhost:11434/api/generate")

        img = Image.open(BytesIO(self.content)).convert("RGB")
        buf = BytesIO()
        img.save(buf, format="PNG")
        img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

        prompt = {
            "model": "qwen3-vl:4b-instruct",
            "prompt": "Give me the text from this image and a short description.",
            "images": [img_b64],
            "stream": False
        }

        return llm_client.generate_response(prompt, "")