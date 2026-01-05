export function renderCode(container, type, value) {
    container.innerHTML = "";
    if (!value) return;

    const stringValue = String(value);

    // QR
    if (type === "qr") {
        const qr = document.createElement("div");
        new QRCode(qr, {
            text: stringValue,
            width: 160,
            height: 160,
            correctLevel: QRCode.CorrectLevel.M
        });
        container.appendChild(qr);
        return;
    }

    // BARCODE
    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    const format = mapBarcodeFormat(type);

    try {
        JsBarcode(svg, stringValue, {
            format,
            displayValue: false,
            height: 60,
            margin: 0
        });
    } catch (e) {
        console.warn("Invalid barcode, fallback to CODE128", e);

        JsBarcode(svg, stringValue, {
            format: "CODE128",
            displayValue: false,
            height: 60,
            margin: 0
        });
    }

    container.appendChild(svg);
}

function mapBarcodeFormat(type) {
    switch (type) {
        case "ean13": return "EAN13";
        case "ean8":  return "EAN8";
        case "upca":  return "UPC";
        case "code128":
        default:
            return "CODE128";
    }
}


