/**
 * 📝 logHelper.js
 * =====================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Stellt Funktionen für einheitliches Logging bereit.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/logHelper.js
 * 
 * Funktionen:
 *  - `logInfo(msg)`: Gibt eine normale Info-Nachricht aus.
 *  - `logWarn(msg)`: Gibt eine Warnung aus.
 *  - `logError(msg)`: Gibt eine Fehlermeldung aus.
 *  - `logDebug(msg)`: Gibt Debug-Informationen aus, wenn Debugging aktiviert ist.
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version mit grundlegenden Log-Methoden.
 */

const logHelper = (() => {
    const DEBUG_MODE = true; // Setze auf false, um Debug-Logs zu deaktivieren

    return {
        logInfo: function(msg) {
            console.log(`ℹ️ [INFO] ${msg}`);
        },

        logWarn: function(msg) {
            console.warn(`⚠️ [WARN] ${msg}`);
        },

        logError: function(msg) {
            console.error(`❌ [ERROR] ${msg}`);
        },

        logDebug: function(msg) {
            if (DEBUG_MODE) console.debug(`🐛 [DEBUG] ${msg}`);
        }
    };
})();
