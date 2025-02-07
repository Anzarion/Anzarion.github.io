/**
 * 💾 storageHelper.js
 * =====================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Stellt Funktionen zum Speichern und Laden von Daten im localStorage bereit.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/storageHelper.js
 * 
 * Funktionen:
 *  - `saveToStorage(key, data)`: Speichert Daten im localStorage.
 *  - `loadFromStorage(key)`: Lädt Daten aus dem localStorage.
 *  - `clearStorage(key)`: Löscht einen bestimmten Eintrag im localStorage.
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version mit Grundfunktionen für Speicherverwaltung
 */

const storageHelper = (() => {
    return {
        // Speichert Daten im localStorage unter einem bestimmten Schlüssel
        saveToStorage: function(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                console.log(`💾 Gespeichert unter: ${key}`, data);
            } catch (error) {
                console.error(`❌ Fehler beim Speichern in localStorage: ${error}`);
            }
        },

        // Lädt Daten aus dem localStorage, falls vorhanden
        loadFromStorage: function(key) {
            try {
                let data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error(`❌ Fehler beim Laden aus localStorage: ${error}`);
                return null;
            }
        },

        // Löscht einen bestimmten Schlüssel aus dem localStorage
        clearStorage: function(key) {
            try {
                localStorage.removeItem(key);
                console.log(`🗑 Gelöscht: ${key}`);
            } catch (error) {
                console.error(`❌ Fehler beim Löschen aus localStorage: ${error}`);
            }
        }
    };
})();
