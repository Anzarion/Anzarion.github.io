/**
 * 📜 storageHelper.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.3.2
 * Beschreibung: Verwaltet Storage-Daten für Scripte und Module.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/storageHelper.js
 * 
 * Funktionen:
 *  - Unterstützt verschiedene Speichertypen (Permanent, Session, mit Ablaufzeit)
 *  - Verhindert doppelte Einträge durch intelligente Updates
 *  - Bietet Methoden zum Löschen oder Aktualisieren gespeicherter Daten
 *  - Nutzt `window.TW_DEBUG`, um Debugging flexibel zu steuern
 * 
 * Änderungen:
 *  - 1.3.2: Fügt zentrale **Speicherverwaltungsmethoden** (`getStorage`, `parseJSON`) hinzu.
 *  - 1.3.1: **Optimierung des Update-Mechanismus**, bessere Debug-Logs für TTL-Löschungen.
 *  - 1.3.0: **Zentraler Debug-Modus** über `window.TW_DEBUG` eingeführt.
 *  - 1.2.0: **Unterstützung für TTL (Ablaufzeit) und SessionStorage** hinzugefügt.
 *  - 1.1.1: Entfernt doppeltes Laden von twSDK (verwaltet in terraFormer.js).
 *  - 1.1.0: Integriert twSDK für verbesserte Skriptverwaltung.
 *  - 1.0.0: Initiale Version mit LocalStorage-Funktionen.
 */

console.log("💾 storageHelper.js gestartet");

// Standardwert für Debug-Modus setzen
window.TW_DEBUG = window.TW_DEBUG || false;

const storageHelper = {
    /**
     * 📦 Speichert Daten im LocalStorage oder SessionStorage.
     * @param {string} key - Schlüssel für die Speicherung.
     * @param {any} value - Wert, der gespeichert werden soll.
     * @param {boolean} session - Falls true, wird SessionStorage genutzt.
     * @param {number|null} ttl - Optional: Ablaufzeit in Millisekunden.
     */
    saveToStorage: function (key, value, session = false, ttl = null) {
        try {
            const storage = this.getStorage(session);
            let storedValue = { data: value };
            if (ttl) storedValue.expiry = Date.now() + ttl;
            storage.setItem(key, JSON.stringify(storedValue));

            if (window.TW_DEBUG) console.log(`💾 Gespeichert: ${key} (${session ? "SessionStorage" : "LocalStorage"})`);
        } catch (error) {
            console.error(`❌ Fehler beim Speichern von ${key}:`, error);
        }
    },

    /**
     * 🔍 Lädt Daten aus LocalStorage oder SessionStorage.
     * @param {string} key - Speicher-Schlüssel.
     * @param {boolean} session - Falls true, wird SessionStorage genutzt.
     * @returns {any|null} Gespeicherter Wert oder `null`, falls nicht vorhanden oder abgelaufen.
     */
    loadFromStorage: function (key, session = false) {
        try {
            const storage = this.getStorage(session);
            let storedValue = storage.getItem(key);
            if (!storedValue) {
                if (window.TW_DEBUG) console.warn(`⚠ ${key} nicht gefunden.`);
                return null;
            }

            let parsedValue = this.parseJSON(storedValue);
            if (!parsedValue) return null;

            if (parsedValue.expiry && Date.now() > parsedValue.expiry) {
                this.removeFromStorage(key, session);
                if (window.TW_DEBUG) console.warn(`⚠ ${key} ist abgelaufen und wurde entfernt.`);
                return null;
            }
            return parsedValue.data;
        } catch (error) {
            console.error(`❌ Fehler beim Laden von ${key}:`, error);
            return null;
        }
    },

    /**
     * 🗑 Löscht Daten aus LocalStorage oder SessionStorage.
     * @param {string} key - Speicher-Schlüssel.
     * @param {boolean} session - Falls true, wird SessionStorage genutzt.
     */
    removeFromStorage: function (key, session = false) {
        try {
            const storage = this.getStorage(session);
            storage.removeItem(key);
            if (window.TW_DEBUG) console.log(`🗑 Gelöscht: ${key} (${session ? "SessionStorage" : "LocalStorage"})`);
        } catch (error) {
            console.error(`❌ Fehler beim Löschen von ${key}:`, error);
        }
    },

    /**
     * 🔄 Aktualisiert einen Wert im Speicher mit einer Update-Funktion.
     * @param {string} key - Speicher-Schlüssel.
     * @param {function} updateFunction - Funktion, die den alten Wert verändert.
     * @param {boolean} session - Falls true, wird SessionStorage genutzt.
     */
    updateStorage: function (key, updateFunction, session = false) {
        try {
            let existingData = this.loadFromStorage(key, session);
            if (existingData === null) return;

            let updatedData = updateFunction(existingData);
            if (JSON.stringify(updatedData) === JSON.stringify(existingData)) {
                if (window.TW_DEBUG) console.log(`🔄 Keine Änderung für ${key}, kein Speichern nötig.`);
                return;
            }

            this.saveToStorage(key, updatedData, session);
            if (window.TW_DEBUG) console.log(`🔄 Aktualisiert: ${key}`);
        } catch (error) {
            console.error(`❌ Fehler beim Aktualisieren von ${key}:`, error);
        }
    },

    /**
     * 📦 Wählt den passenden Speicher (LocalStorage oder SessionStorage).
     * @param {boolean} session - Falls true, wird SessionStorage genutzt.
     * @returns {Storage} Der ausgewählte Speicher.
     */
    getStorage: function (session) {
        return session ? sessionStorage : localStorage;
    },

    /**
     * 🛠 Hilfsfunktion zum sicheren Parsen von JSON.
     * @param {string} jsonString - Der zu parsende JSON-String.
     * @returns {any|null} Das geparste Objekt oder `null` bei Fehler.
     */
    parseJSON: function (jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error(`❌ Fehler beim Parsen von JSON:`, error);
            return null;
        }
    }
};

// Global verfügbar machen
window.storageHelper = storageHelper;