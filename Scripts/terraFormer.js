/**
 * 📜 terraFormer.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.2
 * Beschreibung: Hauptskript zum Laden aller benötigten Module für das TW-Toolset.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer.js
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version, erkennt FarmAssistent & Berichte automatisch.
 *  - 1.1.0: Integriert twSDK für einheitliches Laden von Modulen.
 *  - 1.1.1: Fix für `twSDK.init()`, um `scriptConfig` explizit zu setzen.
 *  - 1.1.2: Debug-Logs reduziert & asynchrone Struktur optimiert.
 */

(async function () {
    console.log("🌍 Lade terraFormer.js...");

    // Prüfen, ob twSDK geladen ist, falls nicht -> laden
    if (typeof twSDK === "undefined") {
        await $.getScript("https://twscripts.dev/scripts/twSDK.js");
        window.scriptConfig = { scriptData: { name: "terraFormer", version: "1.1.2" } };
        await twSDK.init(window.scriptConfig);
        console.log(`✅ twSDK geladen: ${twSDK.scriptInfo()}`);
    }

    // Skripte laden
    const loadScript = async (script) => 
        $.getScript(`https://anzarion.github.io/Scripts/terraFormer/${script}`)
            .done(() => console.log(`✅ Geladen: ${script}`))
            .fail(() => console.error(`❌ Fehler beim Laden von ${script}`));

    console.log("📦 Lade Helferskripte...");
    await Promise.all(["storageHelper.js", "timeHelper.js", "uiHelper.js", "requestHelper.js", "logHelper.js"].map(loadScript));
    console.log("✅ Helferskripte geladen");

    // Module je nach Seite laden
    const page = window.location.href;
    if (page.includes("screen=am_farm")) {
        console.log("📌 Farm-Assistent erkannt, lade farmAssist.js");
        await loadScript("farmAssist.js");
    } else if (page.includes("screen=report")) {
        console.log("📌 Berichtsübersicht erkannt, lade reportAnalyzer.js & reportUI.js");
        await loadScript("reportAnalyzer.js");
        await loadScript("reportUI.js");
    } else {
        console.log("⚠ Unbekannte Seite, keine Module geladen.");
    }
})();
