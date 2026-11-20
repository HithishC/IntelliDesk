
from datasets import load_dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib
from pathlib import Path

# Load dataset
print("Loading dataset...")
dataset = load_dataset("tasksource/it-support-tickets")

X_train = dataset["train"]["text"]
y_train = dataset["train"]["label"]

X_test = dataset["test"]["text"]
y_test = dataset["test"]["label"]

# Build ML pipeline
print("Building TF-IDF + Logistic Regression model...")

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2),
        max_features=10000,
        sublinear_tf=True
    )),
    ("classifier", LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=42
    ))
])

# Train model
print("Training model...")
model.fit(X_train, y_train)

# Evaluate using separate test data
print("\nEvaluating model...")

predictions = model.predict(X_test)

print("Test Accuracy:", round(
    accuracy_score(y_test, predictions) * 100, 2
), "%")

print("\nClassification Report:")
print(classification_report(
    y_test,
    predictions,
    target_names=dataset["train"].features["label"].names,
    zero_division=0
))

# Save model
model_path = Path(__file__).parent / "saved_models"
model_path.mkdir(parents=True, exist_ok=True)

joblib.dump(model, model_path / "ticket_classifier.pkl")

print("\nModel saved successfully!")
print("Location:", model_path / "ticket_classifier.pkl")
