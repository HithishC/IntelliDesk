from app.firebase.firebase_admin import initialize_firebase
from app.services.incident_detector import find_similar_incidents

initialize_firebase()

network = find_similar_incidents(
    "College Wi-Fi is completely down and students cannot connect",
    category="Network"
)

database = find_similar_incidents(
    "The college database server is unavailable",
    category="Database"
)

print("Network matches:", len(network))
print("Network results:", network)

print("\nDatabase matches:", len(database))
print("Database results:", database)
