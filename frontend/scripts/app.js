import { showView } from "./viewManager.js";
import { fetchCards } from "./api.js";
import { renderCardTiles } from "./ui.js";
import { renderCardView } from "./cardView.js";
import { deleteCard } from "./api.js";
import { updateCard } from "./api.js";
import { renderCode } from "./codeRenderer.js";
import { openAddCardMenu } from "./addCardMenu.js";
import { initAddCardForm } from "./addCardForm.js";
import { initAddCardSubmit } from "./addCardSubmit.js";
import { setSortMode, getSortMode, SORT_MODES } from './ui.js';
import { applyColor } from "./cardView.js";

const tg = window.Telegram.WebApp;

tg.ready();
tg.expand(); 

console.log(tg.initDataUnsafe);

let activeCard = null;

export function setActiveCard(card) {
    activeCard = card;
}

export function getActiveCard() {
    return activeCard;
}

let cards = [];

let viewMode = "grid";
let previousViewMode = viewMode;

let currentSearchQuery = "";

let isEditingTitle = false;

const tg = window.Telegram?.WebApp;
//удалить в тг
const DEV_THEMES = {
    light: {
        bg_color: "#F2F2F7",
        secondary_bg_color: "#E5E5EA",
        text_color: "#111111",
        hint_color: "#8E8E93",
        button_color: "#007AFF",
        button_text_color: "#FFFFFF",
    },
    dark: {
        bg_color: "#0F0F10",
        secondary_bg_color: "#1C1C1E",
        text_color: "#FFFFFF",
        hint_color: "#9A9AA0",
        button_color: "#0A84FF",
        button_text_color: "#FFFFFF",
    }
};
if (!window.Telegram) {
    window.Telegram = {
        WebApp: {
            colorScheme: "light",
            themeParams: {
                bg_color: "#F2F2F7",
                secondary_bg_color: "#E5E5EA",
                text_color: "#111111",
                hint_color: "#8E8E93",
                button_color: "#007AFF",
                button_text_color: "#FFFFFF",
            },
            onEvent: () => {}
        }
    };
}
document.addEventListener("keydown", (e) => {
    if (e.key === "t") {
        const tg = window.Telegram.WebApp;

        tg.colorScheme = tg.colorScheme === "dark" ? "light" : "dark";
        tg.themeParams = DEV_THEMES[tg.colorScheme];

        applyTelegramTheme();
    }
});


//переключатели режимов отображения
const gridIcon = `
<svg class="view-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M280-280h160v-160H280v160Zm240 0h160v-160H520v160ZM280-520h160v-160H280v160Zm240 0h160v-160H520v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"></svg>
`;

const listIcon = `
<svg class="view-icon rotate-90" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M121-280v-400q0-33 23.5-56.5T201-760h559q33 0 56.5 23.5T840-680v400q0 33-23.5 56.5T760-200H201q-33 0-56.5-23.5T121-280Zm79 0h133v-400H200v400Zm213 0h133v-400H413v400Zm213 0h133v-400H626v400Z"></svg>
`;

//закрыть поиск
const clearSearchIcon = `
<svg class="clear-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"></svg>
`;

//empty state
function getEmptyStateHtml(mode) {
    return `
        <div class="empty-state ${mode}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
                <path d="M280-240q-33 0-56.5-23.5T200-320v-400q0-33 23.5-56.5T280-800h400q33 0 56.5 23.5T760-720v400q0 33-23.5 56.5T680-240H280Zm0-80h400v-400H280v400Z"/>
            </svg>
            <div>В этой категории пока нет карт</div>
        </div>
    `;
}




export async function loadCards() {
    cards = await fetchCards();
    updateView(getFilteredCards());
}

function updateView(filteredCards) {
    const grid = document.getElementById("cards-grid");

    // Анимация скрытия
    grid.classList.add("animating-out");

    setTimeout(() => {
        document.getElementById("cards-count").textContent =
            `${filteredCards.length} карт`;

        const grid = document.getElementById("cards-grid");

        if (filteredCards.length === 0) {
            grid.classList.add("empty");
            grid.innerHTML = getEmptyStateHtml(viewMode);
            grid.classList.remove("animating-out");
            return;
        }

        renderCardTiles(
            filteredCards,
            (card) => {
                setActiveCard(card);     // 1️⃣ сохраняем карту
                showView("card");        // 2️⃣ переключаем экран
                renderCardView();        // 3️⃣ рисуем содержимое
            },
            viewMode,
            currentSearchQuery
        );
        grid.classList.remove("empty");

        // Анимация появления
        grid.classList.remove("animating-out");
        grid.classList.add("animating-in");

        setTimeout(() => {
            grid.classList.remove("animating-in");
        }, 200);

    }, 150);
}



/* Переключение режимов */
const viewToggleBtn = document.getElementById("view-toggle");

function updateViewModeIcon() {
    viewToggleBtn.innerHTML =
        viewMode === "grid" ? listIcon : gridIcon;
}

viewToggleBtn.addEventListener("click", () => {
    viewMode = viewMode === "grid" ? "list" : "grid";
    updateView(getFilteredCards());
    updateViewModeIcon();
});

updateViewModeIcon();



/* Поиск */
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
clearSearchBtn.innerHTML = clearSearchIcon;
let isSearching = false;
let currentCategory = "all";

searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.toLowerCase();

    if (currentSearchQuery.length > 0) {
        clearSearchBtn.classList.remove("hidden");

        if (!isSearching) {
            previousViewMode = viewMode;
            isSearching = true;
        }

        viewMode = "list";
        updateView(getFilteredCards());
    } else {
        exitSearch();
    }
});

function exitSearch() {
    currentSearchQuery = "";
    searchInput.value = "";
    searchInput.blur();

    clearSearchBtn.classList.add("hidden");

    if (isSearching) {
        viewMode = previousViewMode;
        isSearching = false;
    }

    updateView(getFilteredCards());
}
clearSearchBtn.addEventListener("click", exitSearch);

//категории
function getFilteredCards() {
    const filtered = cards.filter(card => {
        const matchesCategory =
            currentCategory === "favorites"
                ? card.is_favorite
                : currentCategory === "all"
                    ? true
                    : card.category === currentCategory;

        const matchesSearch =
            !currentSearchQuery ||
            card.title.toLowerCase().includes(currentSearchQuery);

        return matchesCategory && matchesSearch;
    });

    return sortCards(filtered);
}


//автоскролл к категории
function scrollCategoryIntoView(button) {
    button.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
    });
}

const categoryTabs = document.getElementById("category-tabs");

categoryTabs.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    categoryTabs.querySelectorAll("button").forEach(b =>
        b.classList.remove("active")
    );
    btn.classList.add("active");

    currentCategory = btn.dataset.category;

    scrollCategoryIntoView(btn); // ⬅️ ВАЖНО

    updateView(getFilteredCards());
});

//тема
function applyTelegramTheme() {
    const tg = window.Telegram?.WebApp;
    if (!tg || !tg.themeParams) return;

    const p = tg.themeParams;

    console.log("Applying theme:", tg.colorScheme, p);

    document.documentElement.style.setProperty("--bg-main", p.bg_color);
    document.documentElement.style.setProperty("--bg-secondary", p.secondary_bg_color);
    document.documentElement.style.setProperty("--text-main", p.text_color);
    document.documentElement.style.setProperty("--text-secondary", p.hint_color);
    document.documentElement.style.setProperty("--accent", p.button_color);
}

applyTelegramTheme();

if (tg) {
    tg.onEvent("themeChanged", applyTelegramTheme);
}

//навигация
document.addEventListener("click", (e) => {
    if (isEditingTitle) return;   // ⬅️ защита

    const back = e.target.closest("[data-back]");
    if (!back) return;

    showView(back.dataset.back);
});

//bottom sheet
const sheet = document.getElementById("card-sheet");
const backdrop = document.getElementById("sheet-backdrop");

/* открыть */
function openSheet() {
    updateFavoriteActionState(); // ⬅️ КЛЮЧЕВО

    sheet.classList.remove("hidden");
    backdrop.classList.remove("hidden");

    requestAnimationFrame(() => {
        sheet.classList.add("show");
        backdrop.classList.add("show");
    });
}

/* закрыть */
function closeSheet() {
    sheet.classList.remove("show");
    backdrop.classList.remove("show");

    setTimeout(() => {
        sheet.classList.add("hidden");
        backdrop.classList.add("hidden");
    }, 250);
}

//редактировать цвет
const colorSheet = document.getElementById("color-sheet");

export function openColorPicker() {
    colorSheet.classList.remove("hidden");
    backdrop.classList.remove("hidden");

    requestAnimationFrame(() => {
        colorSheet.classList.add("show");
        backdrop.classList.add("show");
    });
}

function closeColorPicker() {
    colorSheet.classList.remove("show");
    backdrop.classList.remove("show");

    setTimeout(() => {
        colorSheet.classList.add("hidden");
        backdrop.classList.add("hidden");
    }, 250);
}

// выбор цвета
colorSheet.addEventListener("click", (e) => {
    const swatch = e.target.closest(".color-swatch");
    if (!swatch) return;

    const color = swatch.dataset.color;
    if (!color) return;

    closeColorPicker();
    applyColor(color);
});


sheet.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    closeSheet();

    if (action === "fullscreen") {
        openFullscreenCard();
    }

    if (action === "delete") {
        deleteActiveCard();
    }

    if (action === "favorite") {
        toggleFavorite();
    }
});


backdrop.addEventListener("click", closeColorPicker);

//fullscreen
const fullscreen = document.getElementById("fullscreen-card");
const fullscreenContent = document.getElementById("fullscreen-content");

function openFullscreenCard() {
    const card = getActiveCard();
    if (!card) return;

    fullscreenContent.innerHTML = "";

    // контейнер для кода
    const codeBox = document.createElement("div");
    codeBox.className = "fullscreen-code";
    codeBox.dataset.type = card.code_type;
    codeBox.dataset.mode = "fullscreen";

    fullscreenContent.appendChild(codeBox);

    const safeType =
        card.code_type === "auto"
            ? "code128"
            : card.code_type;

    renderCode(codeBox, safeType, card.code_value);

    fullscreen.classList.remove("hidden");

    requestAnimationFrame(() => {
        fullscreen.classList.add("show");
    });
}


fullscreen.addEventListener("click", () => {
    fullscreen.classList.remove("show");

    setTimeout(() => {
        fullscreen.classList.add("hidden");
        fullscreenContent.innerHTML = "";
    }, 250);
});

//более
document.getElementById("open-sheet")
    ?.addEventListener("click", openSheet);

backdrop.addEventListener("click", closeSheet);

async function deleteActiveCard() {
    const card = getActiveCard();
    if (!card) return;

    const confirmed = confirm(`Удалить карту «${card.title}»?`);
    if (!confirmed) return;

    try {
        await deleteCard(card.id);

        // закрываем sheet
        closeSheet();

        // удаляем локально
        cards = cards.filter(c => c.id !== card.id);

        // возвращаемся к списку
        showView("list");

        // обновляем UI
        updateView(getFilteredCards());

    } catch (err) {
        console.error(err);
        alert("Не удалось удалить карту");
    }
}

//избранное
async function toggleFavorite() {
    const card = getActiveCard();
    if (!card) return;

    try {
        const saved = await updateCard(card.id, {
            title: card.title,
            color: card.color,
            category: card.category,
            code_type: card.code_type,
            code_value: card.code_value,
            is_favorite: !card.is_favorite
        });

        setActiveCard(saved);
        cards = cards.map(c => c.id === saved.id ? saved : c);

        renderCardView();
        updateView(getFilteredCards());

    } catch (e) {
        console.error(e);
        alert("Не удалось изменить избранное");
    }
}

function updateFavoriteActionState() {
    const btn = document.getElementById("favorite-action");
    const card = getActiveCard();
    if (!btn || !card) return;

    btn.classList.toggle("active", card.is_favorite === true);
}




//редактировать
export function startInlineTitleEdit(container) {
    console.log("startInlineTitleEdit called");

    if (!container) return;

    const titleRow = container.querySelector(".card-title-row");
    if (!titleRow) return;

    const titleText = titleRow.querySelector(".card-title-text");
    if (!titleText) return;

    const currentTitle = titleText.textContent;

    titleRow.innerHTML = `
        <input
            class="card-title-input"
            type="text"
            id="inline-card-title"
            name="card-title"
            autocomplete="off"
            value="${currentTitle}"
        />
    `;

    const input = titleRow.querySelector("input");
    input.focus();
    input.select(); // ✅ выделение всего текста

    input.addEventListener("blur", () => {
        finishInlineTitleEdit(input.value);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            finishInlineTitleEdit(input.value);
        }
        if (e.key === "Escape") {
            finishInlineTitleEdit(currentTitle);
        }
    });
}


export async function finishInlineTitleEdit(newTitle) {
    const card = getActiveCard();
    if (!card) return;

    const title = newTitle.trim();
    if (!title) return; // запрещаем пустое название

    // 1️⃣ Обновляем локально (optimistic UI)
    card.title = title;
    renderCardView();

    // 2️⃣ Сохраняем на бекэнд
    try {
        await updateCard(card.id, {
            title,
            color: card.color,
            category: card.category,
            code_type: card.code_type,
            code_value: card.code_value
        });
    } catch (e) {
        console.error("Failed to update title", e);
        // при желании можно откатить
    }
}


//скопировать код
export function copyToClipboard(text) {
    if (!text) return;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(showCopiedToast)
            .catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const input = document.createElement("textarea");
    input.value = text;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();

    try {
        document.execCommand("copy");
        showCopiedToast();
    } catch {
        alert("Не удалось скопировать");
    }

    document.body.removeChild(input);
}

let copyToastTimeout = null;

function showCopiedToast() {
    let toast = document.getElementById("copy-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "copy-toast";
        toast.textContent = "Скопировано";
        document.body.appendChild(toast);
    }

    toast.classList.add("show");

    clearTimeout(copyToastTimeout);
    copyToastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 1200);
}

const addCardBtn = document.getElementById("add-card-btn");
if (addCardBtn) {
    addCardBtn.addEventListener("click", openAddCardMenu);
}

//сортировка
function sortCards(inputCards) {
    const mode = getSortMode();
    const sorted = [...inputCards];

    switch (mode) {
        case SORT_MODES.NAME:
            return sorted.sort((a, b) =>
                a.title.localeCompare(b.title, 'ru')
            );

        case SORT_MODES.COLOR:
            return sorted.sort((a, b) =>
                (a.color || '').localeCompare(b.color || '')
            );

        case SORT_MODES.DATE:
        default:
            return sorted.sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );
    }
}

/* Старт */
document.addEventListener('cardsSortChanged', () => {
    updateView(getFilteredCards());
});

initAddCardForm();
initAddCardSubmit();
showView("list");
loadCards();
updateViewModeIcon();
