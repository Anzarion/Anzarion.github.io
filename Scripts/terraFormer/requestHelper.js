/**
 * 📜 requestHelper.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Hilfsfunktionen für AJAX- und API-Anfragen.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/requestHelper.js
 * 
 * Funktionen:
 *  - Führt GET- und POST-Anfragen mit Fetch API durch
 *  - Stellt flexible Wrapper für API-Anfragen bereit
 * 
 * Änderungen:
 *  - 1.1.0: Integration von twSDK für verbesserte Struktur & Fehlerbehandlung
 *  - 1.0.0: Initiale Version mit Basis-GET- und POST-Methoden
 */

console.log("📡 requestHelper.js gestartet");

const requestHelper = {
    /**
     * 📨 Führt eine GET-Anfrage durch.
     * @param {string} url - Die URL der Anfrage.
     * @returns {Promise<any>} Die Antwort der Anfrage.
     */
    get: async function (url) {
        try {
            let response = await fetch(url, { method: "GET", credentials: "include" });
            if (!response.ok) throw new Error(`❌ Fehler bei GET ${url}`);
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    /**
     * 📤 Führt eine POST-Anfrage durch.
     * @param {string} url - Die URL der Anfrage.
     * @param {Object} data - Die zu sendenden Daten.
     * @returns {Promise<any>} Die Antwort der Anfrage.
     */
    post: async function (url, data) {
        try {
            let response = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`❌ Fehler bei POST ${url}`);
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
};

// Objekt global verfügbar machen
window.requestHelper = requestHelper;
