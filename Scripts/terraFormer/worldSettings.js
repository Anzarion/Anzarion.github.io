/**
 * 📜 worldSettings.js
 * ==================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Lädt und speichert Weltdaten (Gebäude, Einheiten, Einstellungen).
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/worldSettings.js
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version, lädt Welt-Daten über API.
 *  - 1.1.0: Anpassung an twSDK zur effizienten Datenverwaltung.
 * 
 * =====================
 * // Vorherige Version 1.0.0:
 * (async function() {
 *    function fetchWorldData() { ... }
 *    fetchWorldData();
 * })();
 * =====================
 */

(async function () {
    console.log("🌍 Lade worldSettings.js...");

    /**
     * Ruft die Weltdaten von der API ab und speichert sie im LocalStorage.
     */
    async function fetchWorldData() {
        console.log("📡 Rufe Weltdaten ab...");
        try {
            const response = await twSDK.request.get("/interface.php?func=get_config");
            twSDK.storage.set("worldConfig", response);
            console.log("✅ Weltdaten gespeichert:", response);
        } catch (error) {
            console.error("❌ Fehler beim Abrufen der Weltdaten:", error);
        }
    }

    // Welt-Daten nur einmal am Tag abrufen
    const lastUpdate = twSDK.storage.get("worldConfigLastUpdate") || 0;
    if (Date.now() - lastUpdate > 86400000) { // 24 Stunden
        await fetchWorldData();
        twSDK.storage.set("worldConfigLastUpdate", Date.now());
    } else {
        console.log("⏳ Welt-Daten wurden bereits heute aktualisiert.");
    }
})();
