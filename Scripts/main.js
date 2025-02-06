// ==UserScript==
// @name         Die Stämme - Hauptskript mit erweiterter Funktionalität
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Lädt und verwaltet alle externen Skripte mit Debugging und Konfiguration
// @author       Dein Name
// @match        https://zz2.tribalwars.works/game.php?village=*&screen=*
// @grant        none
// ==/UserScript==

// Standardkonfiguration, die verwendet wird, wenn keine Werte gesetzt sind
const defaultConfig = {
    numScoot: 1, // Beispiel: Anzahl der Späher
    unitUsed: ["axe", "light", "heavy", "sword", "spear"], // Reihenfolge der Einheiten
    buildingIds: ["wall", "smith", "barracks", "snob", "stable", "garage", "market", "farm"], // Reihenfolge der Gebäude
    extraCata: true, // Beispiel: Zusätzliche Katapulte verwenden
    minLevels: { 'farm': 22, 'main': 20 } // Mindestlevel für Gebäude
};

// **Konfiguration laden** (aus `window.ScriptConfig` oder Standardwerte)
let config = window.ScriptConfig || defaultConfig;

// **Debugging und Logik**
if (config) {
    if (config.extraCata) {
        console.log("Zusätzliche Katapulte werden verwendet.");
    }

    // Reihenfolge der Gebäude und Einheiten aus der Konfiguration ausgeben
    console.log("Reihenfolge der Gebäude:", config.buildingIds.join(", "));
    console.log("Reihenfolge der Einheiten:", config.unitUsed.join(", "));
} else {
    console.error("Fehler: Keine Konfiguration gefunden.");
}

// Funktion zum Laden der externen Skripte
async function loadExternalScripts() {
    const scripts = [
        "https://anzarion.github.io/Scripts/attackManager.js",
        "https://anzarion.github.io/Scripts/worldSettings.js",
        "https://anzarion.github.io/Scripts/reportAnalyzer.js"
    ];

    try {
        // Alle Skripte nacheinander laden
        for (const script of scripts) {
            await $.getScript(script);
            console.log(`✅ Erfolgreich geladen: ${script}`);
        }
        console.log("🚀 Alle externen Skripte wurden erfolgreich geladen!");
    } catch (error) {
        console.error("Fehler beim Laden der externen Skripte:", error);
    }
}

// Skripte laden
loadExternalScripts();
