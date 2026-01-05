import { getActiveCard } from "./app.js";
import { startInlineTitleEdit } from "./app.js";
import { openColorPicker } from "./app.js";
import { renderCode } from "./codeRenderer.js";
import { copyToClipboard } from "./app.js";
import { updateCard } from "./api.js";
import { loadCards } from "./app.js";


export function renderCardView() {
    const card = getActiveCard();
    if (!card) return;

    const container = document.getElementById("card-preview");

    container.className = `card-preview ${card.color}`;

    container.innerHTML = `
        <div class="card-title-row">
            <span class="card-title-text">${card.title}</span>

            <button class="edit-title-btn" aria-label="Редактировать название">
                <svg class="icon">
                    <use href="#icon-edit"></use>
                </svg>
            </button>

            <button
                class="color-dot-btn"
                data-action="change-color"
                aria-label="Изменить цвет"
                style="--dot-color: var(--card-${card.color});"
            ></button>
        </div>

        <div class="card-code">
            <div class="code-container"></div>
            <div class="code-text">${card.code_value}</div>
        </div>
    `;

    const codeTextEl = container.querySelector(".code-text");

    if (codeTextEl) {
        codeTextEl.addEventListener("click", (e) => {
            e.stopPropagation();
            copyToClipboard(card.code_value);
        });
    }
    const codeContainer =
    container.querySelector(".code-container");

renderCode(
    codeContainer,
    card.code_type,
    card.code_value
);



    container
        .querySelector(".color-dot-btn")
        .addEventListener("click", (e) => {
            e.stopPropagation();
            openColorPicker();
        });

    container
        .querySelector(".edit-title-btn")
        .addEventListener("click", (e) => {
            e.stopPropagation();
            startInlineTitleEdit(container);
        });
}

async function applyColor(newColor) {
    const card = getActiveCard();
    if (!card) return;

    // optimistic UI (для текущей карточки)
    card.color = newColor;
    renderCardView();

    try {
        await updateCard(card.id, {
            title: card.title,
            color: newColor,
            category: card.category,
            code_type: card.code_type,
            code_value: card.code_value
        });

        // 🔥 ВАЖНО: перезагружаем список целиком
        await loadCards();

    } catch (e) {
        console.error("Failed to update color", e);
    }
}
