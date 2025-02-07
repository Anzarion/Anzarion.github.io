/**
 * 📜 terraFormer.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Hauptskript zum Laden aller benötigten Module für das TW-Toolset.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer.js
 * 
 * Struktur:
 *  - Lädt Helferskripte (Storage, Zeit, UI, Requests, Logging)
 *  - Erkennt automatisch die aktuelle Spielseite und lädt passende Module
 * 
 * Benötigt: jQuery
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version, erkennt FarmAssistent & Berichte automatisch
 */

(async function() {
    console.log("🌍 terraFormer.js gestartet");

    // Basis-URL des GitHub-Repos
    const BASE_URL = "https://anzarion.github.io/Scripts/terraFormer/";

    // Funktion zum Laden externer Skripte
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

    // Alle benötigten Module laden
    async function loadModules() {
        console.log("📦 Lade Helferskripte...");
        await loadScript("terraFormer/storageHelper.js");
        await loadScript("terraFormer/timeHelper.js");
        await loadScript("terraFormer/uiHelper.js");
        await loadScript("terraFormer/requestHelper.js");
        await loadScript("terraFormer/logHelper.js");

        console.log("✅ Helferskripte geladen");

        // Aktuelle Seite ermitteln
        const page = window.location.href;

        if (page.includes("screen=am_farm")) {
            console.log("📌 Farm-Assistent erkannt, lade farmAssist.js");
            await loadScript("terraFormer/farmAssist.js");
        } else if (page.includes("screen=report")) {
            console.log("📌 Berichtsübersicht erkannt, lade reportAnalyzer.js & reportUI.js");
            await loadScript("terraFormer/reportAnalyzer.js");
            await loadScript("terraFormer/reportUI.js");
        } else {
            console.log("⚠ Unbekannte Seite, keine Module geladen.");
        }
    }

    // Module laden
    loadModules().catch(err => console.error(err));
})();
