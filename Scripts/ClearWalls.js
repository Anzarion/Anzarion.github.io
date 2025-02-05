// ==UserScript==
// @name         Clear Barbarian Walls mit Custom-Units
// @version      1.2
// @description  Öffnet Angriffsbefehle in neuen Tabs, leitet automatisch auf die Loot Assistant-Seite weiter, falls nötig.
// ==/UserScript==

(function() {
  'use strict';

  // Standardwerte setzen, falls nicht übergeben
  if (typeof SCRIPT_SETTINGS === 'undefined') {
    SCRIPT_SETTINGS = {
      urlCount: 15,
      newTabWait: 400,
      spyCount: 1
    };
  }

  if (typeof UNITS_TO_SEND === 'undefined') {
    UNITS_TO_SEND = {
      1: 'axe=60,ram=4',
      2: 'axe=60,ram=7',
      3: 'axe=60,ram=10',
      4: 'axe=150,ram=15',
      5: 'axe=150,ram=20',
      6: 'axe=150,ram=25',
      7: 'axe=250,ram=30',
      8: 'axe=250,ram=38',
      9: 'axe=500,ram=46'
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
      var wallLevel = parseInt($(el).find('td:nth-of-type(7)').text().trim(), 10);

      if (wallLevel < 1) {
        return;
      }

      var id = $(el).attr('id').match(/(\d+)/)[1];
      console.log('Dorf gefunden: ' + id);

      var cv = /village=(\w+)/.exec(window.location.href)[1];
      var rp = `/game.php?village=${cv}&screen=place&target=${id}`;

      // Truppen für das Wall Level bestimmen
      var unitString = UNITS_TO_SEND[wallLevel] || UNITS_TO_SEND[Object.keys(UNITS_TO_SEND).length];

      // Einheiten auswaehlen, & hinzufuegen
      var tpParams = unitString.split(',').map(u => `&${u}`).join('');
      tpParams += `&spy=${SCRIPT_SETTINGS.spyCount}`;

      urls.push(`${rp}${tpParams}`);
    });

  console.log('Generierte URLs: ', urls);

  urls = urls.slice(0, SCRIPT_SETTINGS.urlCount);

  urls.forEach((url, i) => {
    setTimeout(() => window.open(url, '_blank'), i * SCRIPT_SETTINGS.newTabWait);
  });

})();
void(0);

