from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import torch
from diffusers import StableDiffusionPipeline
import os
import uuid
from flask import send_from_directory
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask import session
import datetime
import openai
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Charger le modèle Stable Diffusion une seule fois
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float32)
pipe = pipe.to("cpu")  # Utilise "cuda" si tu as un GPU compatible

# Connexion à MongoDB (adapter l'URI selon ta config Compass)
mongo_client = MongoClient('mongodb://localhost:27017/books')
db = mongo_client['stageai']
users_col = db['users']
history_col = db['history']

app.secret_key = 'change_this_secret_key'
bcrypt = Bcrypt(app)

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

@app.route('/')
def home():
    return "Hello, Flask backend is running!"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if users_col.find_one({'username': username}):
        return jsonify({'error': 'Utilisateur déjà existant'}), 400
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    users_col.insert_one({'username': username, 'password': hashed_pw})
    return jsonify({'message': 'Inscription réussie'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = users_col.find_one({'username': username})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'error': 'Identifiants invalides'}), 401
    session['username'] = username
    return jsonify({'message': 'Connexion réussie'})

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({'message': 'Déconnexion réussie'})

# Historique lors de la génération de texte
@app.route('/generate-text', methods=['POST'])
def generate_text():
    if 'username' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    data = request.get_json()
    prompt = data.get('prompt', '')
    responses = [
        f"Voici un texte généré pour : {prompt}",
        f"Génération automatique basée sur : {prompt}",
        f"Contenu IA pour votre demande : {prompt}"
    ]
    generated = random.choice(responses)
    # Sauvegarde dans l'historique
    history_col.insert_one({
        'username': session['username'],
        'type': 'text',
        'prompt': prompt,
        'result': generated,
        'date': str(datetime.datetime.now())
    })
    return jsonify({'result': generated})

# Historique lors de la génération d'image
@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.get_json()
    prompt = data.get('prompt', '')
    # Generate image using local Stable Diffusion
    image = pipe(prompt).images[0]
    # Save image to local directory
    os.makedirs('generated_images', exist_ok=True)
    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join('generated_images', filename)
    image.save(filepath)
    image_url = f"/images/{filename}"
    # Save to history (username is now 'anonymous')
    history_col.insert_one({
        'username': session.get('username', 'anonymous'),
        'type': 'image',
        'prompt': prompt,
        'result': image_url,
        'date': str(datetime.datetime.now())
    })
    return jsonify({'image_url': image_url})

@app.route('/history', methods=['GET'])
def get_history():
    if 'username' not in session:
        return jsonify({'error': 'Non authentifié'}), 401
    user_history = list(history_col.find({'username': session['username']}))
    for h in user_history:
        h['_id'] = str(h['_id'])
    return jsonify({'history': user_history})

@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory("generated_images", filename)

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

if __name__ == '__main__':
    app.run(debug=True)
