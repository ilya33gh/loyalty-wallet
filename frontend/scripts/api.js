const API_URL = "/api";

export async function fetchCards() {
    const response = await fetch(`${API_URL}/cards/`);
    return response.json();
}

// удаление
export async function deleteCard(cardId) {
    const response = await fetch(
        `${API_URL}/cards/${cardId}`,
        { method: "DELETE" }
    );

    if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete card");
    }
}

// изменение названия
export async function updateCard(cardId, payload) {
    const response = await fetch(
        `${API_URL}/cards/${cardId}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update card");
    }

    return response.json();
}

// создание карты
export async function createCard(payload) {
    const response = await fetch(
        `${API_URL}/cards/`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create card");
    }

    return response.json();
}
