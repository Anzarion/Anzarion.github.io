/**
 * 📜 farmAssist.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Erfasst Berichte aus dem Farm-Assistenten und speichert relevante Daten im LocalStorage.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/farmAssist.js
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version, erkennt Berichte und speichert sie lokal.
 *  - 1.1.0: Integriert twSDK für verbesserte Speicherverwaltung und effizientere Verarbeitung.
 * 
 * =====================
 * // Vorherige Version 1.0.0:
 * (async function() {
 *    console.log("🌾 farmAssist.js gestartet");
 *    const STORAGE_KEY = "farmReports";
 *    function getFarmReports() { ... }
 *    function saveReportsToStorage(reports) { ... }
 *    let reports = getFarmReports();
 *    saveReportsToStorage(reports);
 * })();
 * =====================
 */

(async function () {
    console.log("🌾 Lade farmAssist.js...");

    const STORAGE_KEY = "farmReports";
    const REPORT_SELECTOR = "#plunder_list tr";

    /**
     * Sammelt Berichte aus dem Farm-Assistenten.
     */
    function getFarmReports() {
        let reports = [];

        document.querySelectorAll(REPORT_SELECTOR).forEach(row => {
            let linkElem = row.querySelector("td:nth-child(4) a");
            let timeElem = row.querySelector("td:nth-child(5)");
            let resourcesElem = row.querySelector("td:nth-child(6)");
            let wallElem = row.querySelector("td:nth-child(9)");

            if (linkElem && timeElem) {
                let report = {
                    id: new URL(linkElem.href).searchParams.get("view"),
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

    /**
     * Speichert die Berichte im LocalStorage.
     */
    function saveReportsToStorage(reports) {
        let storedData = twSDK.getLocalStorage(STORAGE_KEY, []);
        let newReports = reports.filter(report => !storedData.some(r => r.id === report.id));

        if (newReports.length > 0) {
            let updatedReports = [...storedData, ...newReports];
            twSDK.setLocalStorage(STORAGE_KEY, updatedReports);
            console.log(`💾 ${newReports.length} neue Berichte gespeichert.`);
        } else {
            console.log("⚠ Keine neuen Berichte gefunden (bereits gespeichert).");
        }
    }

    // Berichte erfassen & speichern
    let reports = getFarmReports();
    saveReportsToStorage(reports);
})();
