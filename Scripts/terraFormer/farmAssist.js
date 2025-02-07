/**
 * 📜 farmAssist.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Erfasst Berichte aus dem Farm-Assistenten und speichert relevante Daten im LocalStorage.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/farmAssist.js
 * 
 * Funktionen:
 *  - Liest Berichte auf der Farm-Assistent-Seite aus
 *  - Unterscheidet zwischen Berichten mit/ohne Gebäudedaten
 *  - Speichert die relevanten Daten im LocalStorage
 *  - Markiert bereits gespeicherte Berichte, um doppelte Abfragen zu vermeiden
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version, erkennt Berichte und speichert diese lokal
 */

(async function() {
    console.log("🌾 farmAssist.js gestartet");

    const STORAGE_KEY = "farmReports";
    const REPORT_SELECTOR = "#plunder_list tr"; // CSS-Selektor für Berichtszeilen

    // Funktion zum Abrufen der Berichte aus dem Farm-Assistenten
    function getFarmReports() {
        let reports = [];
        
        document.querySelectorAll(REPORT_SELECTOR).forEach(row => {
            let linkElem = row.querySelector("td:nth-child(4) a");
            let timeElem = row.querySelector("td:nth-child(5)");
            let resourcesElem = row.querySelector("td:nth-child(6)");
            let wallElem = row.querySelector("td:nth-child(9)");

            if (linkElem && timeElem) {
                let report = {
                    url: linkElem.href,
                    coords: linkElem.textContent.trim(),
                    time: new Date(timeElem.textContent.trim()),
                    hasResources: resourcesElem && resourcesElem.textContent.trim() !== "?",
                    hasWallInfo: wallElem && wallElem.textContent.trim() !== "?",
                };
                reports.push(report);
            }
        });

        return reports;
    }

    // Funktion zum Speichern der Berichte im LocalStorage
    function saveReportsToStorage(reports) {
        let storedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        let updatedReports = [...storedData, ...reports];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
        console.log(`💾 ${reports.length} neue Berichte gespeichert.`);
    }

    // Berichte erfassen & speichern
    let reports = getFarmReports();
    if (reports.length > 0) {
        saveReportsToStorage(reports);
    } else {
        console.log("⚠ Keine neuen Berichte gefunden.");
    }
})();
