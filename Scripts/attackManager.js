// ==UserScript==
// @name         Die Stämme - Angriffsmanager
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Verwaltet die Angriffsplanung und -ausführung
// @author       Dein Name
// @match        https://zz2.tribalwars.works/game.php?village=*&screen=*
// @grant        none
// ==/UserScript==

// Funktion zum loggen von Debugging-Informationen
function logDebug(message) {
    if (window.ScriptConfig.DEBUG_MODE) {
        console.log(message);
    }
}

// Direkt auf die globalen Variablen zugreifen
logDebug("Verwendete Konfiguration: " + JSON.stringify(window.ScriptConfig));

// Logik für die Entscheidung, wie die Mauer angegriffen wird
function analyzeWallAttack() {
    if (window.ScriptConfig.wallWithRam) {
        logDebug("Die Mauer wird mit Rammböcken angegriffen.");
    } else {
        logDebug("Die Mauer wird mit Katapulten angegriffen.");
    }
}

// Die Analyse starten
analyzeWallAttack();
