from flask import Flask, request     

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def get_ai_response():
    data = request.get_json()
    question = data.get("question", "")

    

    return "Hello"

if __name__ == "__main__":
    app.run(debug=True)