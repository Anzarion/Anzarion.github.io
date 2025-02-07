/**
 * 📜 terraFormer.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Hauptskript zum Laden aller benötigten Module für das TW-Toolset.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer.js
 * 
 * Struktur:
 *  - Lädt `twSDK.js`, falls nicht vorhanden
 *  - Lädt Helferskripte (Storage, Zeit, UI, Requests, Logging)
 *  - Erkennt automatisch die aktuelle Spielseite und lädt passende Module
 * 
 * Benötigt: jQuery, twSDK
 * 
 * Änderungen:
 *  - 1.1.0: Nutzung von `twSDK.js`, bessere Kompatibilität mit Spiel-CSP
 */

(async function () {
    console.log("🌍 terraFormer.js gestartet");

    const BASE_URL = "https://anzarion.github.io/Scripts/terraFormer/";
    const SDK_URL = "https://twscripts.dev/scripts/twSDK.js";

    // Prüfen, ob `twSDK` bereits geladen ist
    if (typeof twSDK === "undefined") {
        console.log("🔄 Lade twSDK...");
        await new Promise((resolve, reject) => {
            $.getScript(SDK_URL, function () {
                console.log("✅ twSDK geladen!");
                resolve();
            }).fail(() => reject("❌ Fehler beim Laden von twSDK"));
        });
    }

    // Initialisiere `twSDK`
    await twSDK.init({ name: "terraFormer", version: "1.1.0", author: "Anzarion" });

    // Funktion zum Laden externer Skripte über `twSDK`
    async function loadScript(name) {
        return new Promise((resolve, reject) => {
            $.getScript(BASE_URL + name)
                .done(() => {
                    console.log(`✅ Geladen: ${name}`);
                    resolve();
                })
                .fail(() => reject(`❌ Fehler beim Laden von ${name}`));
        });
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

    // Module basierend auf aktueller Seite laden
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

    // Skripte laden
    try {
        await loadHelpers();
        await loadModules();
        console.log("✅ terraFormer vollständig geladen!");
    } catch (error) {
        console.error(error);
    }
})();
