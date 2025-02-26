// main.js
(function () {
  'use strict';

  // Definiere globales Konfigurationsobjekt (scriptConfig)
  window.scriptConfig = {
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

  var currentScriptUrl = (document.currentScript && document.currentScript.src) || '';

  // Lade zuerst die generischen Hilfsfunktionen
  $.getScript("https://anzarion.github.io/Scripts/PlayerFarms/Utils/genericHelpers.js", function () {
    // Lade twSDK
    $.getScript("https://twscripts.dev/scripts/twSDK.js?url=" + encodeURIComponent(currentScriptUrl), function () {
      twSDK.init(window.scriptConfig).then(function () {
        // Prüfe, ob wir auf der Berichtseite (screen=report) oder Farmseite (am_farm) sind
        if (game_data.screen !== 'am_farm') {
          // Lade reportProcessing.js
          $.getScript("https://anzarion.github.io/Scripts/PlayerFarms/reportProcessing.js");
        } else {
          // Lade farmIntegration.js
          $.getScript("https://anzarion.github.io/Scripts/PlayerFarms/farmIntegration.js");
        }
      }).catch(function (error) {
        console.error("twSDK init Error:", error);
      });
    });
  });
})();
