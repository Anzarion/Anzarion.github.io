// ==UserScript==
// @name         Die Stämme - Main Script
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Lädt und verwaltet alle externen Skripte für Die Stämme mit dynamischer Konfiguration
// @author       Dein Name
// @match        https://zz2.tribalwars.works/game.php?village=*&screen=*
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    // Falls keine Konfiguration existiert, erstelle eine leere
    window.ScriptConfig = window.ScriptConfig || {};

    // Debug-Modus global setzen
    window.MAIN_DEBUG = true;

    console.log("🚀 Main-Skript gestartet. Geladene Konfigurationswerte:", window.ScriptConfig);

    // Liste externer Skripte
    const scripts = [
        "https://anzarion.github.io/Scripts/worldSettings.js", // Welteneinstellungen-Modul
        "https://anzarion.github.io/Scripts/reportAnalyzer.js", // Berichts-Analyser
        "https://anzarion.github.io/Scripts/attackManager.js"  // Angriffs-Manager
    ];

    // Funktion zum Laden eines Skripts
    async function loadScript(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Fehler beim Laden: ${url}`);
            const scriptText = await response.text();
            const scriptElement = document.createElement('script');
            scriptElement.text = scriptText;
            document.body.appendChild(scriptElement); // Skript sicher laden
            console.log(`✅ Erfolgreich geladen: ${url}`);
        } catch (error) {
            console.error(`❌ Fehler beim Laden des Skripts: ${url}`, error);
        }
    }

    // Funktion zum Laden aller Skripte parallel
    async function loadScripts(scripts) {
        try {
            const promises = scripts.map(url => loadScript(url));
            await Promise.all(promises);  // Wartet, bis alle Skripte geladen sind
            console.log("🚀 Alle externen Skripte wurden geladen!");
        } catch (error) {
            console.error("❌ Fehler beim Laden der Skripte:", error);
        }
    }

    // Alle Skripte gleichzeitig laden
    await loadScripts(scripts);
})();
