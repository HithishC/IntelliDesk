from collections import defaultdict
from uuid import uuid4

from app.firebase.firebase_admin import initialize_firebase
from app.firebase.firestore_service import get_all_documents

initialize_firebase()

tickets = get_all_documents("tickets")
groups = defaultdict(list)

for ticket in tickets:
    analysis = ticket.get("ai_analysis")
    if not isinstance(analysis, dict):
        analysis = {}

    category = analysis.get("category") or "Other"
    groups[category].append(ticket)

print("\nINCIDENT MIGRATION PREVIEW")
print("=" * 60)

for category, category_tickets in groups.items():
    print("\nCategory:", category)
    print("Tickets:", len(category_tickets))

    existing_ids = {
        ticket.get("incident_id")
        for ticket in category_tickets
        if ticket.get("incident_id")
    }

    if category in ["Network", "Database"]:
        proposed_id = str(uuid4())
        action = "CREATE NEW INCIDENT GROUP"
    else:
        proposed_id = next(iter(existing_ids), str(uuid4()))
        action = "KEEP EXISTING INCIDENT GROUP"

    print("Action:", action)
    print("Proposed incident ID:", proposed_id)

    for ticket in category_tickets:
        print(
            " ",
            ticket.get("ticket_id") or ticket.get("id"),
            "| Current:",
            ticket.get("incident_id")
        )

print("\nPREVIEW ONLY - NO FIRESTORE RECORDS WERE CHANGED.")
