/**
 * 📜 reportAnalyzer.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.3.0
 * Beschreibung: Analysiert Berichte in der Berichtsübersicht und speichert sie im Storage.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/reportAnalyzer.js
 *
 * Änderungen:
 *  - 1.3.0: Reintegriert spezifische Speicherfunktionen für Berichte.
 *  - 1.2.0: Nutzung von `storageHelper` für LocalStorage-Verwaltung.
 *  - 1.1.0: Erstmalige Integration mit `twSDK`.
 *  - 1.0.0: Initiale Version mit Berichtsanalyse & Speicherung.
 */

console.log("📜 reportAnalyzer.js gestartet");

// **Globale Konstante für den Speicherschlüssel**
const STORAGE_KEY = "analyzedReports";

/**
 * 🔍 Holt alle gespeicherten Berichte aus dem Storage.
 * @returns {Array} Gespeicherte Berichte oder leeres Array.
 */
function getReports() {
    return storageHelper.loadFromStorage(STORAGE_KEY) || [];
}

/**
 * 💾 Speichert neue Berichte im Storage und verhindert doppelte Einträge.
 * @param {Array} reports - Neue Berichte, die gespeichert werden sollen.
 */
function saveReports(reports) {
    let storedReports = getReports();
    let updatedReports = [...storedReports, ...reports];

    // 🛠️ Doppelte Berichte anhand der URL entfernen
    let uniqueReports = Array.from(new Map(updatedReports.map(r => [r.url, r])).values());

    storageHelper.saveToStorage(STORAGE_KEY, uniqueReports);
    console.log(`💾 ${reports.length} neue Berichte gespeichert.`);
}

/**
 * 🗑 Löscht alle gespeicherten Berichte aus dem Storage.
 */
function clearReports() {
    storageHelper.removeFromStorage(STORAGE_KEY);
    console.log("🗑 Alle gespeicherten Berichte wurden gelöscht.");
}

// **Hauptfunktion zur Berichtsanalyse**
function analyzeReports() {
    let reports = [];

    document.querySelectorAll("#report_list tr").forEach(row => {
        let linkElem = row.querySelector("td:nth-child(3) a");
        let timeElem = row.querySelector("td:nth-child(4)");
        let buildingDataElem = row.querySelector("td:nth-child(5) img");

        if (linkElem && timeElem) {
            let report = {
                url: linkElem.href,
                coords: linkElem.textContent.trim(),
                time: new Date(timeElem.textContent.trim()),
                hasBuildingInfo: !!buildingDataElem,
            };
            reports.push(report);
        }
    });

    if (reports.length > 0) {
        saveReports(reports);
    } else {
        console.log("⚠ Keine neuen Berichte gefunden.");
    }
}

// **Automatisch starten**
analyzeReports();
