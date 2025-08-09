from flask import Flask, request     
from openai import OpenAI
from dotenv import load_dotenv
import os
from flask_cors import CORS


app = Flask(__name__)
allowed = [
  "https://your-domain.com",
  "https://www.your-domain.com",
  "http://localhost:5500"  # dev only
]
CORS(app, resources={ r"/chat": {"origins": allowed} })

@app.route('/chat', methods=['POST'])
def handle_request():
    data = request.get_json()
    question = data.get("question", "")
    question = question.strip()[0:200]
    response = ask_ai_api(question)

    return response


def load_text(file_name):
    curr_path = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(curr_path, "data", file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        data = f.read().strip()
    return data


def ask_ai_api(user_question):
    # load instructions and context
    instructions = load_text("instructions.txt")
    context = load_text("context.txt")


    # read .env and set it as a os variable
    load_dotenv()
    API_KEY = os.environ["GEMINI_API_KEY"]

    client = OpenAI(
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key=API_KEY
    )

    completion = client.chat.completions.create(
          model="gemini-2.0-flash-lite",
          messages = [
            {
                "role": "system",
                "content": [
                {
                  "type": "text",
                  "text": instructions
                },
              ]
            },

            {
                "role": "user",
                "content": [
                {
                  "type": "text",
                  "text": context
                },
              ]
            },

            {
                "role": "user",
                "content": [
                {
                  "type": "text",
                  "text": user_question
                },
              ]
            }

          ]
    )

    return completion.choices[0].message.content


if __name__ == "__main__":
    app.run(debug=True)