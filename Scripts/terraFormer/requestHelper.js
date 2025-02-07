/**
 * 🌐 requestHelper.js
 * =====================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Stellt Funktionen zur Durchführung von HTTP-Requests bereit.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/requestHelper.js
 * 
 * Funktionen:
 *  - `fetchHTML(url)`: Lädt HTML-Inhalte einer Seite per Fetch-Request.
 *  - `fetchJSON(url)`: Führt einen HTTP-Request aus und gibt die JSON-Daten zurück.
 *  - `postData(url, data)`: Sendet Daten per POST an eine API oder ein Script.
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version mit grundlegenden HTTP-Methoden.
 */

const requestHelper = (() => {
    return {
        // Lädt HTML-Inhalte von einer URL
        fetchHTML: async function(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Fehler beim Abrufen von ${url}`);
                return await response.text();
            } catch (error) {
                console.error(`❌ fetchHTML Fehler: ${error}`);
                return null;
            }
        },

        // Lädt JSON-Daten von einer API oder einem Endpunkt
        fetchJSON: async function(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Fehler beim Abrufen von ${url}`);
                return await response.json();
            } catch (error) {
                console.error(`❌ fetchJSON Fehler: ${error}`);
                return null;
            }
        },

        // Sendet JSON-Daten per POST-Request
        postData: async function(url, data) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                return await response.json();
            } catch (error) {
                console.error(`❌ postData Fehler: ${error}`);
                return null;
            }
        }
    };
})();
