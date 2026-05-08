const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function loginDemo() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@okdriver.in", password: "12345678" }),
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate demo account.");
  }

  return response.json();
}

export async function fetchClips(token, date) {
  const params = new URLSearchParams({ date });
  const response = await fetch(`${API_BASE}/clips?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch clips.");
  }

  return response.json();
}
