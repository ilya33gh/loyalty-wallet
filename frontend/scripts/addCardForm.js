import {
    subscribeAddCard,
    setAddCardState,
    getAddCardState
} from "./addCardState.js";

import { renderCode } from "./codeRenderer.js";
import { detectByValue } from "./codeDetector.js";
import { STORE_PRESETS } from "./storePresets.js";

const titleInput = document.getElementById("add-card-title");
const categorySelect = document.getElementById("add-card-category");
const typeSelect = document.getElementById("add-card-code-type");
const valueInput = document.getElementById("add-card-code-value");
const previewBox = document.getElementById("add-card-code-preview");
const colorButtons = document.querySelectorAll(".color-swatch");
const saveBtn = document.getElementById("save-card-btn");


export function initAddCardForm() {
    subscribeAddCard(syncUI);

    titleInput.addEventListener("input", () => {
        const title = titleInput.value;
        const current = getAddCardState();
        const detected = detectStoreByTitle(title);

        setAddCardState({
            title,
            color: current.isManualColor
                ? current.color
                : detected?.color ?? current.color,
            category: current.isManualCategory
                ? current.category
                : detected?.category ?? current.category
        });
    });

    categorySelect.addEventListener("change", () => {
        setAddCardState({
            category: categorySelect.value
        });
    });

    typeSelect.addEventListener("change", () => {
        setAddCardState({
            codeType: typeSelect.value,
            isManualCodeType: true   
        });
    });


    valueInput.addEventListener("input", () => {
        const value = valueInput.value;

        setAddCardState({
            codeValue: value
        });

        const current = getAddCardState();

        // автоопределение работает, пока тип не выбран вручную
        if (!current.isManualCodeType) {
            const detected = detectByValue(value);

            if (detected && detected !== current.codeType) {
                setAddCardState({
                    codeType: detected
                });
            }
        }
    });

    colorButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const color = btn.dataset.color;

            setAddCardState({
                color,
                isManualColor: true   // 👈 пользователь выбрал вручную
            });
        });
    });

    categorySelect.addEventListener("change", () => {
        setAddCardState({
            category: categorySelect.value,
            isManualCategory: true
        });
    });
}

function syncUI(state) {
    if (titleInput.value !== state.title) {
        titleInput.value = state.title;
    }

    if (categorySelect.value !== state.category) {
        categorySelect.value = state.category;
    }

    if (typeSelect.value !== state.codeType) {
        typeSelect.value = state.codeType;
    }

    if (valueInput.value !== state.codeValue) {
        valueInput.value = state.codeValue;
    }

    colorButtons.forEach(btn => {
        btn.classList.toggle(
            "selected",
            btn.dataset.color === state.color
        );
    });

    // ✓ доступна только если есть код
    const canSave = Boolean(state.codeValue && state.codeValue.trim());

    saveBtn.disabled = !canSave;
    saveBtn.classList.toggle("enabled", canSave);
    saveBtn.classList.toggle("disabled", !canSave);


    renderPreview(state);
}

const previewCard = document.getElementById("add-card-preview");

function renderPreview(state) {
    if (!previewCard) return;

    previewCard.className = `card-preview ${state.color}`;

    const title = state.title || "Название карты";

    previewCard.innerHTML = `
        <div class="card-title-row">
            <span class="card-title-text">${title}</span>
        </div>

        <div class="card-code">
            <div class="code-container"></div>
            <div class="code-text">${state.codeValue || ""}</div>
        </div>
    `;

    // 👉 ВОТ ЭТОГО НЕ ХВАТАЛО
    const codeContainer =
        previewCard.querySelector(".code-container");

    if (!state.codeValue) return;

    // preview-тип: QR или универсальный CODE128
    const previewType =
        state.codeType === "qr" ? "qr" : "code128";

    renderCode(
        codeContainer,
        previewType,
        state.codeValue
    );
}


function detectStoreByTitle(title = "") {
    const t = title.toLowerCase();

    for (const store of STORE_PRESETS) {
        if (store.match.some(word => t.includes(word))) {
            return {
                color: store.color,
                category: store.category
            };
        }
    }

    return null;
}


