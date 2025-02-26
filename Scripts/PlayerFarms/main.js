// main.js
(function () {
  'use strict';

  // Zentrale Konfiguration (wird an alle Module übergeben)
  var scriptConfig = {
    scriptData: {
      prefix: 'playerReportsExtractor',
      name: 'Player Reports Extractor',
      version: '1.0.7',
      author: 'DeinName',
      authorUrl: 'https://example.com',
      helpLink: 'https://example.com/hilfe'
    },
    translations: {
      en_DK: {
        'Player Reports Extractor': 'Player Reports Extractor',
        'Redirecting...': 'Redirecting...',
        'There was an error!': 'There was an error!'
      },
      de_DE: {
        'Player Reports Extractor': 'Player Reports Extractor',
        'Redirecting...': 'Weiterleiten...',
        'There was an error!': 'Es ist ein Fehler aufgetreten!'
      }
    },
    allowedMarkets: [],
    allowedScreens: ['report'],
    allowedModes: ['attack', 'all'],
    isDebug: false,
    enableCountApi: true,
  };

  window.scriptConfig = scriptConfig;
  var currentScriptUrl = (document.currentScript && document.currentScript.src) || '';

  // Zunächst das twSDK laden (wie bisher)
  $.getScript("https://twscripts.dev/scripts/twSDK.js?url=" + encodeURIComponent(currentScriptUrl), function () {
    twSDK.init(scriptConfig).then(function () {

      // Danach die generischen Hilfsfunktionen laden
      $.getScript("https://anzarion.github.io/Scripts/PlayerFarms/Utils/genericHelpers.js", function () {

        // Nun abhängig von der aktuellen Seite
        if (game_data.screen !== 'am_farm') {
          // Auf der Berichtseite: reportProcessing.js laden und ausführen
          $.getScript("https://anzarion.github.io/Scripts/PlayerFarms/reportProcessing.js", function () {
            // Angenommen, reportProcessing.js stellt eine Funktion ReportProcessing.processReports() bereit:
            ReportProcessing.processReports();
          });
        } else {
          // Auf der am_farm-Seite: farmIntegration.js laden und ausführen
          $.getScript("https://anzarion.github.io/Scripts/PlayerFarms/farmIntegration.js", function () {
            // Nehme an, farmIntegration.js stellt die Funktion FarmIntegration.integrateReportsIntoFarmTable() bereit.
            // Hier werden dann die gespeicherten Berichte aus dem localStorage geladen:
            // Wir können den Berichtscache (z. B. über ReportProcessing.getStoredReports()) abrufen.
            // Falls diese Funktion in reportProcessing.js definiert ist, könntest du sie auch hier exportieren.
            // Alternativ implementieren wir auch hier eine getStoredReports()-Funktion, oder wir nutzen den bereits globalen Cache.
            const storedReports = localStorage.getItem('playerReports') ? JSON.parse(localStorage.getItem('playerReports')) : [];
            FarmIntegration.integrateReportsIntoFarmTable(storedReports);
          });
        }

      });
    }).catch(function (error) {
      GenericHelpers.handleError(error);
    });
  });
})();
