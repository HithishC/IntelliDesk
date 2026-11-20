
import re
import string


def clean_text(text: str) -> str:
    """
    Clean complaint text before AI/ML analysis.
    """

    if not text:
        return ""

    # Convert to lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)

    # Remove email addresses
    text = re.sub(r"\S+@\S+", " ", text)

    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)

    # Remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))

    # Remove extra spaces and line breaks
    text = re.sub(r"\s+", " ", text).strip()

    return text


def preprocess_complaint(text: str) -> dict:
    """
    Return original and cleaned complaint text.
    """

    cleaned = clean_text(text)

    return {
        "original_text": text,
        "cleaned_text": cleaned,
        "word_count": len(cleaned.split())
    }
