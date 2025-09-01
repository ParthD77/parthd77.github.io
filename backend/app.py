from flask import Flask, request, jsonify   
from openai import OpenAI
from dotenv import load_dotenv
import os, requests, resend
from flask_cors import CORS



app = Flask(__name__)
allowed = [
  "https://parthdhroovji.me",
  "https://www.parthdhroovji.me"
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


RECAPTCHA_SECRET = os.environ["RECAPTCHA_SECRET"]
RESEND_API_KEY   = os.environ["RESEND_API_KEY"]
resend.api_key   = RESEND_API_KEY


def verify_recaptcha(token, ip):
  resp = requests.post(
      "https://www.google.com/recaptcha/api/siteverify",
      data={"secret": RECAPTCHA_SECRET, "response": token, "remoteip": ip},
      timeout=10
  )
  resp.raise_for_status()
  return resp.json()


@app.route('/contact', methods=['POST'])
def contact():
  name    = (request.form.get("name") or "").strip()
  email   = (request.form.get("email") or "").strip()
  message = (request.form.get("message") or "").strip()
  token   = request.form.get("g-recaptcha-response") or ""

  # Captcha
  v = verify_recaptcha(token, request.headers.get("X-Forwarded-For") or request.remote_addr)
  if not v.get("success"):
    return jsonify({"ok": False, "error": "captcha_failed"}), 400

  # Send Email Via resend
  params: resend.Emails.SendParams = {
        "from": "Portfolio Contact <contact@parthdhroovji.me>", 
        "to": ["parthdhroovji1@gmail.com"],
        "subject": f"New message from {name}",
        "html": f"<p><b>From:</b> {name} &lt;{email}&gt;</p><p>{message}</p>",
        "reply_to": email
    }

  r = resend.emails.send(params)
  return jsonify(r)

if __name__ == "__main__":
    app.run(debug=True)