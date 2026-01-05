import { getAddCardState, resetAddCardState } from "./addCardState.js";
import { detectByValue } from "./codeDetector.js";
import { createCard } from "./api.js";
import { showView } from "./viewManager.js";
import { loadCards } from "./app.js";

export function initAddCardSubmit() {
    const btn = document.getElementById("save-card-btn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        const state = getAddCardState();

        if (!state.codeValue || !state.codeValue.trim()) return;

        if (!state.title.trim()) {
            alert("Введите название карты");
            return;
        }

        let finalCodeType =
            state.codeType === "auto"
                ? detectByValue(state.codeValue)
                : state.codeType;

        const codeValue = state.codeValue.trim();

        if (finalCodeType === "ean13" && codeValue.length !== 13) {
            alert("EAN-13 должен содержать 13 цифр");
            return;
        }

        if (finalCodeType === "ean8" && codeValue.length !== 8) {
            alert("EAN-8 должен содержать 8 цифр");
            return;
        }

        const payload = {
            title: state.title.trim(),
            color: state.color,           // enum value: "blue"
            category: state.category,     // enum value: "groceries"
            code_type: finalCodeType,     // ✅ lowercase
            code_value: codeValue
        };

        try {
            await createCard(payload);

            resetAddCardState();
            showView("list");

            await loadCards();

        } catch (e) {
            console.error(e);
            alert("Не удалось добавить карту");
        }
    });
}

