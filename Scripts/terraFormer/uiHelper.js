/**
 * 📜 uiHelper.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Hilfsfunktionen zur Erstellung von UI-Elementen.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/uiHelper.js
 * 
 * Funktionen:
 *  - Erstellt modale UI-Boxen für Skript-Overlays
 *  - Generiert Buttons für Benutzeraktionen
 *  - Bietet ein flexibles Layout für Spiel-Overlays
 * 
 * Änderungen:
 *  - 1.1.0: Integration von twSDK für verbesserte Struktur & Skriptverwaltung
 *  - 1.0.0: Initiale Version mit UI-Funktionen
 */

console.log("🎨 uiHelper.js gestartet");

const uiHelper = {
    /**
     * 📦 Erstellt eine UI-Box (z. B. für Overlays).
     * @param {string} title - Titel der UI-Box.
     * @param {string} content - HTML-Inhalt der Box.
     * @param {string} id - Eindeutige ID für die Box.
     * @returns {HTMLElement} Das erstellte UI-Element.
     */
    createBox: function (title, content, id = "customUIBox") {
        let existingBox = document.getElementById(id);
        if (existingBox) existingBox.remove();

        let box = document.createElement("div");
        box.id = id;
        box.style.position = "fixed";
        box.style.top = "100px";
        box.style.right = "10px";
        box.style.width = "250px";
        box.style.background = "#f4e4bc";
        box.style.border = "2px solid #5c4828";
        box.style.padding = "10px";
        box.style.zIndex = "9999";
        box.style.fontSize = "12px";
        box.style.overflowY = "auto";
        box.style.maxHeight = "400px";

        box.innerHTML = `
            <h4>${title}</h4>
            <div>${content}</div>
            <button onclick="document.getElementById('${id}').remove()">❌ Schließen</button>
        `;

        document.body.appendChild(box);
        return box;
    },

    /**
     * 🔘 Erstellt einen Button mit einer Aktion.
     * @param {string} text - Button-Beschriftung.
     * @param {function} onClick - Funktion, die beim Klick ausgeführt wird.
     * @returns {HTMLElement} Der Button.
     */
    createButton: function (text, onClick) {
        let button = document.createElement("button");
        button.innerText = text;
        button.style.margin = "5px";
        button.style.padding = "5px";
        button.style.cursor = "pointer";
        button.onclick = onClick;
        return button;
    }
};

// Objekt global verfügbar machen
window.uiHelper = uiHelper;
