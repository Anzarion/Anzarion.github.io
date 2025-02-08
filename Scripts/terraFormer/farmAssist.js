/**
 * 📜 farmAssist.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.1
 * Beschreibung: Erfasst Berichte aus dem Farm-Assistenten und speichert relevante Daten im LocalStorage.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/farmAssist.js
 * 
 * Änderungen:
 *  - 1.1.1: Anpassung des Storage-Zugriffs auf window.storageHelper sowie Integration von timeHelper zur korrekten Umwandlung relativer Zeitangaben.
 *         Zusätzlich: Filterung von Zeilen ohne notwendige DOM-Elemente und Fallback bei ungültigen Zeitstrings.
 *  - 1.1.0: Integriert twSDK für verbesserte Speicherverwaltung und effizientere Verarbeitung.
 *  - 1.0.0: Initiale Version, erkennt Berichte und speichert sie lokal.
 */

(async function () {
    console.log("🌾 Lade farmAssist.js...");

    const STORAGE_KEY = "farmReports";
    const REPORT_SELECTOR = "#plunder_list tr";

    /**
     * Sammelt Berichte aus dem Farm-Assistenten.
     * Nur Zeilen mit einem Link (Spalte 4) und einem Zeit-Element (Spalte 5) werden berücksichtigt.
     *
     * @returns {Array<object>} Array der erfassten Berichte.
     */
    function getFarmReports() {
        let reports = [];
        console.log("DEBUG: Suche Berichte mit Selektor:", REPORT_SELECTOR);
        document.querySelectorAll(REPORT_SELECTOR).forEach(row => {
            // Überspringe Zeilen, die keine echten Berichts-Daten enthalten (z. B. Header-Zeilen)
            const linkElem = row.querySelector("td:nth-child(4) a");
            const timeElem = row.querySelector("td:nth-child(5)");
            if (!linkElem || !timeElem) {
                console.warn("DEBUG: Link- oder Zeitelement fehlt in Zeile, überspringe:", row);
                return;
            }
            try {
                let id;
                try {
                    // Versuche, den "view"-Parameter aus der URL zu extrahieren
                    id = new URL(linkElem.href).searchParams.get("view");
                    if (!id) {
                        console.warn("DEBUG: Keine ID gefunden in URL:", linkElem.href);
                        return;
                    }
                } catch (urlErr) {
                    console.error("DEBUG: Fehler beim Parsen der URL:", linkElem.href, urlErr);
                    return;
                }

                // Verwende timeHelper, um den Zeitstring zu parsen
                const timeStr = timeElem.textContent.trim();
                console.debug("DEBUG: Verarbeite Zeitstring:", timeStr);
                const timeDate = window.timeHelper && window.timeHelper.parseTimeString 
                    ? window.timeHelper.parseTimeString(timeStr)
                    : new Date(timeStr);
                if (!timeDate || isNaN(timeDate)) {
                    console.warn("DEBUG: Ungültiges Datum gefunden, überspringe Zeile:", timeStr);
                    return;
                }

                // Erstelle das Bericht-Objekt
                const report = {
                    id: id,
                    url: linkElem.href,
                    coords: linkElem.textContent.trim(),
                    time: timeDate,
                    // Ressourcen- und Wand-Informationen optional: Falls das Element fehlt, wird false gesetzt.
                    hasResources: row.querySelector("td:nth-child(6)") ? (row.querySelector("td:nth-child(6)").textContent.trim() !== "?") : false,
                    hasWallInfo: row.querySelector("td:nth-child(9)") ? (row.querySelector("td:nth-child(9)").textContent.trim() !== "?") : false
                };
                console.debug("DEBUG: Bericht gefunden:", report);
                reports.push(report);
            } catch (rowErr) {
                console.error("DEBUG: Fehler beim Verarbeiten einer Zeile:", rowErr);
            }
        });
        console.debug("DEBUG: Insgesamt erfasste Berichte:", reports);
        return reports;
    }

    /**
     * Speichert die Berichte im LocalStorage.
     * Nur neue Berichte (basierend auf der ID) werden hinzugefügt.
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
            console.debug("DEBUG: Bereits gespeicherte Berichte:", storedData);

            // Filtere Berichte heraus, die bereits vorhanden sind (basierend auf ID)
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

    // Hauptablauf: Erfasse Berichte und speichere sie
    try {
        const reports = getFarmReports();
        console.log("DEBUG: Anzahl erfasster Berichte:", reports.length);
        saveReportsToStorage(reports);
    } catch (err) {
        console.error("DEBUG: Fehler im Hauptablauf von farmAssist.js:", err);
    }
})();
