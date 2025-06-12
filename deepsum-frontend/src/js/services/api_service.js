import { supabase } from "../supabase_client";

const API_BASE_URL = "https://390b-118-99-87-56.ngrok-free.app";

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Please log in to continue");
  }
  return user;
}

async function summarizeAbstraction(file) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/summarize/abs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Summarization failed");
  }

  return await response.json();
}

async function summarizeExtraction(file) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/summarize/ext`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Summarization failed");
  }

  return await response.json();
}

async function askQuestion(summarizationId, question, sessionId = null) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const requestBody = {
    summarization_id: summarizationId,
    question: question,
  };

  if (sessionId) {
    requestBody.session_id = sessionId;
  }

  const response = await fetch(`${API_BASE_URL}/qna/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Question failed");
  }

  return await response.json();
}

export { summarizeAbstraction, summarizeExtraction, getCurrentUser, askQuestion };
