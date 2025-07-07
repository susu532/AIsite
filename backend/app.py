
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import os
import torch
from diffusers import StableDiffusionPipeline
from PIL import Image
import uuid

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv("SECRET_KEY", "dev")

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# --- Stable Diffusion Setup ---
MODEL_ID = os.getenv("SD_MODEL_ID", "runwayml/stable-diffusion-v1-5")
sd_pipe = None
def get_sd_pipe():
    global sd_pipe
    if sd_pipe is None:
        sd_pipe = StableDiffusionPipeline.from_pretrained(MODEL_ID, torch_dtype=torch.float32)
        sd_pipe = sd_pipe.to("cpu")
    return sd_pipe

USERS = {"admin": "admin123", "test": "test123"}

@app.route('/')
def home():
    return "Hello, Flask backend is running!"

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if username in USERS and USERS[username] == password:
        session['user'] = username
        return jsonify({"success": True, "user": username})
    return jsonify({"success": False}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"success": True})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    if not OPENAI_API_KEY:
        return jsonify({'error': 'OpenAI API key not set'}), 500
    try:
        openai.api_key = OPENAI_API_KEY
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": message}]
        )
        reply = response.choices[0].message['content']
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.get_json()
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'Prompt requis'}), 400
    pipe = get_sd_pipe()
    image = pipe(prompt).images[0]
    filename = f"{uuid.uuid4().hex}.png"
    save_path = os.path.join("generated_images", filename)
    os.makedirs("generated_images", exist_ok=True)
    image.save(save_path)
    return jsonify({'image_url': f"/image/{filename}"})

@app.route('/image/<filename>')
def serve_image(filename):
    return send_from_directory("generated_images", filename)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
