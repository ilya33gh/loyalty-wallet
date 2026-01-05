import { showView } from "./viewManager.js";
import { openScanner } from "./scanner.js";
import { setAddCardState } from "./addCardState.js";

let menuEl = null;
let backdropEl = null;

export function openAddCardMenu() {
    if (!menuEl) createMenu();

    menuEl.classList.remove("hidden");
    backdropEl.classList.remove("hidden");

    requestAnimationFrame(() => {
        menuEl.classList.add("show");
        backdropEl.classList.add("show");
    });
}

function closeMenu() {
    menuEl.classList.remove("show");
    backdropEl.classList.remove("show");

    setTimeout(() => {
        menuEl.classList.add("hidden");
        backdropEl.classList.add("hidden");
    }, 250);
}

function createMenu() {
    backdropEl = document.createElement("div");
    backdropEl.className = "sheet-backdrop hidden";
    backdropEl.addEventListener("click", closeMenu);

    menuEl = document.createElement("div");
    menuEl.className = "card-sheet hidden add-card-menu";

    menuEl.innerHTML = `
        <div class="sheet-handle"></div>

        <div class="sheet-actions">
            <button class="sheet-action primary" data-action="camera">
                <svg class="icon">
                    <use href="#icon-camera"></use>
                </svg>
                <span>Сканировать код</span>
            </button>

            <button class="sheet-action secondary" data-action="manual">
                <svg class="icon">
                    <use href="#icon-edit"></use>
                </svg>
                <span>Ввести вручную</span>
            </button>
        </div>
    `;

    menuEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;
        closeMenu();

        if (action === "manual") {
            // 1️⃣ подготовка анимации (до показа)
            const content = document.querySelector(
                "#view-add .add-card-content"
            );

            if (content) {
                content.classList.remove("animating-in");
                content.classList.add("animating-out");
            }

            // 2️⃣ переключаем экран
            showView("add");

            // 3️⃣ запускаем анимацию появления
            requestAnimationFrame(() => {
                const content = document.querySelector(
                    "#view-add .add-card-content"
                );
                if (!content) return;

                content.classList.remove("animating-out");
                content.classList.add("animating-in");

                setTimeout(() => {
                    content.classList.remove("animating-in");
                }, 200);
            });
        }

        if (action === "camera") {
            openScanner({
                onDetect: ({ codeValue }) => {
                    setAddCardState({
                        codeValue,
                        codeType: "auto"
                    });

                    showView("add");
                }
            });
        }
    });

    document.body.appendChild(backdropEl);
    document.body.appendChild(menuEl);
}
