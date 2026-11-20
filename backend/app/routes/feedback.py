
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.firebase.firestore_service import (
    create_document,
    get_document,
    get_all_documents
)

from app.firebase.auth_service import get_current_user

router = APIRouter(
    prefix="/feedback",
    tags=["Feedback"]
)


class FeedbackRequest(BaseModel):
    ticket_id: str
    resolved: bool
    comments: str = ""
    solution_id: int | None = None


@router.post("/")
def submit_feedback(
    request: FeedbackRequest,
    current_user: dict = Depends(get_current_user)
):

    # 1. Verify ticket exists
    ticket = get_document("tickets", request.ticket_id)

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    # 2. Allow feedback only for resolved tickets
    if ticket.get("status") != "Resolved":
        raise HTTPException(
            status_code=400,
            detail="Feedback can only be submitted for resolved tickets"
        )

    # 3. Prevent duplicate feedback
    all_feedback = get_all_documents("feedback")

    existing_feedback = [
        item for item in all_feedback
        if item.get("ticket_id") == request.ticket_id
    ]

    if existing_feedback:
        raise HTTPException(
            status_code=409,
            detail="Feedback has already been submitted for this ticket"
        )

    # 4. Validate recommended solution
    analysis = ticket.get("ai_analysis", {})

    if request.solution_id is not None:

        recommendations = analysis.get(
            "recommended_solutions", []
        )

        valid_ids = [
            item.get("solution_id")
            for item in recommendations
        ]

        if request.solution_id not in valid_ids:
            raise HTTPException(
                status_code=400,
                detail="Solution ID is not recommended for this ticket"
            )

    # 5. Prepare feedback
    feedback_data = {
        "ticket_id": request.ticket_id,
        "solution_id": request.solution_id,
        "resolved": request.resolved,
        "comments": request.comments,
        "created_by": current_user.get("uid"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    # 6. Save feedback
    try:
        feedback_id = create_document(
            "feedback",
            feedback_data
        )

    except Exception as error:
        print(f"Feedback save error: {error}")

        raise HTTPException(
            status_code=500,
            detail="Could not save feedback"
        ) from error

    return {
        "message": "Feedback submitted successfully",
        "feedback_id": feedback_id,
        "ticket_id": request.ticket_id,
        "solution_id": request.solution_id,
        "resolved": request.resolved
    }


@router.get("/")
def get_all_feedback(
    current_user: dict = Depends(get_current_user)
):

    feedback_list = get_all_documents("feedback")

    feedback_list.sort(
        key=lambda item: item.get("created_at", ""),
        reverse=True
    )

    return {
        "total_feedback": len(feedback_list),
        "feedback": feedback_list
    }


# Keep this route ABOVE /{ticket_id}
@router.get("/effectiveness")
def get_solution_effectiveness(
    current_user: dict = Depends(get_current_user)
):

    feedback_list = get_all_documents("feedback")

    solution_stats = {}

    for item in feedback_list:

        solution_id = item.get("solution_id")

        if solution_id is None:
            continue

        if solution_id not in solution_stats:
            solution_stats[solution_id] = {
                "total_feedback": 0,
                "resolved": 0,
                "not_resolved": 0
            }

        solution_stats[solution_id]["total_feedback"] += 1

        if item.get("resolved") is True:
            solution_stats[solution_id]["resolved"] += 1
        else:
            solution_stats[solution_id]["not_resolved"] += 1

    results = []

    for solution_id, stats in solution_stats.items():

        total = stats["total_feedback"]

        success_rate = round(
            (stats["resolved"] / total) * 100, 2
        )

        results.append({
            "solution_id": solution_id,
            **stats,
            "success_rate": success_rate
        })

    results.sort(
        key=lambda item: item["success_rate"],
        reverse=True
    )

    return {
        "total_solutions_evaluated": len(results),
        "solution_effectiveness": results
    }


# Keep this dynamic route LAST
@router.get("/{ticket_id}")
def get_ticket_feedback(
    ticket_id: str,
    current_user: dict = Depends(get_current_user)
):

    ticket = get_document("tickets", ticket_id)

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    all_feedback = get_all_documents("feedback")

    ticket_feedback = [
        item for item in all_feedback
        if item.get("ticket_id") == ticket_id
    ]

    return {
        "ticket_id": ticket_id,
        "total_feedback": len(ticket_feedback),
        "feedback": ticket_feedback
    }
