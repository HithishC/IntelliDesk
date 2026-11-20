
from uuid import uuid4

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.firebase.firestore_service import (
    get_all_documents,
    update_document
)


# Minimum similarity required to consider complaints related.
SIMILARITY_THRESHOLD = 0.40
CATEGORY_THRESHOLDS = {
    "Network": 0.35,
    "Database": 0.35,
    "Software": 0.40,
    "Hardware": 0.40,
    "Account / Access": 0.40,
    "Other": 0.40
}

# Detect a broad category using keywords.
# The ML category takes priority when supplied.
def detect_incident_category(complaint: str) -> str:
    text = complaint.lower()

    category_keywords = {
        "Network": [
            "wifi", "wi-fi", "internet", "network",
            "router", "connectivity", "connection",
            "lan", "ethernet", "bandwidth"
        ],

        "Database": [
            "database", "sql", "query",
            "db server", "academic records",
            "database server"
        ],

        "Hardware": [
            "laptop", "keyboard", "mouse",
            "screen", "monitor", "printer",
            "battery", "hardware"
        ],

        "Software": [
            "portal", "website", "application",
            "app", "login", "software",
            "assignment", "college website"
        ],

        "Account / Access": [
            "password", "account", "authentication",
            "access denied", "locked account",
            "permission"
        ]
    }

    for category, keywords in category_keywords.items():
        if any(keyword in text for keyword in keywords):
            return category

    return "Other"


# Retrieve the category stored for an existing ticket.
def get_ticket_category(ticket: dict) -> str:
    analysis = ticket.get("ai_analysis")

    if not isinstance(analysis, dict):
        analysis = {}

    return (
        analysis.get("category")
        or ticket.get("category")
        or detect_incident_category(ticket["complaint"])
    )


# Find similar existing complaints.
def find_similar_incidents(
    complaint: str,
    threshold: float = SIMILARITY_THRESHOLD,
    category: str | None = None
) -> list:

    if not isinstance(complaint, str) or not complaint.strip():
        return []

    current_category = (
        category or detect_incident_category(complaint)
    )
    threshold = CATEGORY_THRESHOLDS.get(
    current_category,
    SIMILARITY_THRESHOLD
    )

    tickets = get_all_documents("tickets")

    # Compare only tickets belonging to the same category.
    valid_tickets = [
        ticket for ticket in tickets
        if isinstance(ticket.get("complaint"), str)
        and ticket.get("complaint").strip()
        and (ticket.get("ticket_id") or ticket.get("id"))
        and get_ticket_category(ticket) == current_category
    ]

    if not valid_tickets:
        return []

    complaints = [
        ticket["complaint"]
        for ticket in valid_tickets
    ]

    all_complaints = complaints + [complaint]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2)
    )

    try:
        vectors = vectorizer.fit_transform(all_complaints)

    except ValueError:
        # Handles complaints containing no usable vocabulary.
        return []

    similarities = cosine_similarity(
        vectors[-1],
        vectors[:-1]
    )[0]

    matches = []

    for index, score in enumerate(similarities):

        if score >= threshold:
            ticket = valid_tickets[index]

            matches.append({
                "ticket_id": (
                    ticket.get("ticket_id")
                    or ticket.get("id")
                ),
                "complaint": ticket["complaint"],
                "similarity": round(float(score), 3),
                "incident_id": ticket.get("incident_id")
            })

    # Highest similarity first.
    matches.sort(
        key=lambda item: item["similarity"],
        reverse=True
    )

    return matches


# Assign matching tickets to an incident group.
def assign_incident_group(matches: list) -> dict:

    if not matches:
        return {
            "incident_id": str(uuid4()),
            "related_ticket_count": 0
        }

    # Reuse the strongest match's incident ID.
    incident_id = (
        matches[0].get("incident_id")
        or str(uuid4())
    )

    assigned_ticket_ids = set()

    for match in matches:

        ticket_id = match.get("ticket_id")

        if not ticket_id or ticket_id in assigned_ticket_ids:
            continue

        existing_incident_id = match.get("incident_id")

        # Never merge two different existing incident groups.
        if (
            existing_incident_id
            and existing_incident_id != incident_id
        ):
            continue

        update_document(
            "tickets",
            ticket_id,
            {"incident_id": incident_id}
        )

        assigned_ticket_ids.add(ticket_id)

    return {
        "incident_id": incident_id,
        "related_ticket_count": len(assigned_ticket_ids)
    }
