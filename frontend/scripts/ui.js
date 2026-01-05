// Человеческие названия категорий
const CATEGORY_LABELS = {
    groceries: "Продукты",
    cafe: "Кафе",
    clothes: "Одежда",
    pharmacy: "Аптеки",
    other: "Другое",
};

const SORT_STORAGE_KEY = 'cards_sort_mode';

export const SORT_MODES = {
    DATE: 'date',
    NAME: 'name',
    COLOR: 'color'
};

export function getSortMode() {
    return localStorage.getItem(SORT_STORAGE_KEY) || SORT_MODES.DATE;
}

export function setSortMode(mode) {
    localStorage.setItem(SORT_STORAGE_KEY, mode);
}




// Подсветка текста при поиске
function highlight(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "ig");
    return text.replace(regex, "<mark>$1</mark>");
}

export function renderCardTiles(cards, onCardClick, mode = "grid", searchQuery = "") {
    const grid = document.getElementById("cards-grid");

    grid.classList.toggle("list", mode === "list");
    grid.innerHTML = "";

    cards.forEach(card => {
        const tile = document.createElement("div");
        tile.classList.add("card-tile");

        if (mode === "grid") {
            tile.classList.add(card.color);
        }

        const categoryLabel = CATEGORY_LABELS[card.category] || card.category;
        const titleHtml = highlight(card.title, searchQuery);

        const favoriteHtml = card.is_favorite ? `
            <div class="favorite-badge">
                <svg xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 -960 960 960"
                     fill="currentColor">
                    <path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"/>
                </svg>
            </div>
        ` : "";

        if (mode === "list") {
            tile.innerHTML = `
                <div class="list-row">
                    <div class="list-left">
                        <span class="list-title">${titleHtml}</span>
                        ${favoriteHtml}
                    </div>
                    <span class="list-category">${categoryLabel}</span>
                </div>
            `;
        } else {
            tile.innerHTML = `
                <div class="card-title-row">
                    <div class="card-title">${titleHtml}</div>
                    ${favoriteHtml}
                </div>
                <small>${categoryLabel}</small>
            `;
        }

        tile.addEventListener("click", () => onCardClick(card));
        grid.appendChild(tile);
    });
}


const sortButton = document.getElementById('sort-button');
const sortSheet = document.getElementById('sort-sheet');
const sheetBackdrop = document.getElementById('sheet-backdrop');

function openSortSheet() {
    updateSortSheetActiveState();

    sortSheet.classList.remove('hidden');
    sheetBackdrop.classList.remove('hidden');

    requestAnimationFrame(() => {
        sortSheet.classList.add('show');
        sheetBackdrop.classList.add('show');
    });
}


function closeSortSheet() {
    sortSheet.classList.remove('show');
    sheetBackdrop.classList.remove('show');

    setTimeout(() => {
        sortSheet.classList.add('hidden');
        sheetBackdrop.classList.add('hidden');
    }, 250);
}

if (sortButton) {
    sortButton.addEventListener('click', openSortSheet);
}

sortSheet.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-sort]');
    if (!btn) return;

    const mode = btn.dataset.sort;

    setSortMode(mode);
    document.dispatchEvent(new Event('cardsSortChanged'));

    updateSortSheetActiveState();
    closeSortSheet();
});


sheetBackdrop.addEventListener('click', () => {
    if (!sortSheet.classList.contains('hidden')) {
        closeSortSheet();
    }
});

function updateSortSheetActiveState() {
    const current = getSortMode();

    sortSheet
        .querySelectorAll('.sheet-action')
        .forEach(btn => {
            btn.classList.toggle(
                'active',
                btn.dataset.sort === current
            );
        });
}