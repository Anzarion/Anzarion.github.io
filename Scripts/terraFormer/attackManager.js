/**
 * 📜 attackManager.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Steuert das Versenden von Angriffen, insbesondere Späherangriffe auf Barbarendörfer.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/attackManager.js
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version, ermöglicht das Versenden von Spähern.
 *  - 1.1.0: Anpassung an twSDK zum standardisierten Skriptladen.
 * 
 * =====================
 * // Vorherige Version 1.0.0:
 * (async function() {
 *    function sendScouts(villageId) { ... }
 *    function startScouting() { ... }
 *    startScouting();
 * })();
 * =====================
 */

(async function () {
    console.log("⚔️ Lade attackManager.js...");

    // Sicherstellen, dass twSDK geladen ist
    if (typeof twSDK === "undefined") {
        await $.getScript("https://twscripts.dev/scripts/twSDK.js");
        await twSDK.init({ name: "attackManager", version: "1.1.0" });
        console.log("✅ twSDK erfolgreich geladen!");
    }

    /**
     * Sendet Späherangriffe auf ein angegebenes Dorf.
     * @param {number} villageId - ID des Dorfes
     */
    async function sendScouts(villageId) {
        console.log(`🕵️ Sende Späher zu Dorf ${villageId}...`);
        // Hier kann später eine AJAX-Anfrage für das Senden implementiert werden
    }

    /**
     * Startet den Spähprozess für alle Dörfer ohne Gebäudedaten.
     */
    async function startScouting() {
        let reports = twSDK.storage.get("farmReports") || [];
        let villagesToScout = reports.filter(report => !report.hasBuildings);

        console.log(`📋 Spähen von ${villagesToScout.length} Dörfern geplant.`);
        villagesToScout.forEach(village => sendScouts(village.id));
    }

    startScouting();
})();
