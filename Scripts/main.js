// ==UserScript==
// @name         Die Stämme - Hauptskript mit Variablenweitergabe und Debug-Modus
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Bündelt alle Skripte und leitet die übergebenen Variablen weiter
// @author       Dein Name
// @match        https://zz2.tribalwars.works/game.php?village=*&screen=*
// @grant        none
// ==/UserScript==

// Zugriff auf die globalen Variablen im `window.ScriptConfig`
console.log("Verwendete Konfiguration:", window.ScriptConfig);

// Debugging basierend auf `DEBUG_MODE`
if (window.ScriptConfig.DEBUG_MODE) {
    console.log("Debugging ist aktiviert.");
} else {
    console.log("Debugging ist deaktiviert.");
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
