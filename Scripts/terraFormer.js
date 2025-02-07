/**
 * 📜 terraFormer.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Hauptskript zum Laden aller benötigten Module für das TW-Toolset.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer.js
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version, erkennt FarmAssistent & Berichte automatisch.
 *  - 1.1.0: Integriert twSDK für einheitliches Laden von Modulen.
 *  - 1.1.1: Fix für `twSDK.init()`
 * 
 * =====================
 * // Vorherige Version 1.0.0:
 * (async function() {
 *    console.log("🌍 terraFormer.js gestartet");
 *    async function loadScript(name) { ... }
 *    async function loadModules() { ... }
 *    loadModules().catch(err => console.error(err));
 * })();
 * =====================
 */

(async function () {
    console.log("🌍 Lade terraFormer.js...");

    // Prüfen, ob twSDK geladen ist, falls nicht -> laden
    if (typeof twSDK === "undefined") {
        await $.getScript("https://twscripts.dev/scripts/twSDK.js");
        await twSDK.init({ name: "terraFormer", version: "1.1.0", author: "Anzarion" });
        console.log("✅ twSDK erfolgreich geladen!");
    }

    // Hilfsfunktion zum Laden von Skripten
    async function loadScript(scriptName) {
        return twSDK.loadScript(`https://anzarion.github.io/Scripts/terraFormer/${scriptName}`)
            .then(() => console.log(`✅ Geladen: ${scriptName}`))
            .catch(err => console.error(`❌ Fehler beim Laden von ${scriptName}:`, err));
    }

    // Helferskripte laden
    async function loadHelpers() {
        console.log("📦 Lade Helferskripte...");
        await loadScript("storageHelper.js");
        await loadScript("timeHelper.js");
        await loadScript("uiHelper.js");
        await loadScript("requestHelper.js");
        await loadScript("logHelper.js");
        console.log("✅ Helferskripte geladen");
    }

    // Module je nach Seite laden
    async function loadModules() {
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
    }

    // Starte das Laden aller Skripte
    await loadHelpers();
    await loadModules();
})();
