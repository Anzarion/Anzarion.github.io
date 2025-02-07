/**
 * 📜 reportAnalyzer.js
 * =====================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Analysiert Berichte auf der Berichtsübersichtsseite und speichert relevante Daten.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/reportAnalyzer.js
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version, erfasst Berichte und speichert sie im LocalStorage.
 *  - 1.1.0: Integriert twSDK für effizientere LocalStorage-Verwaltung.
 * 
 * =====================
 * // Vorherige Version 1.0.0:
 * (async function() {
 *    console.log("📊 reportAnalyzer.js gestartet");
 *    const STORAGE_KEY = "analyzedReports";
 *    function collectReports() { ... }
 *    function saveReportsToStorage(reports) { ... }
 *    let reports = collectReports();
 *    saveReportsToStorage(reports);
 * })();
 * =====================
 */

(async function () {
    console.log("📊 Lade reportAnalyzer.js...");

    const STORAGE_KEY = "analyzedReports";
    const REPORT_ROW_SELECTOR = "table.vis tr"; // CSS-Selektor für Berichtszeilen

    // Prüfen, ob twSDK geladen ist, falls nicht -> laden
    if (typeof twSDK === "undefined") {
        await $.getScript("https://twscripts.dev/scripts/twSDK.js");
        await twSDK.init({ name: "reportAnalyzer", version: "1.1.0" });
        console.log("✅ twSDK erfolgreich geladen!");
    }

    /**
     * Sammelt relevante Berichts-URLs aus der Berichtsübersicht.
     */
    function collectReports() {
        let reports = [];
        document.querySelectorAll(REPORT_ROW_SELECTOR).forEach(row => {
            let linkElem = row.querySelector("a[href*='screen=report&view=']");
            if (linkElem) {
                let reportId = new URL(linkElem.href).searchParams.get("view");
                let report = {
                    id: reportId,
                    url: linkElem.href,
                    title: linkElem.textContent.trim(),
                    timestamp: Date.now(),
                };
                reports.push(report);
            }
        });

        return reports;
    }

    /**
     * Speichert die Berichts-URLs im LocalStorage, falls sie noch nicht existieren.
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
    let reports = collectReports();
    saveReportsToStorage(reports);

})();
