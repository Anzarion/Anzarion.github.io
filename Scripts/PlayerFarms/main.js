(function () {
  'use strict';

  // Konfiguration für twSDK – diese Variable wird dann direkt an twSDK.init übergeben.
  var scriptConfig = {
    scriptData: {
      prefix: 'playerReportsExtractor',
      name: 'Player Reports Extractor',
      version: '0.0.1',
      author: 'Anzarion',
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

  // Mach die Konfiguration global verfügbar
  window.scriptConfig = scriptConfig;
  var currentScriptUrl = (document.currentScript && document.currentScript.src) || '';

  // Hilfsfunktion, um ein Script asynchron zu laden
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Script load error: " + url));
      document.head.appendChild(script);
    });
  }

  async function init() {
    try {
      // Zuerst twSDK laden und dabei die aktuelle Skript-URL als Parameter übergeben:
      await loadScript("https://twscripts.dev/scripts/twSDK.js?url=" + encodeURIComponent(currentScriptUrl));

      // Direkt nach dem Laden von twSDK die Initialisierung mit unserer Konfiguration vornehmen:
      await twSDK.init(scriptConfig);

      // Beispielhafte Prüfung, ob wir uns auf der richtigen Seite befinden:
      if (game_data.screen !== 'am_farm' && (!twSDK.checkValidLocation('screen') || !twSDK.checkValidLocation('mode'))) {
        UI.InfoMessage(twSDK.tt('Redirecting...'));
        twSDK.redirectTo('report&mode=attack');
        return;
      }

      // Als nächstes die generischen Hilfsfunktionen laden:
      await loadScript("https://anzarion.github.io/Scripts/PlayerFarms/Utils/genericHelpers.js");

      // Je nach Seite reportProcessing oder farmIntegration laden:
      if (game_data.screen === 'am_farm') {
        await loadScript("https://anzarion.github.io/Scripts/PlayerFarms/farmIntegration.js");
      } else {
        await loadScript("https://anzarion.github.io/Scripts/PlayerFarms/reportProcessing.js");
      }
    } catch (e) {
      console.error("Fehler bei der Initialisierung:", e);
    }
  }
  init();
})();
