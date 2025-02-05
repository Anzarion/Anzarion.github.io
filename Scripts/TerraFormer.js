/*
    Erstellt von: Anzarion
    Skriptname: TerraFormer
*/

// ----------------------- Schnellleisten-Eintrag -----------------------

javascript:
var SCRIPT_SETTINGS = {
    debug: true,
    numScoot: 4,       // Anzahl der Späher
    extraCata: true    // Zusätzliche Katapulte aktivieren
};

var ATTACK_CONFIG = {
    unitUsed: ["axe", "light", "heavy", "sword", "spear"],  // Begleitsoldaten
    buildingIds: ["wall", "smith", "barracks", "snob", "stable", "garage", "market", "farm"], // Zielgebäude
    minLevels: {'farm': 22, 'main': 20} // Mindestlevel der Gebäude
};

$.getScript('https://anzarion.github.io/Scripts/TerraFormer.js');

// ----------------------- Benutzereinstellungen -----------------------

var numScoot = SCRIPT_SETTINGS.numScoot;
var unitUsed = ATTACK_CONFIG.unitUsed;
var buildingIds = ATTACK_CONFIG.buildingIds;
var extraCata = SCRIPT_SETTINGS.extraCata;
var minLevels = ATTACK_CONFIG.minLevels;

// Debugging aktivieren/deaktivieren
var debug = SCRIPT_SETTINGS.debug; // Falls true, werden Debug-Informationen in der Konsole ausgegeben

/**
 * Funktion zum Loggen von Debug-Nachrichten
 */
function debugLog(message, data) {
    if (debug) {
        console.log("[DEBUG] " + message, data || "");
    }
}

(function() {
    "use strict";
    
    var isAlreadyStarted = false;

    /**
     * Lädt die Berichte aus der Spionageseite
     */
    async function loadReports() {
        try {
            const response = await fetch('/game.php?screen=report&mode=spy');
            if (!response.ok) {
                throw new Error('Fehler beim Laden der Berichte');
            }
            const text = await response.text();
            debugLog('Berichte erfolgreich geladen', text);
            return text;
        } catch (error) {
            console.error('Fehler beim Abrufen der Berichte:', error);
            return null;
        }
    }

    /**
     * Hauptfunktion des Skripts - Führt je nach Seite unterschiedliche Funktionen aus.
     */
    async function run() {
        try {
            debugLog("Starte Skript auf Seite: " + game_data.screen);
            if (game_data.screen === "report" && location.href.indexOf('view') > 0) {
                await loadReports();
            } else if (game_data.screen === 'place') {
                fillCata();
            } else if (game_data.screen === 'am_farm' || game_data.screen === 'report') {
                // Farmberichte speichern
            } else if (game_data.screen === 'settings') {
                // Konfigurationsmenü aufrufen
            } else {
                UI.ErrorMessage('Das Skript muss von einem Spionagebericht oder dem Farmassistenten aus gestartet werden.');
                return;
            }
        } catch (e) {
            UI.ErrorMessage("Fehler: " + e.message);
            console.error(e);
        }
    }

    run();
}());
