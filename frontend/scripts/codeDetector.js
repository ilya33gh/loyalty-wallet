export function detectByValue(value = "") {
    if (/^\d{13}$/.test(value)) return "ean13";
    if (/^\d{8}$/.test(value)) return "ean8";
    if (/^\d{12}$/.test(value)) return "upca";
    if (value.length > 20) return "qr";
    return "code128";
}
