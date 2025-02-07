/**
 * 📜 farmAssist.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Erfasst Berichte aus dem Farm-Assistenten und speichert relevante Daten im LocalStorage.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/farmAssist.js
 * 
 * Änderungen:
 *  - 1.1.0: Integriert twSDK für effizientere LocalStorage-Verwaltung.
 */

(async function () {
    console.log("🌾 Lade farmAssist.js...");

    const STORAGE_KEY = "farmReports";
    const REPORT_SELECTOR = "#plunder_list tr";

    // Prüfen, ob twSDK bereits geladen ist, falls nicht -> laden
    if (typeof twSDK === "undefined") {
        await $.getScript("https://twscripts.dev/scripts/twSDK.js");
        await twSDK.init({ name: "farmAssist", version: "1.1.0" });
        console.log("✅ twSDK erfolgreich geladen!");
    }

    /**
     * Funktion zum Abrufen der Berichte aus dem Farm-Assistenten.
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
     * Speichert Berichte im LocalStorage, wenn sie nicht bereits existieren.
     */
    function saveReportsToStorage(reports) {
        let storedData = twSDK.getLocalStorage(STORAGE_KEY, []);
        let newReports = reports.filter(report => !storedData.some(r => r.url === report.url));

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
