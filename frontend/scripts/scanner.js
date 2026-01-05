let stream = null;
let videoEl = null;
let detector = null;

export async function openScanner({ onDetect, onCancel }) {
    try {
        // 1. Проверяем поддержку
        if (!("BarcodeDetector" in window)) {
            alert("Сканирование не поддерживается на этом устройстве");
            return;
        }

        detector = new BarcodeDetector({
            formats: [
                "qr_code",
                "ean_13",
                "ean_8",
                "code_128",
                "upc_a"
            ]
        });

        // 2. Получаем камеру
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        // 3. Видео элемент
        videoEl = document.createElement("video");
        videoEl.setAttribute("playsinline", true); // iOS
        videoEl.srcObject = stream;
        await videoEl.play();

        // 4. Оверлей
        const overlay = createOverlay(videoEl, onCancel);
        document.body.appendChild(overlay);

        scanLoop(onDetect, overlay);

    } catch (err) {
        console.error("Scanner error:", err);
        alert("Не удалось открыть камеру");
        cleanup();
    }
}

async function scanLoop(onDetect, overlay) {
    if (!videoEl || videoEl.readyState !== 4) {
        requestAnimationFrame(() => scanLoop(onDetect, overlay));
        return;
    }

    try {
        const codes = await detector.detect(videoEl);

        if (codes.length > 0) {
            const code = codes[0];

            onDetect({
                codeType: mapFormat(code.format),
                codeValue: code.rawValue
            });

            cleanup();
            overlay.remove();
            return;
        }
    } catch (e) {
        console.warn("Detect failed", e);
    }

    requestAnimationFrame(() => scanLoop(onDetect, overlay));
}

function mapFormat(format) {
    switch (format) {
        case "qr_code": return "qr";
        case "ean_13": return "ean13";
        case "ean_8": return "ean8";
        case "code_128": return "code128";
        case "upc_a": return "upc";
        default: return "code128";
    }
}

function createOverlay(video, onCancel) {
    const wrapper = document.createElement("div");
    wrapper.className = "scanner-overlay";

    const closeBtn = document.createElement("button");
    closeBtn.className = "scanner-close";
    closeBtn.textContent = "✕";
    closeBtn.onclick = () => {
        cleanup();
        wrapper.remove();
        onCancel?.();
    };

    wrapper.appendChild(video);
    wrapper.appendChild(closeBtn);

    return wrapper;
}

function cleanup() {
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    videoEl = null;
}
