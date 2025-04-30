from flask import Flask, request, jsonify
import json
from localmain import main
from flask_cors import CORS

app = Flask(__name__)

CORS(app)
@app.route('/api/chat', methods=['POST'])
def chat():
    event = request.get_json()
    print(event)
    if not event or 'user_prompt' not in event:
        return jsonify({"error": "user_prompt is required"}), 400
    
    # Simulate the main function from localmain.py
    response = main(event)
    
    return response

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)