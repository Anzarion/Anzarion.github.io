/**
 * 📜 reportAnalyzer.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.3.1
 * Beschreibung: Analysiert Berichte in der Berichtsübersicht und speichert sie mit dem neuen storageHelper.js.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/reportAnalyzer.js
 * 
 * Änderungen:
 *  - 1.3.1: Integration von `storageHelper.js` für Speicherung & Abruf.
 *  - 1.3.0: Reintegriert spezifische Speicherfunktionen für Berichte.
 *  - 1.2.0: Nutzung von `storageHelper` für LocalStorage-Verwaltung.
 *  - 1.1.0: Erstmalige Integration mit `twSDK`.
 *  - 1.0.0: Initiale Version mit Berichtsanalyse & Speicherung.
 */

console.log("📜 reportAnalyzer.js gestartet");

// Sicherstellen, dass storageHelper verfügbar ist
if (!window.storageHelper) {
    console.error("❌ storageHelper.js nicht geladen! Berichte können nicht gespeichert werden.");
}

// 🔑 Schlüssel für den Speicher (zentrale Definition aus storageHelper.js nutzen)
const STORAGE_KEY = window.STORAGE_KEYS.REPORTS;

/**
 * 🔍 Holt alle gespeicherten Berichte aus dem Speicher.
 * @returns {Array} Gespeicherte Berichte oder leeres Array.
 */
function getReports() {
    return storageHelper.loadFromStorage(STORAGE_KEY) || [];
}

/**
 * 🏰 Extrahiert Berichte aus der Berichtsübersicht
 * @returns {Array} Liste analysierter Berichte
 */
function analyzeReports() {
    let reports = [];
    document.querySelectorAll("#report_list tr").forEach(row => {
        let linkElem = row.querySelector("td:nth-child(3) a");
        let timeElem = row.querySelector("td:nth-child(4)");
        let buildingDataElem = row.querySelector("td:nth-child(5) img");

        if (linkElem && timeElem) {
            let timeText = timeElem.textContent.trim();
            let timestamp = Date.parse(timeText);
            if (isNaN(timestamp)) {
                console.warn(`⚠ Ungültiges Datum gefunden: ${timeText}`);
                return; // oder alternativ: continue;
            }
            let report = {
                url: linkElem.href,
                coords: linkElem.textContent.trim(),
                time: timestamp,
                hasBuildingInfo: !!buildingDataElem,
            };
            reports.push(report);
        }
    });
    return reports;
}


/**
 * 💾 Speichert die Berichte mit `storageHelper`
 */
function saveReports(reports) {
    if (!window.storageHelper) {
        console.error("❌ Speicher-Helper nicht verfügbar, Berichte können nicht gespeichert werden.");
        return;
    }

    let storedReports = getReports();
    let updatedReports = [...storedReports, ...reports];

    // Doppelte URLs vermeiden
    let uniqueReports = Array.from(new Map(updatedReports.map(r => [r.url, r])).values());

    storageHelper.saveToStorage(STORAGE_KEY, uniqueReports);
    console.log(`💾 ${reports.length} Berichte gespeichert.`);
}

// 📜 Starte die Analyse & Speicherung
let reports = analyzeReports();
if (reports.length > 0) {
    saveReports(reports);
} else {
    console.log("⚠ Keine neuen Berichte gefunden.");
}
