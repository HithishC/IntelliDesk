
from app.firebase.firebase_admin import get_firestore_db


def create_document(collection_name: str, data: dict, document_id: str = None):
    db = get_firestore_db()
    collection = db.collection(collection_name)

    if document_id:
        collection.document(document_id).set(data)
        return document_id

    document_ref = collection.add(data)[1]
    return document_ref.id


def get_document(collection_name: str, document_id: str):
    db = get_firestore_db()

    document = (
        db.collection(collection_name)
        .document(document_id)
        .get()
    )

    if not document.exists:
        return None

    return document.to_dict()


def get_all_documents(collection_name: str):
    db = get_firestore_db()
    documents = db.collection(collection_name).stream()

    return [
        {"id": document.id, **document.to_dict()}
        for document in documents
    ]


def update_document(collection_name: str, document_id: str, data: dict):
    db = get_firestore_db()

    db.collection(collection_name).document(document_id).update(data)


def delete_document(collection_name: str, document_id: str):
    db = get_firestore_db()

    db.collection(collection_name).document(document_id).delete()
