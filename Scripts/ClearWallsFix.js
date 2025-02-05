// ==UserScript==
// @name         Loot Assistant mit Weiterleitung
// @version      1.0
// @description  Öffnet Angriffsbefehle in neuen Tabs, leitet automatisch auf die Loot Assistant-Seite weiter, falls nötig.
// ==/UserScript==

var WCS = {
  troops: [
    {axe: 40, ram: 4, spy: 1},  // lvl 1
    {axe: 50, ram: 7, spy: 1},  // lvl 2
    {axe: 50, ram: 10, spy: 1}, // lvl 3
    {axe: 80, ram: 16, spy: 1}, // lvl 4
    {axe: 120, ram: 20, spy: 1},// lvl 5
    {axe: 160, ram: 25, spy: 1},// lvl 6
    {axe: 400, ram: 50, spy: 1} // lvl 7+
  ],
  urlCount: 15,      // Anzahl der zu öffnenden Tabs
  newTabWait: 400,   // Wartezeit in Millisekunden zwischen Tabs
  ramGreens: true,   // Angriffe auf grüne Ziele (ohne Verluste) erlauben
};

(() => {
  'use strict';

  // Prüfen, ob die aktuelle URL den benötigten Parameter "am_farm" enthält.
  // Falls nicht, wird automatisch zur Loot Assistant-Seite weitergeleitet.
  if (window.location.href.indexOf("am_farm") < 0) {
    // Hier wird die Basis-URL aus dem globalen game_data-Objekt genommen.
    // Das game_data.link_base_pure liefert den Basislink der aktuellen Spielwelt.
    // Anschließend wird "am_farm" angehängt, sodass die Seite korrekt geladen wird.
    window.location.assign(game_data.link_base_pure + "am_farm");
    return; // Script-Ausführung beenden, da ein Redirect stattfindet.
  }

  console.log('Extracting village info');

  let urls = [];

  // Durchsuche die Tabelle mit der ID "plunder_list"
  $('#plunder_list')
    .find('tr')
    .filter((i, el) => $(el).attr('id')) // Nur Zeilen mit einer ID verarbeiten
    .each((i, el) => {
      // Lese die Wandstufe (wallLevel) aus der 7. Spalte aus
      var wallLevel = $(el).find('td:nth-of-type(7)').text();
      // Lese die URL des Icons aus der 2. Spalte aus
      var iconUrl = $(el).find('td:nth-of-type(2) img').attr('src');
      
      // Überspringe die Zeile, wenn:
      // - Die Wandstufe kleiner als 1 ist
      // - Oder wenn "ramGreens" false ist und das Icon "green.png" enthält
      if (wallLevel < 1 || (!WCS.ramGreens && iconUrl.indexOf('green.png') >= 0)) {
        return;
      }

      // Extrahiere die Dorf-ID aus dem Zeilenattribut
      var id = $(el).attr('id').match(/(\d+)/)[1];
      console.log('Found village ' + id);

      // Extrahiere die aktuelle Dorf-ID (cv) aus der URL
      var cv = /village=(\w+)/.exec(window.location.href)[1];
      // Erstelle den Basis-URL-Pfad für den Angriffsbefehl
      var rp = `/game.php?village=${cv}&screen=place&target=${id}`;

      // Wähle die passende Truppenzusammenstellung anhand der Wandstufe.
      // Falls die Wandstufe höher ist als definiert, wird der letzte Eintrag genutzt.
      var troops = wallLevel <= WCS.troops.length ? WCS.troops[wallLevel - 1] : WCS.troops[WCS.troops.length - 1];

      // Erstelle URL-Parameter aus den Truppenzahlen (z.B. axe=40&ram=4&spy=1)
      var tpParams = Object.keys(troops)
        .map(u => `${u}=${troops[u]}`)
        .join('&');

      // Füge die komplette URL in das Array "urls" ein
      urls.push(`${rp}&${tpParams}`);
    });

  console.log('Made URLs: ', urls);

  // Beschränke die Anzahl der URLs auf WCS.urlCount
  urls = urls.slice(0, WCS.urlCount);

  // Öffne für jede URL einen neuen Tab mit einer Verzögerung
  urls.forEach((url, i) => setTimeout(() => window.open(url, '_blank'), i * WCS.newTabWait));
})();
void(0);
