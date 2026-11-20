
from fastapi import APIRouter, Depends

from app.firebase.firestore_service import get_all_documents
from app.firebase.auth_service import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    current_user: dict = Depends(get_current_user)
):
    tickets = get_all_documents("tickets")

    total_tickets = len(tickets)

    # Ticket status statistics
    status_counts = {
        "Open": 0,
        "In Progress": 0,
        "Resolved": 0,
        "Closed": 0
    }

    # Priority statistics
    priority_counts = {
        "Low": 0,
        "Medium": 0,
        "High": 0,
        "Critical": 0
    }

    # Category statistics
    category_counts = {}

    # AI processing statistics
    ai_completed = 0
    ai_pending = 0
    ai_unavailable = 0

    # Process ticket statistics
    for ticket in tickets:

        status = ticket.get("status", "Open")

        if status in status_counts:
            status_counts[status] += 1

        analysis = ticket.get("ai_analysis")

        if not isinstance(analysis, dict):
            analysis = {}

        priority = analysis.get("priority", "Low")

        if priority in priority_counts:
            priority_counts[priority] += 1

        category = analysis.get("category", "Other")

        category_counts[category] = (
            category_counts.get(category, 0) + 1
        )

        # Support both current and legacy AI status fields
        ai_status = ticket.get("ai_status")

        if not ai_status:
            ai_status = ticket.get(
                "gemini_status",
                "pending"
            )

        ai_status = str(ai_status).lower()

        if ai_status == "completed":
            ai_completed += 1

        elif ai_status == "pending":
            ai_pending += 1

        elif ai_status in ["unavailable", "not_used"]:
            ai_unavailable += 1

    # Resolution statistics
    resolved_tickets = (
        status_counts["Resolved"] +
        status_counts["Closed"]
    )

    resolution_rate = (
        round(
            (resolved_tickets / total_tickets) * 100,
            2
        )
        if total_tickets > 0 else 0
    )

    # Count distinct incident groups
    incident_ids = {
        ticket.get("incident_id")
        for ticket in tickets
        if ticket.get("incident_id")
    }

    return {
        "total_tickets": total_tickets,

        "open_tickets": status_counts["Open"],
        "in_progress_tickets": status_counts["In Progress"],
        "resolved_tickets": resolved_tickets,
        "closed_tickets": status_counts["Closed"],

        "critical_tickets": priority_counts["Critical"],

        "resolution_rate": resolution_rate,

        "tickets_by_status": status_counts,
        "tickets_by_priority": priority_counts,
        "tickets_by_category": category_counts,

        "ai_analysis_completed": ai_completed,
        "ai_analysis_pending": ai_pending,
        "ai_analysis_unavailable": ai_unavailable,

        "total_incidents": len(incident_ids)
    }
