from app.firebase.firebase_admin import initialize_firebase
from app.services.incident_detector import find_similar_incidents

initialize_firebase()

tests = [
    ("Network", "College Wi-Fi is completely down and students cannot connect"),
    ("Database", "The college database server is unavailable"),
    ("Software", "The college portal is not loading"),
    ("Hardware", "The laptop screen is broken")
]

for category, complaint in tests:
    results = find_similar_incidents(
        complaint,
        category=category
    )

    print(f"\n{category}: {len(results)} matches")

    for result in results:
        print(
            f"  Ticket: {result['ticket_id']} | "
            f"Similarity: {result['similarity']} | "
            f"Incident: {result['incident_id']}"
        )
