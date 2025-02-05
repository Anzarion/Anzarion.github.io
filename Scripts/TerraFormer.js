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
var debug = SCRIPT_SETTINGS.debug;

function debugLog(message, data) {
    if (debug) {
        console.log("[DEBUG] " + message, data || "");
    }
}

(function() {
    "use strict";
    
    var isAlreadyStarted = false;

    function loadBuildings() {
        debugLog("Starte das Einlesen der Berichte");
        var reportStr = document.getElementById("attack_spy_building_data")?.value;
        debugLog("Rohdaten des Berichts", reportStr);
        if (!reportStr) {
            UI.ErrorMessage("Der Bericht enthält keine Gebäudeinformationen.");
            return null;
        }
        var report = JSON.parse(reportStr);
        debugLog("Geparster Bericht", report);
        var buildings = {};
        report.forEach(entry => {
            buildings[entry.id] = entry.level;
        });
        debugLog("Extrahierte Gebäudestufen", buildings);
        localStorage.setItem('buildings_data', JSON.stringify(buildings));
        return buildings;
    }

    function cataForLevel(level) {
        var MAP = {
            '1': 2, '2': 2, '3': 2, '4': 3, '5': 3,
            '6': 3, '7': 3, '8': 4, '9': 4, '10': 4,
            '11': 4, '12': 5, '13': 5, '14': 6, '15': 6,
            '16': 6, '17': 7, '18': 8, '19': 8, '20': 9,
            '21': 10, '22': 11, '23': 11, '24': 12, '25': 13,
            '26': 15, '27': 16, '28': 17, '29': 19, '30': 20,
        };
        return MAP[level] || 20;
    }

    function cataChoose(buildings) {
        for (var i = 0; i < buildingIds.length; i++) {
            var bId = buildingIds[i];
            if (buildings[bId] && buildings[bId] > (minLevels[bId] || 0)) {
                var cataCount = cataForLevel(buildings[bId] + (extraCata ? 1 : 0));
                debugLog("Ziel für Katapulte gewählt", {Gebäude: bId, Katapulte: cataCount, Level: buildings[bId]});
                return {'id': bId, 'catapult': cataCount, 'level': buildings[bId], 'nextLevel': buildings[bId] - 1};
            }
        }
        return null;
    }

    function fillCata() {
        var buildings = JSON.parse(localStorage.getItem('buildings_data') || '{}');
        if (!Object.keys(buildings).length) {
            buildings = loadBuildings();
        }
        var cataInfo = cataChoose(buildings);
        if (!cataInfo) {
            UI.SuccessMessage("Kein passendes Gebäude für Katapulte gefunden.");
            return;
        }
        var availableCatapults = parseInt(document.getElementById("units_entry_all_catapult").innerText.replace(/\D/g, ''), 10);
        if (availableCatapults < cataInfo.catapult) {
            UI.ErrorMessage("Nicht genug Katapulte verfügbar!");
            return;
        }
        document.getElementById("unit_input_catapult").value = cataInfo.catapult;
        debugLog("Katapulte gesetzt", cataInfo);
    }

    function run() {
        try {
            debugLog("Starte Skript auf Seite: " + game_data.screen);
            if (game_data.screen === "report" && location.href.indexOf('view') > 0) {
                loadBuildings();
            } else if (game_data.screen === 'place') {
                fillCata();
            } else if (game_data.screen === 'am_farm') {
                debugLog("Farmassistent geöffnet");
            } else if (game_data.screen === 'settings') {
                debugLog("Einstellungen geöffnet");
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
