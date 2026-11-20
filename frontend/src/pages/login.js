
import { loginUser, logoutUser } from "../firebase/auth.js";
import { authenticatedRequest } from "../api/api.js";

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";
    message.textContent = "";

    try {
        // Step 1: Authenticate with Firebase
        await loginUser(email, password);

        // Step 2: Verify Firebase token with FastAPI
        const user = await authenticatedRequest("/auth/me");

        message.style.color = "#4ade80";
        message.textContent = `Welcome ${user.email}! Login successful.`;

        // Step 3: Redirect after successful verification
        setTimeout(() => {
            window.location.href = "/dashboard.html";
        }, 1200);

    } catch (error) {
        console.error("Login error:", error);

        // Sign out if backend token verification fails
        try {
            await logoutUser();
        } catch (logoutError) {
            console.error("Logout error:", logoutError);
        }

        message.style.color = "#f87171";
        message.textContent = error.message || "Login failed. Please try again.";

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Sign In";
    }
});
