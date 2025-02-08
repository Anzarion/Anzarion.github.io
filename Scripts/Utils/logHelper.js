/**
 * 📜 logHelper.js
 * ===============
 * Autor:        Anzarion
 * Version:      1.1.1
 * Beschreibung: Logging- und Debugging-Helfer für bessere Fehleranalyse.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/logHelper.js
 * 
 * Funktionen:
 *  - Standardisierte Logging-Funktionen (Info, Warnung, Fehler)
 *  - Möglichkeit zur Aktivierung eines Debug-Modus für erweiterte Logs
 * 
 * Änderungen:
 *  - 1.1.1: Entfernt doppeltes Laden von twSDK (wird jetzt zentral von terraFormer.js verwaltet).
 *  - 1.1.0: Integration von twSDK für erweiterte Debugging-Optionen
 *  - 1.0.0: Initiale Version mit Logging-Funktionen
 */

console.log("📝 logHelper.js gestartet");

const logHelper = {
    debugMode: false, // Debugging standardmäßig deaktiviert

    /**
     * 🟢 Info-Log-Nachricht ausgeben.
     * @param {string} message - Die auszugebende Nachricht.
     */
    info: function (message) {
        console.log(`ℹ️ [INFO]: ${message}`);
    },

    /**
     * 🟡 Warnung-Log-Nachricht ausgeben.
     * @param {string} message - Die auszugebende Warnung.
     */
    warn: function (message) {
        console.warn(`⚠️ [WARNUNG]: ${message}`);
    },

    /**
     * 🔴 Fehler-Log-Nachricht ausgeben.
     * @param {string} message - Die auszugebende Fehlernachricht.
     */
    error: function (message) {
        console.error(`❌ [FEHLER]: ${message}`);
    },

    /**
     * 🔵 Debug-Log-Nachricht ausgeben (nur bei aktiviertem Debug-Modus).
     * @param {string} message - Die auszugebende Debug-Nachricht.
     */
    debug: function (message) {
        if (this.debugMode) {
            console.log(`🐞 [DEBUG]: ${message}`);
        }
    },

    /**
     * 🔄 Debug-Modus umschalten.
     * @param {boolean} status - True = aktivieren, False = deaktivieren.
     */
    toggleDebug: function (status) {
        this.debugMode = status;
        console.log(`🔧 Debug-Modus: ${status ? "AKTIVIERT" : "DEAKTIVIERT"}`);
    }
};

// Objekt global verfügbar machen
window.logHelper = logHelper;
