
// ==UserScript==
// @name         Die Stämme - Angriffsmanager
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Verwaltet die Angriffsplanung und -ausführung
// @author       Dein Name
// @match        https://zz2.tribalwars.works/game.php?village=*&screen=*
// @grant        none
// ==/UserScript==

// Direkt auf die globalen Variablen zugreifen
console.log("Verwendete Konfiguration:", window.ScriptConfig);

// Logik für die Entscheidung, wie die Mauer angegriffen wird
function analyzeWallAttack() {
    if (window.ScriptConfig.wallWithRam) {
        console.log("Die Mauer wird mit Rammböcken angegriffen.");
    } else {
        console.log("Die Mauer wird mit Katapulten angegriffen.");
    }
}

// Die Analyse starten
analyzeWallAttack();
