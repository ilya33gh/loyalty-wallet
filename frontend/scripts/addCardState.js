const state = {
    title: "",
    color: "gray",
    category: "other",
    codeType: "auto",
    codeValue: "",
    isManualCodeType: false,
    isManualColor: false, 
    isManualCategory: false
};



const listeners = new Set();

export function getAddCardState() {
    return { ...state };
}

export function setAddCardState(patch) {
    Object.assign(state, patch);
    notify();
}

export function subscribeAddCard(fn) {
    listeners.add(fn);
    fn(getAddCardState()); // первый рендер
    return () => listeners.delete(fn);
}

function notify() {
    const snapshot = getAddCardState();
    listeners.forEach(fn => fn(snapshot));
}

export function resetAddCardState() {
    state.title = "";
    state.color = "gray";
    state.category = "other";
    state.codeType = "auto";
    state.codeValue = "";
    state.isManualCodeType = false;
    state.isManualColor = false;
    state.isManualCategory = false;
    notify();
}
