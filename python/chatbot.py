from flask import Blueprint, request, jsonify
from groq import Groq
import os

chatbot_bp = Blueprint('chatbot', __name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)


@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json(force=True, silent=True) or {}
        user_message = data.get('message', '').strip()

        if not user_message:
            return jsonify({'error': 'Message required hai'}), 400

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are MediCare AI, a helpful health assistant. "
                        "Provide concise, polite health tips. "
                        "Always add a short disclaimer that you are an AI, "
                        "not a certified doctor."
                    )
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            model="llama-3.3-70b-versatile",
        )

        ai_response = chat_completion.choices[0].message.content

        return jsonify({'response': ai_response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500