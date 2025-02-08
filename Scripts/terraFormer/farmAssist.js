/**
 * 📜 farmAssist.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.1
 * Beschreibung: Erfasst Berichte aus dem Farm-Assistenten und speichert relevante Daten im LocalStorage.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/farmAssist.js
 * 
 * Änderungen:
 *  - 1.1.1: Entfernt doppeltes Laden von twSDK (wird jetzt zentral von terraFormer.js verwaltet) und passt den Storage-Zugriff an den neuen storageHelper an.
 *  - 1.1.0: Integriert twSDK für verbesserte Speicherverwaltung und effizientere Verarbeitung.
 *  - 1.0.0: Initiale Version, erkennt Berichte und speichert sie lokal.
 */

(async function () {
    console.log("🌾 Lade farmAssist.js...");

    const STORAGE_KEY = "farmReports";
    const REPORT_SELECTOR = "#plunder_list tr";

    /**
     * Sammelt Berichte aus dem Farm-Assistenten.
     * 
     * @returns {Array<object>} Array der erfassten Berichte.
     */
    function getFarmReports() {
        let reports = [];
        console.log("DEBUG: Suche Berichte mit Selektor:", REPORT_SELECTOR);
        document.querySelectorAll(REPORT_SELECTOR).forEach(row => {
            try {
                const linkElem = row.querySelector("td:nth-child(4) a");
                const timeElem = row.querySelector("td:nth-child(5)");
                const resourcesElem = row.querySelector("td:nth-child(6)");
                const wallElem = row.querySelector("td:nth-child(9)");

                if (linkElem && timeElem) {
                    let id;
                    try {
                        // URL parsen und "view"-Parameter extrahieren
                        id = new URL(linkElem.href).searchParams.get("view");
                        if (!id) {
                            console.warn("DEBUG: Keine ID gefunden in URL:", linkElem.href);
                        }
                    } catch (urlErr) {
                        console.error("DEBUG: Fehler beim Parsen der URL:", linkElem.href, urlErr);
                        return; // Diese Zeile überspringen
                    }

                    // Zeitstring auslesen und in ein Date-Objekt umwandeln
                    const timeStr = timeElem.textContent.trim();
                    const timeDate = new Date(timeStr);
                    if (isNaN(timeDate)) {
                        console.warn("DEBUG: Ungültiges Datum gefunden:", timeStr);
                        return;
                    }

                    // Bericht-Objekt zusammenbauen
                    const report = {
                        id: id,
                        url: linkElem.href,
                        coords: linkElem.textContent.trim(),
                        time: timeDate,
                        hasResources: resourcesElem ? (resourcesElem.textContent.trim() !== "?") : false,
                        hasWallInfo: wallElem ? (wallElem.textContent.trim() !== "?") : false
                    };
                    console.log("DEBUG: Bericht gefunden:", report);
                    reports.push(report);
                } else {
                    console.warn("DEBUG: Link- oder Zeitelement fehlt in Zeile:", row);
                }
            } catch (rowErr) {
                console.error("DEBUG: Fehler beim Verarbeiten einer Zeile:", rowErr);
            }
        });
        console.log("DEBUG: Insgesamt erfasste Berichte:", reports);
        return reports;
    }

    /**
     * Speichert die Berichte im LocalStorage.
     * Es werden nur neue Berichte gespeichert (basierend auf der eindeutigen ID).
     * 
     * @param {Array<object>} reports - Die zu speichernden Berichte.
     */
    function saveReportsToStorage(reports) {
        if (!window.storageHelper) {
            console.error("DEBUG: storageHelper ist nicht verfügbar.");
            return;
        }
        try {
            const storedData = window.storageHelper.loadFromStorage(STORAGE_KEY) || [];
            console.log("DEBUG: Bereits gespeicherte Berichte:", storedData);

            // Filtere Berichte, deren ID noch nicht vorhanden ist
            const newReports = reports.filter(report => !storedData.some(r => r.id === report.id));
            if (newReports.length > 0) {
                const updatedReports = [...storedData, ...newReports];
                window.storageHelper.saveToStorage(STORAGE_KEY, updatedReports);
                console.log(`💾 ${newReports.length} neue Berichte gespeichert.`);
            } else {
                console.log("⚠ Keine neuen Berichte gefunden (alle Berichte bereits gespeichert).");
            }
        } catch (saveErr) {
            console.error("DEBUG: Fehler beim Speichern der Berichte:", saveErr);
        }
    }

    // Hauptablauf: Berichte erfassen und speichern
    try {
        const reports = getFarmReports();
        console.log("DEBUG: Anzahl erfasster Berichte:", reports.length);
        saveReportsToStorage(reports);
    } catch (err) {
        console.error("DEBUG: Fehler im Hauptablauf von farmAssist.js:", err);
    }
})();
