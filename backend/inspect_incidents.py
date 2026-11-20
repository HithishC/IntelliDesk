from app.firebase.firebase_admin import initialize_firebase
from app.firebase.firestore_service import get_all_documents
from app.services.incident_detector import get_ticket_category

initialize_firebase()

tickets = get_all_documents("tickets")

for ticket in tickets:
    print("-" * 70)
    print("Ticket:", ticket.get("ticket_id") or ticket.get("id"))
    print("Category:", get_ticket_category(ticket))
    print("Incident:", ticket.get("incident_id"))
    print("Complaint:", ticket.get("complaint"))
