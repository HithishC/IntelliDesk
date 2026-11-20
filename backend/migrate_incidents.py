from app.firebase.firebase_admin import initialize_firebase
from app.firebase.firestore_service import get_all_documents, update_document

SOFTWARE_ID = "7a6125fb-66ac-4d70-abef-44195e0ecae2"
HARDWARE_ID = "299dc979-f7c3-4cb8-9be1-a76c6cfb365e"
NETWORK_ID = "4bb262fb-e8d8-4847-a4c3-6cf9fae8f829"
DATABASE_ID = "f1b67f28-4551-47f5-81b2-f2e705cda85e"

CATEGORY_IDS = {
    "Software": SOFTWARE_ID,
    "Hardware": HARDWARE_ID,
    "Network": NETWORK_ID,
    "Database": DATABASE_ID
}

initialize_firebase()
tickets = get_all_documents("tickets")

if len(tickets) != 14:
    raise RuntimeError(
        f"Expected 14 tickets, found {len(tickets)}. No changes made."
    )

updates = []

for ticket in tickets:
    analysis = ticket.get("ai_analysis")
    if not isinstance(analysis, dict):
        analysis = {}

    category = analysis.get("category") or "Other"
    ticket_id = ticket.get("ticket_id") or ticket.get("id")

    if category not in CATEGORY_IDS:
        raise RuntimeError(
            f"Unexpected category {category} for ticket {ticket_id}. "
            "No changes made."
        )

    target_id = CATEGORY_IDS[category]

    if ticket.get("incident_id") != target_id:
        updates.append((ticket_id, category, target_id))

print("Tickets to update:", len(updates))

for ticket_id, category, target_id in updates:
    print(category, "|", ticket_id, "|", target_id)

print("\nStarting migration...")

for ticket_id, category, target_id in updates:
    update_document(
        "tickets",
        ticket_id,
        {"incident_id": target_id}
    )
    print("Updated:", ticket_id)

print("\nMigration completed.")
