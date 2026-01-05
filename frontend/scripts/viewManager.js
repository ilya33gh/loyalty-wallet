const views = document.querySelectorAll(".view");

export function showView(id) {
    const nextView = document.getElementById(`view-${id}`);
    const currentView = document.querySelector(".view:not(.hidden)");

    if (currentView === nextView) return;

    /* ===== УХОД ТЕКУЩЕГО ЭКРАНА ===== */
    if (currentView) {
        // если уходим СО страницы карты → просто скрываем
        currentView.classList.add("hidden");
    }

    /* ===== ПОЯВЛЕНИЕ СЛЕДУЮЩЕГО ===== */
    nextView.classList.remove("hidden");

    /* ===== АНИМАЦИИ ===== */

    // 1️⃣ Переход НА страницу карты
    if (id === "card") {
        const content = nextView.querySelector(".card-view-content");
        if (content) {
            content.classList.add("animating-out");

            requestAnimationFrame(() => {
                content.classList.remove("animating-out");
                content.classList.add("animating-in");

                setTimeout(() => {
                    content.classList.remove("animating-in");
                }, 200);
            });
        }
    }

    // 2️⃣ Переход ОБРАТНО на главную
    if (id === "list") {
        const grid = nextView.querySelector("#cards-grid");
        if (grid) {
            grid.classList.add("animating-out");

            requestAnimationFrame(() => {
                grid.classList.remove("animating-out");
                grid.classList.add("animating-in");

                setTimeout(() => {
                    grid.classList.remove("animating-in");
                }, 200);
            });
        }
    }
}



