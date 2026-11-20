
from app.services.incident_detector import (
    find_similar_incidents,
    assign_incident_group
)
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import (
    APIRouter,
    BackgroundTasks,
    HTTPException,
    Depends
)
from pydantic import BaseModel

from app.firebase.auth_service import get_current_user

from app.services.ai_analyzer import (
    analyze_complaint_local,
    analyze_complaint_with_gemini
)
from app.services.team_assignment import assign_team
from app.services.solution_matcher import find_solutions
from app.firebase.firestore_service import (
    create_document,
    update_document,
    get_document,
    get_all_documents
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])


class TicketRequest(BaseModel):
    complaint: str


class TicketStatusRequest(BaseModel):
    status: str


VALID_STATUSES = ["Open", "In Progress", "Resolved", "Closed"]


def process_gemini(ticket_id: str, complaint: str):
    try:
        result = analyze_complaint_with_gemini(complaint)

        ticket = get_document("tickets", ticket_id) or {}
        existing_analysis = ticket.get("ai_analysis", {})

        merged_analysis = {
            **existing_analysis,
            **result
        }

        existing_priority = existing_analysis.get("priority")

        if existing_priority == "Critical":
            merged_analysis["priority"] = "Critical"

        if result.get("source") == "ollama":
            update_document("tickets", ticket_id, {
                "ai_analysis": merged_analysis,
                "ai_status": "completed",
                "ai_provider": "ollama"
            })
        else:
            update_document("tickets", ticket_id, {
                "ai_analysis": merged_analysis,
                "ai_status": "unavailable",
                "ai_provider": "local_fallback"
            })

    except Exception as error:
        print(f"Background Ollama error: {error}")

        update_document("tickets", ticket_id, {
            "ai_status": "unavailable",
            "ai_provider": "local_fallback"
        })


# CREATE TICKET
@router.post("/")
def create_ticket(
    request: TicketRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    complaint = request.complaint.strip()

    if not complaint:
        raise HTTPException(
            status_code=400,
            detail="Complaint cannot be empty"
        )

    ticket_id = str(uuid4())

    local_result = analyze_complaint_local(complaint)

    recommended_solutions = find_solutions(complaint)
    local_result["recommended_solutions"] = recommended_solutions

    similar_incidents = find_similar_incidents(
    complaint,
    category=local_result.get("category")
    )
    incident_data = assign_incident_group(similar_incidents)

    local_result["similar_incidents"] = similar_incidents
    local_result.update(incident_data)

    team_data = assign_team(local_result["category"])
    local_result.update(team_data)

    ticket_data = {
        "ticket_id": ticket_id,
        "complaint": complaint,
        "incident_id": local_result["incident_id"],
        "ai_analysis": local_result,
        "gemini_status": "pending",
        "ai_status": "pending",
        "status": "Open",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("uid")
    }

    try:
        create_document("tickets", ticket_data, ticket_id)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Could not save ticket"
        ) from error

    background_tasks.add_task(
        process_gemini,
        ticket_id,
        complaint
    )

    return {
        "message": "Ticket created successfully",
        "ticket_id": ticket_id,
        "gemini_status": "pending",
        "analysis": local_result
    }


# GET ALL TICKETS
@router.get("/")
def get_tickets(
    current_user: dict = Depends(get_current_user)
):
    tickets = get_all_documents("tickets")

    tickets.sort(
        key=lambda ticket: ticket.get("created_at", ""),
        reverse=True
    )

    return {
        "total_tickets": len(tickets),
        "tickets": tickets
    }


# GET TICKET BY ID
@router.get("/{ticket_id}")
def get_ticket(
    ticket_id: str,
    current_user: dict = Depends(get_current_user)
):
    ticket = get_document("tickets", ticket_id)

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


# UPDATE TICKET STATUS
@router.patch("/{ticket_id}/status")
def update_ticket_status(
    ticket_id: str,
    request: TicketStatusRequest,
    current_user: dict = Depends(get_current_user)
):
    if request.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {VALID_STATUSES}"
        )

    ticket = get_document("tickets", ticket_id)

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    update_document("tickets", ticket_id, {
        "status": request.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })

    return {
        "message": "Ticket status updated successfully",
        "ticket_id": ticket_id,
        "status": request.status
    }
