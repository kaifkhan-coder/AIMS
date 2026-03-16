import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle

# Sample training data (you can expand later)
data = {
    "text": [
        "internet not working",
        "wifi connection lost",
        "router problem",

        "computer not starting",
        "keyboard not working",
        "printer issue",

        "salary not credited",
        "invoice mismatch",
        "payment issue",

        "software installation problem",
        "email not opening",
        "system slow"
    ],
    "department": [
        "Network", "Network", "Network",
        "Hardware", "Hardware", "Hardware",
        "Accounts", "Accounts", "Accounts",
        "IT", "IT", "IT"
    ]
}

df = pd.DataFrame(data)

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["text"])
y = df["department"]

model = MultinomialNB()
model.fit(X, y)

# Save model
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("✅ Model trained & saved")
