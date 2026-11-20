
from fastapi import APIRouter, Depends

from app.firebase.firestore_service import get_all_documents
from app.firebase.auth_service import get_current_user

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)


@router.get("/dashboard")
def get_incident_dashboard(
    current_user: dict = Depends(get_current_user)
):
    tickets = get_all_documents("tickets")

    incident_groups = {}

    for ticket in tickets:
        incident_id = ticket.get("incident_id")

        if not incident_id:
            continue

        if incident_id not in incident_groups:
            incident_groups[incident_id] = {
                "incident_id": incident_id,
                "tickets": [],
                "assigned_team": "Unassigned",
                "priority": "Low"
            }

        analysis = ticket.get("ai_analysis", {})

        incident_groups[incident_id]["tickets"].append({
            "ticket_id": ticket.get("ticket_id"),
            "complaint": ticket.get("complaint"),
            "status": ticket.get("status"),
            "priority": analysis.get("priority", "Low")
        })

        incident_groups[incident_id]["assigned_team"] = (
            analysis.get("assigned_team", "Unassigned")
        )

    incidents = list(incident_groups.values())

    for incident in incidents:
        priorities = [
            ticket["priority"]
            for ticket in incident["tickets"]
        ]

        priority_order = {
            "Low": 1,
            "Medium": 2,
            "High": 3,
            "Critical": 4
        }

        incident["priority"] = max(
            priorities,
            key=lambda p: priority_order.get(p, 1)
        )

        incident["affected_tickets"] = len(incident["tickets"])

    return {
        "total_incidents": len(incidents),
        "total_affected_tickets": sum(
            incident["affected_tickets"]
            for incident in incidents
        ),
        "critical_incidents": sum(
            1 for incident in incidents
            if incident["priority"] == "Critical"
        ),
        "incidents": incidents
    }
