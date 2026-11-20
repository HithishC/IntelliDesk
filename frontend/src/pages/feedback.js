
import { authenticatedRequest } from "../api/api.js";
import { monitorAuthState } from "../firebase/auth.js";

// Dashboard elements
const totalFeedback = document.getElementById("totalFeedback");
const resolvedFeedback = document.getElementById("resolvedFeedback");
const unresolvedFeedback = document.getElementById("unresolvedFeedback");

const feedbackTable = document.getElementById("feedbackTable");
const effectivenessTable = document.getElementById("effectivenessTable");

const feedbackMessage = document.getElementById("feedbackMessage");
const effectivenessMessage = document.getElementById("effectivenessMessage");
const refreshButton = document.getElementById("refreshButton");

// Feedback form elements
const feedbackForm = document.getElementById("feedbackForm");
const ticketSelect = document.getElementById("ticketSelect");
const solutionSelect = document.getElementById("solutionSelect");
const resolvedSelect = document.getElementById("resolvedSelect");
const commentsInput = document.getElementById("commentsInput");
const submitFeedbackButton = document.getElementById("submitFeedbackButton");
const submissionMessage = document.getElementById("submissionMessage");

let authenticated = false;
let feedbackRecords = [];

// Safely create table cells
function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "N/A";
    return cell;
}

// Format dates
function formatDate(value) {
    if (!value) return "N/A";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleString();
}

// Load all feedback
async function loadFeedback() {
    feedbackMessage.textContent = "Loading feedback...";
    feedbackTable.innerHTML = "";

    try {
        const data = await authenticatedRequest("/feedback/");

        const feedback = data.feedback || [];
        feedbackRecords = feedback;

        const resolved = feedback.filter(item => item.resolved === true);
        const unresolved = feedback.filter(item => item.resolved === false);

        totalFeedback.textContent = data.total_feedback ?? feedback.length;
        resolvedFeedback.textContent = resolved.length;
        unresolvedFeedback.textContent = unresolved.length;

        feedbackMessage.textContent =
            `Showing ${feedback.length} feedback records`;

        if (feedback.length === 0) {
            feedbackTable.innerHTML =
                '<tr><td colspan="5">No feedback submitted yet.</td></tr>';
            return true;
        }

        feedback.forEach(item => {
            const row = document.createElement("tr");

            row.appendChild(createCell(item.ticket_id));
            row.appendChild(createCell(item.solution_id ?? "N/A"));

            const resultCell = createCell(
                item.resolved ? "Resolved" : "Not Resolved"
            );

            resultCell.className = item.resolved ? "success" : "failure";
            row.appendChild(resultCell);

            row.appendChild(createCell(item.comments || "No comments"));
            row.appendChild(createCell(formatDate(item.created_at)));

            feedbackTable.appendChild(row);
        });

        return true;

    } catch (error) {
        console.error("Feedback loading error:", error);

        feedbackMessage.textContent =
            "Could not load feedback: " + error.message;

        return false;
    }
}

// Load solution effectiveness
async function loadEffectiveness() {
    effectivenessMessage.textContent =
        "Loading solution effectiveness...";

    effectivenessTable.innerHTML = "";

    try {
        const data = await authenticatedRequest(
            "/feedback/effectiveness"
        );

        const results = data.solution_effectiveness || [];

        effectivenessMessage.textContent =
            `${data.total_solutions_evaluated ?? results.length} solutions evaluated`;

        if (results.length === 0) {
            effectivenessTable.innerHTML =
                '<tr><td colspan="5">No solution effectiveness data available yet.</td></tr>';
            return;
        }

        results.forEach(item => {
            const row = document.createElement("tr");

            row.appendChild(createCell(item.solution_id));
            row.appendChild(createCell(item.total_feedback));
            row.appendChild(createCell(item.resolved));
            row.appendChild(createCell(item.not_resolved));

            const rateCell = createCell(
                `${item.success_rate ?? 0}%`
            );

            rateCell.className =
                Number(item.success_rate) >= 50
                    ? "success"
                    : "failure";

            row.appendChild(rateCell);

            effectivenessTable.appendChild(row);
        });

    } catch (error) {
        console.error("Effectiveness loading error:", error);

        effectivenessMessage.textContent =
            "Could not load effectiveness: " + error.message;
    }
}

// Load resolved tickets that have not received feedback
async function loadResolvedTickets() {
    ticketSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a resolved ticket";
    ticketSelect.appendChild(defaultOption);

    try {
        const data = await authenticatedRequest("/tickets/");

        const tickets = data.tickets || [];

        const eligibleTickets = tickets.filter(ticket => {
            const alreadySubmitted = feedbackRecords.some(
                item => item.ticket_id === ticket.ticket_id
            );

            return ticket.status === "Resolved" && !alreadySubmitted;
        });

        if (eligibleTickets.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No eligible resolved tickets available";
            option.disabled = true;

            ticketSelect.appendChild(option);
            ticketSelect.disabled = true;
            submitFeedbackButton.disabled = true;

            return;
        }

        ticketSelect.disabled = false;
        submitFeedbackButton.disabled = false;

        eligibleTickets.forEach(ticket => {
            const option = document.createElement("option");

            option.value = ticket.ticket_id;

            const complaint = ticket.complaint || "No description";

            option.textContent =
                `${ticket.ticket_id.slice(0, 8)} — ${complaint.slice(0, 75)}`;

            ticketSelect.appendChild(option);
        });

        // Load solutions for the initially selected ticket
        updateSolutionOptions();

    } catch (error) {
        console.error("Resolved ticket loading error:", error);

        ticketSelect.disabled = true;
        submitFeedbackButton.disabled = true;

        const option = document.createElement("option");
        option.textContent = "Could not load resolved tickets";

        ticketSelect.appendChild(option);

        submissionMessage.textContent =
            "Could not load tickets: " + error.message;
        submissionMessage.className = "message error";
    }
}

// Update recommended solutions when ticket changes
function updateSolutionOptions() {
    solutionSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "No specific solution";
    solutionSelect.appendChild(defaultOption);

    const selectedTicket = ticketSelect.value;

    if (!selectedTicket) return;

    const ticket = currentTickets.find(
        item => item.ticket_id === selectedTicket
    );

    if (!ticket) return;

    const recommendations =
        ticket.ai_analysis?.recommended_solutions || [];

    recommendations.forEach(solution => {
        const option = document.createElement("option");

        option.value = solution.solution_id;

        option.textContent =
            `Solution ${solution.solution_id} — ${
                solution.problem || solution.title || "Recommended solution"
            }`;

        solutionSelect.appendChild(option);
    });
}

// Store tickets for solution selection
let currentTickets = [];

// Load resolved tickets and their solutions
async function loadTicketOptions() {
    ticketSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Loading resolved tickets...";
    ticketSelect.appendChild(defaultOption);

    try {
        const data = await authenticatedRequest("/tickets/");

        currentTickets = data.tickets || [];

        const eligibleTickets = currentTickets.filter(ticket => {
            const alreadySubmitted = feedbackRecords.some(
                item => item.ticket_id === ticket.ticket_id
            );

            return ticket.status === "Resolved" && !alreadySubmitted;
        });

        ticketSelect.innerHTML = "";

        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Select a resolved ticket";
        ticketSelect.appendChild(option);

        if (eligibleTickets.length === 0) {
            const emptyOption = document.createElement("option");
            emptyOption.textContent = "No eligible resolved tickets available";
            emptyOption.disabled = true;
            ticketSelect.appendChild(emptyOption);

            ticketSelect.disabled = true;
            submitFeedbackButton.disabled = true;
            return;
        }

        ticketSelect.disabled = false;
        submitFeedbackButton.disabled = false;

        eligibleTickets.forEach(ticket => {
            const ticketOption = document.createElement("option");

            ticketOption.value = ticket.ticket_id;

            const complaint = ticket.complaint || "No description";

            ticketOption.textContent =
                `${ticket.ticket_id.slice(0, 8)} — ${complaint.slice(0, 75)}`;

            ticketSelect.appendChild(ticketOption);
        });

        updateSolutionOptions();

    } catch (error) {
        console.error("Ticket loading error:", error);

        ticketSelect.disabled = true;
        submitFeedbackButton.disabled = true;

        ticketSelect.innerHTML =
            '<option value="">Could not load tickets</option>';

        submissionMessage.textContent =
            "Could not load resolved tickets: " + error.message;

        submissionMessage.className = "message error";
    }
}

// Submit feedback
feedbackForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!authenticated) {
        submissionMessage.textContent =
            "Please wait for authentication.";

        return;
    }

    const ticketId = ticketSelect.value;
    const resolvedValue = resolvedSelect.value;

    if (!ticketId) {
        submissionMessage.textContent =
            "Please select a resolved ticket.";
        return;
    }

    if (!resolvedValue) {
        submissionMessage.textContent =
            "Please select whether the issue was resolved.";
        return;
    }

    // Prevent duplicate submission in the current dashboard state
    const alreadySubmitted = feedbackRecords.some(
        item => item.ticket_id === ticketId
    );

    if (alreadySubmitted) {
        submissionMessage.textContent =
            "Feedback has already been submitted for this ticket.";

        return;
    }

    const selectedSolution = solutionSelect.value;

    const feedbackData = {
        ticket_id: ticketId,
        resolved: resolvedValue === "true",
        comments: commentsInput.value.trim(),
        solution_id: selectedSolution
            ? Number(selectedSolution)
            : null
    };

    submitFeedbackButton.disabled = true;
    submitFeedbackButton.textContent = "Submitting...";

    submissionMessage.textContent = "";

    try {
        const response = await authenticatedRequest("/feedback/", {
            method: "POST",
            body: JSON.stringify(feedbackData)
        });

        submissionMessage.textContent =
            response.message || "Feedback submitted successfully!";

        submissionMessage.className = "message success";

        feedbackForm.reset();

        // Refresh feedback, effectiveness and available tickets
        const loaded = await loadFeedback();

        if (loaded) {
            await Promise.all([
                loadEffectiveness(),
                loadTicketOptions()
            ]);
        }

    } catch (error) {
        console.error("Feedback submission error:", error);

        submissionMessage.textContent =
            "Feedback submission failed: " + error.message;

        submissionMessage.className = "message error";

    } finally {
        submitFeedbackButton.textContent = "Submit Feedback";

        if (!ticketSelect.disabled) {
            submitFeedbackButton.disabled = false;
        }
    }
});

// Update solution dropdown when ticket changes
ticketSelect.addEventListener("change", updateSolutionOptions);

// Refresh dashboard
async function refreshDashboard() {
    const loaded = await loadFeedback();

    await loadEffectiveness();

    if (loaded) {
        await loadTicketOptions();
    }
}

// Refresh button
refreshButton.addEventListener("click", () => {
    if (authenticated) {
        refreshDashboard();
    }
});

// Wait for Firebase authentication
monitorAuthState(async user => {
    if (!user) {
        window.location.replace("/login.html");
        return;
    }

    authenticated = true;

    console.log("Feedback page authenticated:", user.email);

    await refreshDashboard();
});
