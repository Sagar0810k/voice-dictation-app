from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Get API Key from .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env file!")

genai.configure(api_key=GEMINI_API_KEY)

def correct_grammar(text):
    """Send text to Gemini API for grammar correction."""
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(f"Correct grammar and enhance clarity: {text}")
        return response.text if response else text
    except Exception as e:
        return f"Error: {str(e)}"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/correct_text", methods=["POST"])
def correct_text():
    """API endpoint to correct grammar using Gemini API."""
    data = request.get_json()
    text = data.get("text", "")
    corrected_text = correct_grammar(text)
    return jsonify({"corrected_text": corrected_text})

if __name__ == "__main__":
    app.run(debug=True)
