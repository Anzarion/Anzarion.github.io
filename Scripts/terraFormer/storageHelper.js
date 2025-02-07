/**
 * 📜 storageHelper.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Verwaltet LocalStorage-Daten für Berichte und andere Module.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/storageHelper.js
 * 
 * Funktionen:
 *  - Speichert und liest Berichte aus dem LocalStorage
 *  - Verhindert doppelte Einträge durch intelligente Updates
 *  - Bietet Methoden zum Löschen oder Aktualisieren gespeicherter Daten
 * 
 * Änderungen:
 *  - 1.1.0: Integriert twSDK für verbesserte Skriptverwaltung
 *  - 1.0.0: Initiale Version mit LocalStorage-Funktionen
 */

console.log("💾 storageHelper.js gestartet");

const STORAGE_KEY = "analyzedReports";

const storageHelper = {
    /**
     * 🔍 Holt alle gespeicherten Berichte aus dem LocalStorage.
     * @returns {Array} Gespeicherte Berichte oder leeres Array
     */
    getReports: function () {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    },

    /**
     * 💾 Speichert neue Berichte im LocalStorage, verhindert doppelte Einträge.
     * @param {Array} reports - Neue Berichte, die gespeichert werden sollen.
     */
    saveReports: function (reports) {
        let storedReports = storageHelper.getReports();
        let updatedReports = [...storedReports, ...reports];

        // Doppelte URLs entfernen
        let uniqueReports = Array.from(new Map(updatedReports.map(r => [r.url, r])).values());

        localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueReports));
        console.log(`💾 ${reports.length} neue Berichte gespeichert.`);
    },

    /**
     * 🗑 Löscht alle gespeicherten Berichte aus dem LocalStorage.
     */
    clearReports: function () {
        localStorage.removeItem(STORAGE_KEY);
        console.log("🗑 Alle gespeicherten Berichte wurden gelöscht.");
    }
};

// Objekt global verfügbar machen
window.storageHelper = storageHelper;
