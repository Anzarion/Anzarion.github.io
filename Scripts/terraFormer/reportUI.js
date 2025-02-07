/**
 * 🖥 reportUI.js
 * =====================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Erstellt ein Overlay im Spiel, um die gesammelten Berichte anzuzeigen.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/reportUI.js
 * 
 * Funktionen:
 *  - Zeigt eine kompakte UI für gesammelte Berichte
 *  - Unterscheidet zwischen Berichten mit/ohne Gebäudedaten
 *  - Bietet Buttons für Overlay-Laden & Späher-Angriffe
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version mit UI-Anzeige und Buttons
 */

(async function() {
    console.log("🖥 reportUI.js gestartet");

    const STORAGE_KEY = "farmReports";

    // Funktion zum Laden der gespeicherten Berichte
    function loadReportsFromStorage() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    // Funktion zum Erstellen des Overlays
    function createReportUI() {
        let reports = loadReportsFromStorage();
        let reportsWithBuildings = reports.filter(r => r.hasBuildings);
        let reportsWithoutBuildings = reports.filter(r => !r.hasBuildings);

        // Falls UI bereits existiert, entfernen
        let existingUI = document.getElementById("reportUI");
        if (existingUI) existingUI.remove();

        // UI-Element erstellen
        let uiBox = document.createElement("div");
        uiBox.id = "reportUI";
        uiBox.style.position = "fixed";
        uiBox.style.top = "100px";
        uiBox.style.right = "10px";
        uiBox.style.width = "200px";
        uiBox.style.background = "#f4e4bc";
        uiBox.style.border = "2px solid #5c4828";
        uiBox.style.padding = "10px";
        uiBox.style.zIndex = "9999";
        uiBox.style.fontSize = "12px";
        uiBox.style.overflow = "hidden";

        // UI-Inhalt setzen
        uiBox.innerHTML = `
            <h4>📜 Berichte</h4>
            ✅ Gebäudeinfos: ${reportsWithBuildings.length}<br>
            ❌ Ohne Infos: ${reportsWithoutBuildings.length}<br>
            <button id="loadOverlays">🔍 Overlays</button>
            <button id="sendScouts">🕵️ Spähen</button>
        `;

        document.body.appendChild(uiBox);

        // Button-Events
        document.getElementById("loadOverlays").addEventListener("click", () => {
            console.log("🔄 Berichte-Overlays laden... (noch nicht implementiert)");
        });

        document.getElementById("sendScouts").addEventListener("click", () => {
            console.log("🚀 Späher schicken... (noch nicht implementiert)");
        });
    }

    // UI erstellen
    createReportUI();
})();
