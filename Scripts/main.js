
// ==UserScript==
// @name         Die Stämme - Hauptskript mit Variablenweitergabe
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Bündelt alle Skripte und leitet die übergebenen Variablen weiter
// @author       Dein Name
// @match        https://zz2.tribalwars.works/game.php?village=*&screen=*
// @grant        none
// ==/UserScript==

// **Konfiguration laden**
let config = window.ScriptConfig || {};

// **Debugging und Logik**
if (config) {
    console.log("Verwendete Konfiguration:", config);
} else {
    console.error("Fehler: Keine Konfiguration gefunden.");
}

// Funktion zum Laden der externen Skripte und Weitergabe der Konfiguration
async function loadExternalScripts() {
    const scripts = [
        { url: "https://anzarion.github.io/Scripts/attackManager.js", config: config },
        { url: "https://anzarion.github.io/Scripts/worldSettings.js", config: config },
        { url: "https://anzarion.github.io/Scripts/reportAnalyzer.js", config: config }
    ];

    try {
        // Alle Skripte nacheinander laden und die Konfiguration weitergeben
        for (const script of scripts) {
            await $.getScript(script.url);
            console.log(`✅ Erfolgreich geladen: ${script.url}`);
            // Die Konfiguration wird hier durch den globalen Namespace weitergegeben
            window.ScriptConfig = script.config;
        }
        console.log("🚀 Alle externen Skripte wurden erfolgreich geladen!");
    } catch (error) {
        console.error("Fehler beim Laden der externen Skripte:", error);
    }
}

// Skripte laden
loadExternalScripts();
