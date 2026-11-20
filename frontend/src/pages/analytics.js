
import { authenticatedRequest } from "../api/api.js";
import { monitorAuthState } from "../firebase/auth.js";

const totalTickets = document.getElementById("totalTickets");
const openTickets = document.getElementById("openTickets");
const criticalTickets = document.getElementById("criticalTickets");
const resolutionRate = document.getElementById("resolutionRate");
const errorMessage = document.getElementById("errorMessage");
const refreshButton = document.getElementById("refreshButton");

let authenticated = false;

let statusChart = null;
let priorityChart = null;
let categoryChart = null;
let distributionChart = null;

function createChart(canvasId, type, labels, values) {
    const canvas = document.getElementById(canvasId);

    return new Chart(canvas, {
        type,
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#8b5cf6",
                    "#06b6d4",
                    "#f59e0b",
                    "#ef4444",
                    "#10b981",
                    "#ec4899"
                ],
                borderColor: "#10152a",
                borderWidth: 2,
                borderRadius: type === "bar" ? 6 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#ffffff"
                    }
                }
            },
            scales: type === "bar" ? {
                x: {
                    ticks: { color: "#cbd5e1" },
                    grid: { color: "#252b45" }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#cbd5e1",
                        precision: 0
                    },
                    grid: { color: "#252b45" }
                }
            } : {}
        }
    });
}

function updateChart(oldChart, canvasId, type, labels, values) {
    if (oldChart) {
        oldChart.destroy();
    }

    return createChart(canvasId, type, labels, values);
}

async function loadAnalytics() {
    errorMessage.textContent = "Loading analytics...";

    try {
        const data = await authenticatedRequest("/dashboard/stats");

        totalTickets.textContent = data.total_tickets ?? 0;
        openTickets.textContent = data.open_tickets ?? 0;
        criticalTickets.textContent = data.critical_tickets ?? 0;
        resolutionRate.textContent = `${data.resolution_rate ?? 0}%`;

        const statuses = data.tickets_by_status || {};
        const priorities = data.tickets_by_priority || {};
        const categories = data.tickets_by_category || {};

        statusChart = updateChart(
            statusChart,
            "statusChart",
            "bar",
            Object.keys(statuses),
            Object.values(statuses)
        );

        priorityChart = updateChart(
            priorityChart,
            "priorityChart",
            "bar",
            Object.keys(priorities),
            Object.values(priorities)
        );

        categoryChart = updateChart(
            categoryChart,
            "categoryChart",
            "bar",
            Object.keys(categories),
            Object.values(categories)
        );

        distributionChart = updateChart(
            distributionChart,
            "distributionChart",
            "doughnut",
            Object.keys(statuses),
            Object.values(statuses)
        );

        errorMessage.textContent = "";

    } catch (error) {
        console.error("Analytics loading error:", error);
        errorMessage.textContent =
            "Could not load analytics: " + error.message;
    }
}

refreshButton.addEventListener("click", () => {
    if (authenticated) {
        loadAnalytics();
    }
});

monitorAuthState(async user => {
    if (!user) {
        window.location.replace("/login.html");
        return;
    }

    authenticated = true;
    console.log("Analytics page authenticated:", user.email);

    await loadAnalytics();
});
