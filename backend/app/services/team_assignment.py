TEAM_MAPPING = {
    "Hardware": "Hardware Support",
    "Software": "Software Support",
    "Network": "Network Operations",
    "Account / Access": "IT Access Team",
    "Database": "Database Administration",
    "Other": "General IT Support"
}


def assign_team(category: str) -> dict:
    team = TEAM_MAPPING.get(
        category,
        "General IT Support"
    )

    return {
        "assigned_team": team,
        "assignment_status": "Assigned"
    }