// main.js
(function () {
  'use strict';

  var currentScriptUrl = (document.currentScript && document.currentScript.src) || '';

  // Lade genericHelpers.js
  $.getScript("https://anzarion.github.io/Scripts/PlayerFarms/Utils/genericHelpers.js", function () {
    // Lade twSDK
    $.getScript("https://twscripts.dev/scripts/twSDK.js?url=" + encodeURIComponent(currentScriptUrl), function () {
      twSDK.init(window.scriptConfig || {}).then(function () {
        // Prüfe, ob wir auf der Berichtseite (screen=report) oder auf der Farmseite (am_farm) sind
        if (game_data.screen !== 'am_farm') {
          // Berichtverarbeitung laden
          $.getScript("https://anzarion.github.io/Scripts/PlayerFarms/reportProcessing.js");
        } else {
          // Farm-Integration laden
          $.getScript("https://anzarion.github.io/Scripts/PlayerFarms/farmIntegration.js");
        }
      }).catch(function (error) {
        console.error("twSDK init Error:", error);
      });
    });
  });
})();
