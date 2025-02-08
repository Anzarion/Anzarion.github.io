/**
 * 📜 terraFormer.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Hauptskript zum Laden aller benötigten Module für das TW-Toolset.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer.js
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version, erkennt FarmAssistent & Berichte automatisch, integriert twSDK für einheitliches Laden von Modulen.
 */

(async function () {
    console.log("🌍 Lade terraFormer.js...");

    // Basis-URLs für verschiedene Skript-Typen
    const HELPER_URL = "https://anzarion.github.io/Scripts/Utils/";
    const MODULE_URL = "https://anzarion.github.io/Scripts/terraFormer/";

    // Prüfen, ob twSDK geladen ist, falls nicht -> laden und initialisieren
    if (typeof twSDK === "undefined") {
        try {
            await $.getScript(`${HELPER_URL}twSDK.js`);
        } catch (error) {
            console.error("❌ Fehler beim Laden von twSDK:", error);
            return; // Abbruch, da twSDK essenziell ist.
        }
        if (typeof twSDK === "undefined") {
            console.error("❌ twSDK konnte nicht geladen werden.");
            return;
        }
        // Konfigurationsobjekt setzen und twSDK initialisieren (Version: 1.0.0)
        window.scriptConfig = { scriptData: { name: "terraFormer", version: "1.0.0" } };
        try {
            await twSDK.init(window.scriptConfig);
        } catch (error) {
            console.error("❌ Fehler bei twSDK.init():", error);
            return;
        }
        console.log(`✅ twSDK geladen: ${twSDK.scriptInfo()}`);
    }

    /**
     * Generische Funktion zum Laden eines Skripts.
     *
     * @param {string} baseUrl - Der Basis-URL, von dem das Skript geladen wird.
     * @param {string} script - Der Dateiname des zu ladenden Skripts.
     * @param {string} label - Ein Label für die Log-Ausgabe (z. B. "Helper" oder "Modul").
     * @returns {Promise<void>}
     */
    const loadScriptGeneric = async (baseUrl, script, label = "Script") => {
        try {
            await $.getScript(`${baseUrl}${script}`);
            console.log(`✅ Geladen (${label}): ${script}`);
        } catch (error) {
            console.error(`❌ Fehler beim Laden von ${label} ${script}:`, error);
            throw error;
        }
    };

    // Spezifische Funktionen, die die generische Funktion nutzen
    const loadHelperScript = async (script) => loadScriptGeneric(HELPER_URL, script, "Helper");
    const loadModuleScript = async (script) => loadScriptGeneric(MODULE_URL, script, "Modul");

    console.log("📦 Lade Helferskripte...");
    try {
        // Lade alle Helferskripte parallel
        await Promise.all([
            "storageHelper.js",
            "timeHelper.js",
            "uiHelper.js",
            "requestHelper.js",
            "logHelper.js"
        ].map(loadHelperScript));
        console.log("✅ Helferskripte geladen");
    } catch (error) {
        console.error("❌ Fehler beim Laden der Helferskripte:", error);
        return;
    }

    // Module je nach aktueller URL laden
    const page = window.location.href;
    if (page.includes("screen=am_farm")) {
        console.log("📌 Farm-Assistent erkannt, lade farmAssist.js");
        try {
            await loadModuleScript("farmAssist.js");
        } catch (error) {
            console.error("❌ Fehler beim Laden von farmAssist.js:", error);
        }
    } else if (page.includes("screen=report")) {
        console.log("📌 Berichtsübersicht erkannt, lade reportAnalyzer.js");
        try {
            // Nur reportAnalyzer.js laden – reportUI.js wird intern von reportAnalyzer.js zur Live-Datenanzeige übernommen.
            await loadModuleScript("reportAnalyzer.js");
        } catch (error) {
            console.error("❌ Fehler beim Laden des Berichtsanalyzers:", error);
        }
    } else {
        console.log("⚠ Unbekannte Seite, keine Module geladen.");
    }
})();
