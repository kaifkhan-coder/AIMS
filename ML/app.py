from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import csv
import time

app = Flask(__name__)
CORS(app)  # allow backend requests

# 🔹 Load ML model
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

# ===============================
# 🔮 Predict Department
# ===============================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = data.get("description")

    if not text:
        return jsonify({"error": "Description required"}), 400

    X = vectorizer.transform([text])
    department = model.predict(X)[0]

    return jsonify({
        "department": department
    })


# ===============================
# 🧠 Add Training Data
# ===============================
@app.route("/add-training", methods=["POST"])
def add_training():
    data = request.json
    text = data.get("text")
    department = data.get("department")

    if not text or not department:
        return jsonify({"error": "Invalid data"}), 400

    with open("training_data.csv", "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([text, department])

    return jsonify({"message": "Training data added"})


# ===============================
# 🔁 Retrain Model
# ===============================
@app.route("/retrain", methods=["POST"])
def retrain():
    # simulate retraining
    time.sleep(3)

    # later: load csv → retrain → save model.pkl
    return jsonify({
        "message": "Model retrained successfully"
    })


# ===============================
# 🚀 Run Server
# ===============================
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
