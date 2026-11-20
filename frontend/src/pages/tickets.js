
import { authenticatedRequest } from "../api/api.js";
import { monitorAuthState } from "../firebase/auth.js";

const ticketTable = document.getElementById("ticketTable");
const ticketCount = document.getElementById("ticketCount");
const errorMessage = document.getElementById("errorMessage");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const refreshButton = document.getElementById("refreshButton");
const clearButton = document.getElementById("clearButton");

let allTickets = [];
let authenticated = false;

const VALID_STATUSES = [
    "Open",
    "In Progress",
    "Resolved",
    "Closed"
];

// Safely get nested AI analysis
function getAnalysis(ticket) {
    return ticket.ai_analysis || {};
}

// Get ticket priority
function getPriority(ticket) {
    const analysis = getAnalysis(ticket);

    return (
        analysis.priority ||
        analysis.urgency ||
        ticket.priority ||
        "Medium"
    );
}

// Get ticket category
function getCategory(ticket) {
    const analysis = getAnalysis(ticket);

    return analysis.category || ticket.category || "Other";
}

// Get assigned team
function getTeam(ticket) {
    const analysis = getAnalysis(ticket);

    return (
        analysis.assigned_team ||
        analysis.team ||
        ticket.assigned_team ||
        "Unassigned"
    );
}

// Create table cell safely
function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

// Add actions column
function prepareTable() {
    const headerRow = document.querySelector("thead tr");

    if (headerRow && !document.getElementById("actionsHeader")) {
        const header = document.createElement("th");
        header.id = "actionsHeader";
        header.textContent = "Actions";
        headerRow.appendChild(header);
    }
}

// Load all tickets
async function loadTickets() {
    errorMessage.textContent = "";
    ticketCount.textContent = "Loading tickets...";

    ticketTable.innerHTML =
        '<tr><td colspan="6">Loading tickets...</td></tr>';

    try {
        const response = await authenticatedRequest("/tickets/");

        allTickets = response.tickets || [];

        prepareTable();
        renderTickets();

    } catch (error) {
        console.error("Ticket loading error:", error);

        ticketCount.textContent = "Could not load tickets.";
        errorMessage.textContent = error.message;

        ticketTable.innerHTML =
            '<tr><td colspan="6">Failed to load tickets.</td></tr>';
    }
}

// Render filtered tickets
function renderTickets() {
    const search = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;

    const filteredTickets = allTickets.filter(ticket => {
        const category = getCategory(ticket);
        const priority = getPriority(ticket);
        const status = ticket.status || "Open";

        const matchesSearch =
            (ticket.ticket_id || "").toLowerCase().includes(search) ||
            (ticket.complaint || "").toLowerCase().includes(search) ||
            category.toLowerCase().includes(search);

        const matchesStatus =
            !selectedStatus || status === selectedStatus;

        const matchesPriority =
            !selectedPriority ||
            priority.toLowerCase() === selectedPriority.toLowerCase();

        return matchesSearch && matchesStatus && matchesPriority;
    });

    ticketCount.textContent =
        `Showing ${filteredTickets.length} of ${allTickets.length} tickets`;

    ticketTable.innerHTML = "";

    if (filteredTickets.length === 0) {
        ticketTable.innerHTML =
            '<tr><td colspan="6">No matching tickets found.</td></tr>';
        return;
    }

    filteredTickets.forEach(ticket => {
        const row = document.createElement("tr");

        const ticketId = ticket.ticket_id || "N/A";
        const category = getCategory(ticket);
        const priority = getPriority(ticket);
        const team = getTeam(ticket);
        const status = ticket.status || "Open";

        row.appendChild(createCell(ticketId));
        row.appendChild(createCell(category));

        const priorityCell = createCell(priority);
        priorityCell.className =
            "priority " + priority.toLowerCase();

        row.appendChild(priorityCell);
        row.appendChild(createCell(team));

        const statusCell = createCell(status);
        statusCell.className = "status";
        row.appendChild(statusCell);

        // Actions
        const actionCell = document.createElement("td");

        const statusSelect = document.createElement("select");

        VALID_STATUSES.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            statusSelect.appendChild(optionElement);
        });

        statusSelect.value = VALID_STATUSES.includes(status)
            ? status
            : "Open";

        const updateButton = document.createElement("button");

        updateButton.textContent = "Update";
        updateButton.className = "primary-btn";
        updateButton.style.marginTop = "8px";
        updateButton.style.padding = "9px 12px";

        updateButton.addEventListener("click", async () => {
            const newStatus = statusSelect.value;

            if (newStatus === status) {
                alert("Ticket already has this status.");
                return;
            }

            updateButton.disabled = true;
            updateButton.textContent = "Updating...";

            try {
                await authenticatedRequest(
                    `/tickets/${encodeURIComponent(ticketId)}/status`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );

                ticket.status = newStatus;

                alert("Ticket status updated successfully!");

                renderTickets();

            } catch (error) {
                console.error("Status update error:", error);
                alert("Could not update ticket: " + error.message);

                updateButton.disabled = false;
                updateButton.textContent = "Update";
            }
        });

        actionCell.appendChild(statusSelect);
        actionCell.appendChild(updateButton);

        row.appendChild(actionCell);

        ticketTable.appendChild(row);
    });
}

// Search
searchInput.addEventListener("input", renderTickets);

// Filters
statusFilter.addEventListener("change", renderTickets);
priorityFilter.addEventListener("change", renderTickets);

// Clear filters
clearButton.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "";
    priorityFilter.value = "";

    renderTickets();
});

// Refresh
refreshButton.addEventListener("click", () => {
    if (authenticated) {
        loadTickets();
    }
});

// Wait for Firebase authentication
monitorAuthState(async user => {
    if (!user) {
        window.location.replace("/login.html");
        return;
    }

    authenticated = true;

    console.log("Tickets page authenticated:", user.email);

    await loadTickets();
});
