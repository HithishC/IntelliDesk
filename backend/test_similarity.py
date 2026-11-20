from app.firebase.firebase_admin import initialize_firebase
from app.services.incident_detector import find_similar_incidents

initialize_firebase()

tests = [
    ("Network", "College Wi-Fi is completely down and students cannot connect"),
    ("Database", "The college database server is unavailable")
]

for category, complaint in tests:
    results = find_similar_incidents(
        complaint,
        category=category,
        threshold=0.0
    )

    print(f"\n{category} similarity scores:")

    for result in results:
        print(
            f"Ticket: {result['ticket_id']} | "
            f"Score: {result['similarity']} | "
            f"Incident: {result['incident_id']}"
        )
