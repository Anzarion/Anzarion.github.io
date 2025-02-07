/**
 * ⏳ timeHelper.js
 * =====================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Stellt Funktionen für Zeitstempel- und Datumsberechnungen bereit.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/timeHelper.js
 * 
 * Funktionen:
 *  - `getCurrentTimestamp()`: Gibt den aktuellen Zeitstempel zurück.
 *  - `isOlderThan(timestamp, hours)`: Prüft, ob ein Zeitstempel älter als eine bestimmte Anzahl von Stunden ist.
 *  - `formatTimestamp(timestamp)`: Wandelt einen Zeitstempel in ein lesbares Datum um.
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version mit Zeitstempel-Berechnungen
 */

const timeHelper = (() => {
    return {
        // Gibt den aktuellen Zeitstempel (UNIX-Zeit in Millisekunden) zurück
        getCurrentTimestamp: function() {
            return Date.now();
        },

        // Prüft, ob ein gegebener Zeitstempel älter als eine bestimmte Anzahl von Stunden ist
        isOlderThan: function(timestamp, hours) {
            const now = Date.now();
            const difference = now - timestamp;
            const hoursInMilliseconds = hours * 60 * 60 * 1000;
            return difference > hoursInMilliseconds;
        },

        // Wandelt einen Zeitstempel in eine lesbare Datums- und Uhrzeitdarstellung um
        formatTimestamp: function(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString("de-DE", { 
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit"
            });
        }
    };
})();
