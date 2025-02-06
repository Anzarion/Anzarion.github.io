// ==UserScript==
// @name         Die Stämme - Main Script
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Lädt und verwaltet alle externen Skripte für Die Stämme mit dynamischer Konfiguration
// @author       Dein Name
// @match        https://zz2.tribalwars.works/game.php?village=*&screen=*
// @grant        none

(async function() {
    'use strict';

    // Falls keine Konfiguration existiert, erstelle eine leere
    window.ScriptConfig = window.ScriptConfig || {};

    // Debug-Modus global setzen
    window.MAIN_DEBUG = true;

    console.log("🚀 Main-Skript gestartet. Geladene Konfigurationswerte:", window.ScriptConfig);

    // Liste externer Skripte aus dem GitHub-Repository
    const scripts = [
        "https://anzarion.github.io/Scripts/worldSettings.js",
        "https://anzarion.github.io/Scripts/reportAnalyzer.js",
        "https://anzarion.github.io/Scripts/attackManager.js"
    ];

    // Funktion zum Laden von Skripten
    async function loadScript(url) {
        try {
            let response = await fetch(url);
            if (!response.ok) throw new Error(`Fehler beim Laden: ${url}`);
            let scriptText = await response.text();
            eval(scriptText);
            console.log(`✅ Erfolgreich geladen: ${url}`);
        } catch (error) {
            console.error(`❌ Fehler beim Laden des Skripts: ${url}`, error);
        }
    }

    // Alle Skripte nacheinander laden
    for (let script of scripts) {
        await loadScript(script);
    }

    console.log("🚀 Alle externen Skripte wurden geladen!");

})();
