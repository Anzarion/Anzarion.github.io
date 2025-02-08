/**
 * 📜 storageHelper.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.3.3
 * Beschreibung: Verwaltet LocalStorage-Daten für Berichte und andere Module.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/storageHelper.js
 * 
 * Funktionen:
 *  - Speichert und liest Berichte aus LocalStorage und SessionStorage.
 *  - Unterstützt verschiedene Speichertypen (Permanent, Session, mit Ablaufzeit).
 *  - Verhindert doppelte Einträge durch intelligente Updates.
 *  - Bietet Methoden zum Löschen oder Aktualisieren gespeicherter Daten.
 *  - Nutzt `window.TW_DEBUG`, um Debugging flexibel zu steuern.
 * 
 * Änderungen:
 *  - 1.3.3: **Zentrale Verwaltung von STORAGE_KEYS für alle Skripte hinzugefügt.**
 *  - 1.3.2: Ergänzung von `getStorage()` und `parseJSON()` als Hilfsfunktionen.
 *  - 1.3.1: Verbesserte Logging-Meldungen für TTL-Löschungen, prüft Änderungen vor Updates.
 *  - 1.3.0: Zentraler Debug-Modus über `window.TW_DEBUG` eingeführt.
 *  - 1.2.0: Fügt Unterstützung für TTL (Ablaufzeit) und SessionStorage hinzu.
 *  - 1.1.1: Entfernt doppeltes Laden von twSDK (verwaltet in terraFormer.js).
 *  - 1.1.0: Integriert twSDK für verbesserte Skriptverwaltung.
 *  - 1.0.0: Initiale Version mit LocalStorage-Funktionen.
 */

console.log("💾 storageHelper.js gestartet");

// Standardwert für Debug-Modus setzen
window.TW_DEBUG = window.TW_DEBUG || false;

// 🔹 **Zentrale Verwaltung der Speicher-Schlüssel**
window.STORAGE_KEYS = {
    REPORTS: "analyzedReports",
    UI: "reportUIData",
    ATTACKS: "attackManagerData",
    SETTINGS: "terraFormerSettings"
};

const storageHelper = {
    /**
     * 📦 Speichert beliebige Daten im LocalStorage oder SessionStorage.
     * @param {string} key - Der Schlüssel für die Speicherung.
     * @param {any} value - Der Wert, der gespeichert werden soll.
     * @param {boolean} session - Speichert in `sessionStorage` statt `localStorage`.
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
     * @param {string} key - Der Schlüssel für die Speicherung.
     * @param {boolean} session - Sucht in `sessionStorage`, falls true.
     * @returns {any|null} Der gespeicherte Wert oder `null`, falls nicht vorhanden oder abgelaufen.
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
     * @param {string} key - Der Schlüssel für die Speicherung.
     * @param {boolean} session - Falls true, wird `sessionStorage` genutzt.
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
     * 🔄 Aktualisiert einen Wert im LocalStorage/SessionStorage mit einer Update-Funktion.
     * @param {string} key - Der Schlüssel für die Speicherung.
     * @param {function} updateFunction - Eine Funktion, die den alten Wert verändert.
     * @param {boolean} session - Falls true, wird `sessionStorage` genutzt.
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
     * 📌 Hilfsfunktion zur Auswahl des Speichers (LocalStorage oder SessionStorage).
     * @param {boolean} session - Falls true, wird `sessionStorage` genutzt.
     * @returns {Storage} Der ausgewählte Speicher.
     */
    getStorage: function (session) {
        return session ? sessionStorage : localStorage;
    },

    /**
     * 🔍 Hilfsfunktion zum sicheren Parsen von JSON.
     * @param {string} jsonString - Der zu parsende JSON-String.
     * @returns {any|null} Das geparste Objekt oder null bei Fehler.
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

// **📌 Speicher-Helper global verfügbar machen**
window.storageHelper = storageHelper;
