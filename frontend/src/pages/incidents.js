
import { authenticatedRequest } from "../api/api.js";
import { monitorAuthState } from "../firebase/auth.js";

const totalIncidents = document.getElementById("totalIncidents");
const affectedTickets = document.getElementById("affectedTickets");
const criticalIncidents = document.getElementById("criticalIncidents");

const incidentCount = document.getElementById("incidentCount");
const incidentContainer = document.getElementById("incidentContainer");
const errorMessage = document.getElementById("errorMessage");
const refreshButton = document.getElementById("refreshButton");

let authenticated = false;

// Create a safe text element
function createElement(tag, className, content) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = content ?? "";
    return element;
}

// Load incident information
async function loadIncidents() {
    incidentContainer.textContent = "Loading incident information...";
    incidentCount.textContent = "Loading...";
    errorMessage.textContent = "";

    try {
        const data = await authenticatedRequest("/incidents/dashboard");

        // Update statistics
        totalIncidents.textContent = data.total_incidents ?? 0;
        affectedTickets.textContent = data.total_affected_tickets ?? 0;
        criticalIncidents.textContent = data.critical_incidents ?? 0;

        const incidents = data.incidents || [];

        incidentCount.textContent =
            `Showing ${incidents.length} detected incident groups`;

        incidentContainer.innerHTML = "";

        if (incidents.length === 0) {
            incidentContainer.appendChild(
                createElement(
                    "p",
                    "message",
                    "No incident groups detected yet."
                )
            );
            return;
        }

        incidents.forEach((incident, index) => {

            // Incident card
            const card = createElement("div", "card incident-card");

            // Header
            const header = createElement("div", "incident-header");

            const title = createElement(
                "h3",
                "",
                `Incident Group ${index + 1}`
            );

            const priority = createElement(
                "span",
                `priority ${incident.priority || "Low"}`,
                incident.priority || "Low"
            );

            header.appendChild(title);
            header.appendChild(priority);

            card.appendChild(header);

            // Incident ID
            card.appendChild(
                createElement(
                    "p",
                    "incident-details",
                    `Incident ID: ${incident.incident_id || "N/A"}`
                )
            );

            // Assigned team
            card.appendChild(
                createElement(
                    "p",
                    "incident-details",
                    `Assigned Team: ${incident.assigned_team || "Unassigned"}`
                )
            );

            // Affected tickets
            card.appendChild(
                createElement(
                    "p",
                    "incident-details",
                    `Affected Tickets: ${incident.affected_tickets ?? 0}`
                )
            );

            // Related tickets
            const ticketHeading = createElement(
                "h4",
                "",
                "Related Complaints"
            );

            card.appendChild(ticketHeading);

            (incident.tickets || []).forEach(ticket => {

                const ticketCard = createElement("div", "ticket");

                ticketCard.appendChild(
                    createElement(
                        "div",
                        "ticket-id",
                        `Ticket ID: ${ticket.ticket_id || "N/A"}`
                    )
                );

                ticketCard.appendChild(
                    createElement(
                        "p",
                        "",
                        ticket.complaint || "No complaint description"
                    )
                );

                ticketCard.appendChild(
                    createElement(
                        "p",
                        "incident-details",
                        `Priority: ${ticket.priority || "Low"} | Status: ${ticket.status || "Open"}`
                    )
                );

                card.appendChild(ticketCard);
            });

            incidentContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Incident loading error:", error);

        incidentCount.textContent = "Unable to load incidents.";

        errorMessage.textContent =
            "Error: " + error.message;

        incidentContainer.textContent =
            "Could not retrieve incident information.";
    }
}

// Refresh button
refreshButton.addEventListener("click", () => {
    if (authenticated) {
        loadIncidents();
    }
});

// Wait for Firebase authentication
monitorAuthState(async user => {

    if (!user) {
        window.location.replace("/login.html");
        return;
    }

    authenticated = true;

    console.log("Incident page authenticated:", user.email);

    await loadIncidents();
});
