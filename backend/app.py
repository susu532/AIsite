from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import os
import torch
from diffusers import StableDiffusionPipeline
import uuid

app = Flask(__name__)
CORS(app)

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Load Stable Diffusion model once
MODEL_ID = os.getenv('SD_MODEL_ID', 'runwayml/stable-diffusion-v1-5')
pipe = StableDiffusionPipeline.from_pretrained(MODEL_ID, torch_dtype=torch.float32)
pipe = pipe.to('cpu')

# Directory to save generated images
GENERATED_DIR = os.path.join(os.path.dirname(__file__), 'generated_images')
os.makedirs(GENERATED_DIR, exist_ok=True)

@app.route('/')
def home():
    return "Hello, Flask backend is running!"

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
    try:
        image = pipe(prompt).images[0]
        filename = f"{uuid.uuid4().hex}.png"
        filepath = os.path.join(GENERATED_DIR, filename)
        image.save(filepath)
        # Return a URL path (frontend should fetch from /image/<filename>)
        return jsonify({'image_url': f"/image/{filename}"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/image/<filename>')
def serve_image(filename):
    filepath = os.path.join(GENERATED_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'Image not found'}), 404
    return send_file(filepath, mimetype='image/png')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
