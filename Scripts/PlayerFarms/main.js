(function () {
  'use strict';

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
      // Zuerst das twSDK laden
      await loadScript("https://twscripts.dev/scripts/twSDK.js");
      // Dann die generischen Hilfsfunktionen
      await loadScript("https://anzarion.github.io/Scripts/PlayerFarms/Utils/genericHelpers.js");
      // Je nach Seite entweder reportProcessing.js oder farmIntegration.js laden
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
