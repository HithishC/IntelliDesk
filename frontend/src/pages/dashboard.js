
import { authenticatedRequest } from "../api/api.js";

import {
    logoutUser,
    monitorAuthState
} from "../firebase/auth.js";

const totalTickets = document.getElementById("totalTickets");
const openTickets = document.getElementById("openTickets");
const criticalTickets = document.getElementById("criticalTickets");
const resolutionRate = document.getElementById("resolutionRate");

const ticketTable = document.getElementById("ticketTable");
const systemMessage = document.getElementById("systemMessage");
const errorMessage = document.getElementById("errorMessage");
const logoutButton = document.getElementById("logoutButton");


// Load dashboard statistics
async function loadStatistics() {
    const stats = await authenticatedRequest("/dashboard/stats");

    totalTickets.textContent = stats.total_tickets ?? 0;
    openTickets.textContent = stats.open_tickets ?? 0;
    criticalTickets.textContent = stats.critical_tickets ?? 0;

    resolutionRate.textContent =
        `${stats.resolution_rate ?? 0}%`;

    return stats;
}


// Load tickets
async function loadTickets() {
    const response = await authenticatedRequest("/tickets/");

    const tickets = Array.isArray(response)
        ? response
        : response.tickets || [];

    ticketTable.innerHTML = "";

    if (tickets.length === 0) {
        ticketTable.innerHTML =
            '<tr><td colspan="4">No tickets found.</td></tr>';
        return tickets;
    }

    tickets.slice(0, 10).forEach(ticket => {
        const row = document.createElement("tr");

        const analysis = ticket.ai_analysis || {};

        const values = [
            ticket.ticket_id || ticket.id || "N/A",
            analysis.category || "Other",
            analysis.priority || "N/A",
            ticket.status || "Open"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        ticketTable.appendChild(row);
    });

    return tickets;
}


// Load incident information
async function loadIncidents() {
    const response = await authenticatedRequest(
        "/incidents/dashboard"
    );

    return response;
}


// Update System Overview
function updateSystemOverview(stats, tickets, incidents) {

    const aiCompleted = tickets.filter(
        ticket => ticket.ai_status === "completed"
    ).length;

    const aiPending = tickets.filter(
        ticket => ticket.ai_status === "pending"
    ).length;

    const incidentCount =
        incidents.total_incidents ??
        incidents.total ??
        (incidents.incidents?.length ?? 0);

    systemMessage.innerHTML = `
        <strong>Backend:</strong> Connected<br><br>

        <strong>AI Provider:</strong> Ollama (Qwen 2.5 3B)<br><br>

        <strong>AI Analysis Completed:</strong>
        ${aiCompleted}<br><br>

        <strong>AI Analysis Pending:</strong>
        ${aiPending}<br><br>

        <strong>Total Incidents:</strong>
        ${incidentCount}<br><br>

        <strong>Total Tickets:</strong>
        ${stats.total_tickets ?? 0}<br><br>

        <strong>System Status:</strong> Operational
    `;
}


// Initialize dashboard
async function initializeDashboard() {

    systemMessage.textContent =
        "Loading system information...";

    errorMessage.textContent = "";

    try {

        const [stats, tickets, incidents] = await Promise.all([
            loadStatistics(),
            loadTickets(),
            loadIncidents()
        ]);

        updateSystemOverview(stats, tickets, incidents);

    } catch (error) {

        console.error("Dashboard loading error:", error);

        systemMessage.textContent =
            "Some system information could not be loaded.";

        errorMessage.textContent =
            "Dashboard error: " + error.message;
    }
}


// Firebase authentication
monitorAuthState(async (user) => {

    if (!user) {
        window.location.replace("/login.html");
        return;
    }

    console.log("Authenticated user:", user.email);

    await initializeDashboard();
});


// Logout
logoutButton.addEventListener("click", async () => {

    try {
        await logoutUser();
        window.location.replace("/login.html");

    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    }
});
