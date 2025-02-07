/**
 * 📜 reportUI.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Erstellt ein UI-Overlay zur Anzeige der analysierten Berichte.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/reportUI.js
 * 
 * Funktionen:
 *  - Erstellt eine UI-Box zur Anzeige von Berichtszahlen
 *  - Listet Berichte mit und ohne Gebäudedaten getrennt auf
 *  - Ermöglicht das erneute Scannen von Berichten oder das Senden von Spähern
 * 
 * Änderungen:
 *  - 1.1.0: Integriert twSDK für verbesserte Skriptverwaltung
 *  - 1.0.0: Initiale Version mit UI-Overlay und Buttons
 */

// Warten, bis twSDK geladen ist, dann das Skript starten
$.getScript(`https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`, async function () {
    await twSDK.init({ name: "Report UI", version: "1.1.0", author: "Anzarion" });

    console.log("📜 reportUI.js gestartet");

    const STORAGE_KEY = "analyzedReports";

    // Funktion zum Erstellen des UI-Overlays
    function createUI(reportData) {
        let existingUI = document.getElementById("reportAnalyzerUI");
        if (existingUI) existingUI.remove(); // Vorheriges UI löschen

        let uiBox = document.createElement("div");
        uiBox.id = "reportAnalyzerUI";
        uiBox.style = `
            position: fixed; top: 100px; right: 10px; width: 200px;
            background: #f4e4bc; border: 2px solid #5c4828; padding: 10px;
            z-index: 9999; font-size: 12px; overflow-y: auto; max-height: 400px;
        `;

        uiBox.innerHTML = `
            <h4>📜 Berichte</h4>
            ✅ Gebäudeinfos: ${reportData.reportsWithBuildings.length} <br>
            ❌ Ohne Infos: ${reportData.reportsWithoutBuildings.length} <br><br>
            <button id="loadOverlayReports">🔍 Overlays</button>
            <button id="sendScouts">🕵️ Spähen</button>
        `;

        document.body.appendChild(uiBox);

        document.getElementById("loadOverlayReports").addEventListener("click", () => {
            console.log("🔄 Berichte-Overlays laden... (noch nicht implementiert)");
        });

        document.getElementById("sendScouts").addEventListener("click", () => {
            console.log("🚀 Späher werden vorbereitet... (noch nicht implementiert)");
        });
    }

    // Funktion zum Laden der gespeicherten Berichte
    function loadReports() {
        let storedReports = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        let reportsWithBuildings = storedReports.filter(r => r.hasBuildingInfo);
        let reportsWithoutBuildings = storedReports.filter(r => !r.hasBuildingInfo);

        createUI({ reportsWithBuildings, reportsWithoutBuildings });
    }

    // UI anzeigen
    loadReports();
});
