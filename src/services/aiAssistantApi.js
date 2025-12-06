// src/services/aiAssistantApi.js
//
// Client for the Claude chat endpoint in the backend.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CLAUDE_URL = `${API_BASE_URL}/claude`;

/**
 * Send a chat message to the Claude backend endpoint.
 * @param {string} message - User's message text.
 * @returns {Promise<{ reply: string, contextUsed?: boolean, chunksFound?: number }>}
 */
export const sendClaudeMessage = async (message) => {
  const res = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Claude API request failed");
  }

  return res.json();
};

