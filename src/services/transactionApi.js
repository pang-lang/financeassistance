// src/services/transactionApi.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = `${API_BASE_URL}/transactions`;

console.log("🔧 API Configuration:", {
  API_BASE_URL,
  API_URL,
  env: process.env.NEXT_PUBLIC_API_URL
});

export const getAllTransactions = async () => {
  console.log("📡 Fetching transactions from:", API_URL);
  const res = await fetch(API_URL, {
    method: "GET",
    headers: {
      "accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load transactions");
  }

  return res.json();
};

export const createTransaction = async (transaction) => {
  const payload = {
    user_id: transaction.user_id ?? 1,   // default to user 1 for now
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    purchase_date: transaction.date,     // backend requires purchase_date
  };

  console.log("📤 Creating transaction:", { API_URL, payload });
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Failed to create transaction: " + err);
  }

  return res.json();
};

export const updateTransaction = async (id, transaction) => {
  const payload = {
    user_id: transaction.user_id ?? 1,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    purchase_date: transaction.date,
  };

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Failed to update transaction: " + err);
  }

  return res.json();
};

export const deleteTransaction = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete transaction");
  }

  return true;
};
