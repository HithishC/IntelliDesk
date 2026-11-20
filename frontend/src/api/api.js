
import { getUserToken } from "../firebase/auth.js";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function authenticatedRequest(endpoint, options = {}) {
  const token = await getUserToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "API request failed");
  }

  return data;
}
