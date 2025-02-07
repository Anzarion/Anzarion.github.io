/**
 * 📜 reportAnalyzer.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Analysiert Berichte in der Berichtsübersicht und speichert sie im LocalStorage.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/reportAnalyzer.js
 * 
 * Funktionen:
 *  - Liest Berichte auf der Berichtsübersicht aus
 *  - Unterscheidet zwischen Berichten mit/ohne Gebäudedaten
 *  - Speichert relevante Berichte im LocalStorage für den Angriffmanager
 * 
 * Änderungen:
 *  - 1.1.0: Anpassung an terraFormer-Struktur mit twSDK
 *  - 1.0.0: Initiale Version mit Berichtsanalyse & Speicherung
 */

(async function () {
    console.log("📜 reportAnalyzer.js gestartet");

    // Sicherstellen, dass twSDK geladen ist
    await twSDK.init();

    // LocalStorage Key für Berichte
    const STORAGE_KEY = "analyzedReports";

    // Selektor für Berichtszeilen in der Übersicht
    const REPORT_SELECTOR = "#report_list tr";

    // Funktion zum Analysieren der Berichte
    function analyzeReports() {
        let reports = [];
        
        document.querySelectorAll(REPORT_SELECTOR).forEach(row => {
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

        return reports;
    }

    // Funktion zum Speichern der analysierten Berichte
    function saveReports(reports) {
        let storedReports = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        let updatedReports = [...storedReports, ...reports];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
        console.log(`💾 ${reports.length} Berichte gespeichert.`);
    }

    // Berichte erfassen & speichern
    let reports = analyzeReports();
    if (reports.length > 0) {
        saveReports(reports);
    } else {
        console.log("⚠ Keine neuen Berichte gefunden.");
    }
})();
