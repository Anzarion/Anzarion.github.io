// ==UserScript==
// @name         Clear Barbarian Walls mit Custom-Units
// @version      1.1
// @description  Öffnet Angriffsbefehle in neuen Tabs, leitet automatisch auf die Loot Assistant-Seite weiter, falls nötig.
// ==/UserScript==

(function() {
  'use strict';

  // Falls UNITS_TO_SEND nicht existiert, Standardwerte setzen
  if (typeof UNITS_TO_SEND === 'undefined') {
    UNITS_TO_SEND = {
      1: '&axe=60&light=4&spy=1',
      2: '&axe=60&light=7&spy=1',
      3: '&axe=60&light=10&spy=1',
      4: '&axe=150&light=15&spy=1',
      5: '&axe=150&light=20&spy=1',
      6: '&axe=150&light=25&spy=1',
      7: '&axe=250&light=30&spy=1',
      8: '&axe=250&light=38&spy=1',
      9: '&axe=500&light=46&spy=1'
    };
  }

  // Falls SCRIPT_SETTINGS nicht existiert, Standardwerte setzen
  if (typeof SCRIPT_SETTINGS === 'undefined') {
    SCRIPT_SETTINGS = {
      urlCount: 15,     // Standard: 15 Tabs
      newTabWait: 400,  // Standard: 400 ms Verzögerung
      ramGreens: true   // Standard: Angriffe auf "grüne" Dörfer erlaubt
    };
  }

  // Falls der Spieler nicht auf der richtigen Seite ist, weiterleiten
  if (window.location.href.indexOf("am_farm") < 0) {
    window.location.assign(game_data.link_base_pure + "am_farm");
    return;
  }

  console.log('Dorf-Infos werden extrahiert...');

  let urls = [];

  // Durchsuche die Tabelle mit Farmzielen
  $('#plunder_list')
    .find('tr')
    .filter((i, el) => $(el).attr('id')) 
    .each((i, el) => {
      var wallLevel = $(el).find('td:nth-of-type(7)').text();
      var iconUrl = $(el).find('td:nth-of-type(2) img').attr('src');

      // Falls das Dorf grün ist und ramGreens false ist, überspringen
      if (wallLevel < 1 || (!SCRIPT_SETTINGS.ramGreens && iconUrl.indexOf('green.png') >= 0)) {
        return;
      }

      var id = $(el).attr('id').match(/(\d+)/)[1];
      console.log('Dorf gefunden: ' + id);

      var cv = /village=(\w+)/.exec(window.location.href)[1];
      var rp = `/game.php?village=${cv}&screen=place&target=${id}`;

      // Wähle die passende Truppenmenge
      var levelInt = parseInt(wallLevel, 10);
      var definedLevels = Object.keys(UNITS_TO_SEND).map(Number);
      var maxLevel = Math.max(...definedLevels);
      var selectedLevel = levelInt <= maxLevel ? levelInt : maxLevel;
      var tpParams = UNITS_TO_SEND[selectedLevel];

      urls.push(`${rp}${tpParams}`);
    });

  console.log('Generierte URLs: ', urls);

  // Beschränke die Anzahl der Tabs
  urls = urls.slice(0, SCRIPT_SETTINGS.urlCount);

  // Öffne die URLs mit Verzögerung
  urls.forEach((url, i) => {
    setTimeout(() => window.open(url, '_blank'), i * SCRIPT_SETTINGS.newTabWait);
  });

})();
void(0);
