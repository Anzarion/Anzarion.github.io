/**
 * 📜 attackManager.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.1
 * Beschreibung: Steuert das Versenden von Angriffen, insbesondere Späherangriffe auf Barbarendörfer.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/attackManager.js
 * 
 * Änderungen:
 *  - 1.1.1: Entfernt doppeltes Laden von twSDK (wird jetzt zentral von terraFormer.js verwaltet).
 *  - 1.1.0: Anpassung an twSDK zum standardisierten Skriptladen.
 *  - 1.0.0: Initiale Version, ermöglicht das Versenden von Spähern.
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
