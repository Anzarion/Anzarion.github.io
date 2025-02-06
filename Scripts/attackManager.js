
// ==UserScript==
// @name         Die Stämme - Angriffsanalyse
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Entscheidet, wie die Mauer angegriffen wird (mit Rammböcken oder Katapulten)
// @author       Dein Name
// @match        https://zz2.tribalwars.works/game.php?village=*&screen=*
// @grant        none
// ==/UserScript==

// Hier erhalten wir die Konfiguration von `window.ScriptConfig`
const config = window.ScriptConfig || {};

// Funktion, die entscheidet, wie die Mauer angegriffen wird
function analyzeWallAttack() {
    if (config.wallWithRam) {
        console.log("Die Mauer wird mit Rammböcken angegriffen.");
        // Logik für den Angriff mit Rammböcken
    } else {
        console.log("Die Mauer wird mit Katapulten angegriffen.");
        // Logik für den Angriff mit Katapulten
    }
}

// Die Analyse starten
analyzeWallAttack();
