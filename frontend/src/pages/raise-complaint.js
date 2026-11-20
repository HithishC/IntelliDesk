
import { authenticatedRequest } from "../api/api.js";
import { monitorAuthState } from "../firebase/auth.js";

const complaintForm = document.getElementById("complaintForm");
const complaintInput = document.getElementById("complaint");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");
const result = document.getElementById("result");
const newComplaintButton = document.getElementById("newComplaintButton");

let authenticated = false;

function showResult(data) {
    const analysis = data.analysis || {};

    document.getElementById("ticketId").textContent =
        data.ticket_id || "N/A";

    document.getElementById("category").textContent =
        analysis.category || "Pending";

    document.getElementById("priority").textContent =
        analysis.priority || analysis.urgency || "Pending";

    document.getElementById("team").textContent =
        analysis.assigned_team || "Pending";

    document.getElementById("summary").textContent =
        analysis.summary || "Analysis pending";

document.getElementById("geminiStatus").textContent =
    data.ai_status || "Pending";

    const solutionList = document.getElementById("solutionList");
    solutionList.innerHTML = "";

    const solutions = analysis.recommended_solutions || [];

    if (solutions.length === 0) {
        solutionList.textContent =
            "No matching solutions found. Your complaint has been forwarded to the support team.";
    } else {
        solutions.forEach(solution => {
            const item = document.createElement("div");
            item.className = "solution";

            const title = document.createElement("strong");
            title.textContent =
                solution.title || `Solution ${solution.solution_id}`;

            const description = document.createElement("p");
            description.textContent =
                solution.description || solution.solution || "";

            item.appendChild(title);
            item.appendChild(description);
            solutionList.appendChild(item);
        });
    }

    result.style.display = "block";
    result.scrollIntoView({ behavior: "smooth" });
}

complaintForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!authenticated) {
        message.textContent = "Please wait for authentication.";
        return;
    }

    const complaint = complaintInput.value.trim();

    if (complaint.length < 5) {
        message.textContent = "Please describe your issue in more detail.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting Complaint...";
    message.textContent = "";
    result.style.display = "none";

    try {
        const data = await authenticatedRequest("/tickets/", {
            method: "POST",
            body: JSON.stringify({ complaint })
        });

        showResult(data);
        complaintForm.reset();

        message.textContent = "Your complaint has been submitted.";

    } catch (error) {
        console.error("Complaint submission error:", error);
        message.textContent = "Submission failed: " + error.message;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Complaint";
    }
});

newComplaintButton.addEventListener("click", () => {
    result.style.display = "none";
    complaintInput.value = "";
    complaintInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
});

monitorAuthState(user => {
    if (!user) {
        window.location.replace("/login.html");
        return;
    }

    authenticated = true;
    console.log("Complaint page authenticated:", user.email);
});
