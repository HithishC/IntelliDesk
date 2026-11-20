
import json
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Locate Knowledge Base
BASE_DIR = Path(__file__).resolve().parents[3]

KNOWLEDGE_BASE_PATH = (
    BASE_DIR / "data" / "knowledge_base" / "solutions.json"
)


def load_knowledge_base():
    if not KNOWLEDGE_BASE_PATH.exists():
        return []

    with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def find_solutions(complaint: str, top_n: int = 3):
    knowledge_base = load_knowledge_base()

    if not complaint.strip() or not knowledge_base:
        return []

    problems = [
        item["problem"] for item in knowledge_base
    ]

    # Add new complaint to comparison
    all_texts = problems + [complaint]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2)
    )

    vectors = vectorizer.fit_transform(all_texts)

    similarities = cosine_similarity(
        vectors[-1],
        vectors[:-1]
    )[0]

    matches = []

    for index, score in enumerate(similarities):

        if score >= 0.15:
            item = knowledge_base[index]

            matches.append({
                "solution_id": item["id"],
                "problem": item["problem"],
                "category": item["category"],
                "solution": item["solution"],
                "similarity": round(float(score), 3)
            })

    matches.sort(
        key=lambda item: item["similarity"],
        reverse=True
    )

    return matches[:top_n]
