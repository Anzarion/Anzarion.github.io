/**
 * 📜 storageHelper.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Verwaltet LocalStorage-Daten.
 * GitHub:       https://anzarion.github.io/Scripts/Utils/storageHelper.js
 * 
 * Funktionen:
 *  - Speichert und liest Daten aus LocalStorage und SessionStorage.
 *  - Unterstützt verschiedene Speichertypen (Permanent, Session, mit Ablaufzeit).
 *  - Verhindert doppelte Einträge durch intelligente Updates.
 *  - Bietet Methoden zum Löschen oder Aktualisieren gespeicherter Daten.
 *  - Nutzt `window.TW_DEBUG`, um Debugging flexibel zu steuern.
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version mit verbesserten Funktionen, ES6-Konformität, Eingabevalidierung und verbessertem Logging.
 */

(function(global) {
    'use strict';

    // Setze Standardwert für den Debug-Modus, falls nicht bereits vorhanden.
    global.TW_DEBUG = global.TW_DEBUG || false;

    /**
     * Konfigurierbarer Logger (Standard: console). Kann über configure() überschrieben werden.
     * @type {object}
     */
    const defaultLogger = console;

    /**
     * Fallback-In-Memory-Speicher, falls localStorage/sessionStorage nicht verfügbar sind.
     * @type {object}
     */
    const inMemoryStorage = {
        _data: {},
        setItem: (key, value) => { inMemoryStorage._data[key] = value; },
        getItem: (key) => (Object.prototype.hasOwnProperty.call(inMemoryStorage._data, key) ? inMemoryStorage._data[key] : null),
        removeItem: (key) => { delete inMemoryStorage._data[key]; },
        clear: () => { inMemoryStorage._data = {}; },
        key: (index) => Object.keys(inMemoryStorage._data)[index] || null,
        get length() { return Object.keys(inMemoryStorage._data).length; }
    };

    /**
     * Hilfsfunktion zur einheitlichen Fehlerbehandlung.
     * Protokolliert den Fehler mit Kontextinformationen.
     *
     * @param {string} operation - Bezeichnung der Operation (z. B. "saveToStorage").
     * @param {string} key - Der betroffene Schlüssel.
     * @param {Error} error - Der gefangene Fehler.
     */
    function _handleError(operation, key, error) {
        defaultLogger.error(`[${operation}] Fehler für Schlüssel "${key}":`, error);
    }

    const storageHelper = {
        /**
         * Konfigurierbarer Logger; standardmäßig console.
         * @type {object}
         */
        logger: defaultLogger,

        /**
         * Internes Objekt zur Speicherung von Event-/Callback-Handlern.
         * @type {object}
         */
        _callbacks: {},

        /**
         * Serialisiert Daten in einen String. Standardmäßig wird JSON verwendet.
         * @param {any} data - Die zu serialisierenden Daten.
         * @returns {string} Der serialisierte String.
         */
        serializer(data) {
            return JSON.stringify(data);
        },

        /**
         * Deserialisiert einen String in ein Objekt. Standardmäßig wird JSON verwendet.
         * @param {string} dataString - Der zu deserialisierende String.
         * @returns {any} Das deserialisierte Objekt.
         */
        deserializer(dataString) {
            return JSON.parse(dataString);
        },

        /**
         * Optionale Verschlüsselungsfunktion. Standardmäßig deaktiviert (Identitätsfunktion).
         * @type {function|null}
         */
        encrypt: null,

        /**
         * Optionale Entschlüsselungsfunktion. Standardmäßig deaktiviert (Identitätsfunktion).
         * @type {function|null}
         */
        decrypt: null,

        // ---------------- Callback-Mechanismus ----------------

        /**
         * Registriert einen Callback für ein bestimmtes Event.
         * @param {string} event - Name des Ereignisses (z. B. "save", "update", "remove").
         * @param {function} callback - Die Callback-Funktion, die aufgerufen wird.
         */
        registerCallback(event, callback) {
            if (typeof event !== "string" || event.trim() === "") {
                this.logger.error("[registerCallback] Ungültiger Ereignisname:", event);
                return;
            }
            if (typeof callback !== "function") {
                this.logger.error("[registerCallback] Callback muss eine Funktion sein.");
                return;
            }
            if (!this._callbacks[event]) {
                this._callbacks[event] = [];
            }
            this._callbacks[event].push(callback);
        },

        /**
         * Entfernt einen registrierten Callback für ein bestimmtes Event.
         * @param {string} event - Name des Ereignisses.
         * @param {function} callback - Die zu entfernende Callback-Funktion.
         */
        unregisterCallback(event, callback) {
            if (typeof event !== "string" || event.trim() === "") {
                this.logger.error("[unregisterCallback] Ungültiger Ereignisname:", event);
                return;
            }
            if (typeof callback !== "function") {
                this.logger.error("[unregisterCallback] Callback muss eine Funktion sein.");
                return;
            }
            if (!this._callbacks[event]) return;
            const index = this._callbacks[event].indexOf(callback);
            if (index !== -1) {
                this._callbacks[event].splice(index, 1);
            }
        },

        /**
         * Löst ein Event aus und ruft alle registrierten Callbacks auf.
         * @param {string} event - Name des Ereignisses.
         * @param {object} details - Zusätzliche Details, die an die Callback-Funktionen übergeben werden.
         * @private
         */
        _triggerEvent(event, details) {
            if (this._callbacks && this._callbacks[event]) {
                this._callbacks[event].forEach((cb) => {
                    try {
                        cb(details);
                    } catch (e) {
                        this.logger.error(`[${event} Callback] Fehler:`, e);
                    }
                });
            }
        },

        // ---------------- Speichern/Laden/Löschen ----------------

        /**
         * Speichert beliebige Daten im localStorage oder sessionStorage.
         * Unterstützt TTL (Ablaufzeit) und optionale Verschlüsselung.
         *
         * @param {string} key - Der Schlüssel für die Speicherung.
         * @param {any} value - Der zu speichernde Wert.
         * @param {boolean} [session=false] - Falls true, wird sessionStorage verwendet.
         * @param {number|null} [ttl=null] - Optional: Ablaufzeit in Millisekunden.
         */
        saveToStorage(key, value, session = false, ttl = null) {
            if (typeof key !== "string" || key.trim() === "") {
                this.logger.error("[saveToStorage] Ungültiger Schlüssel:", key);
                return;
            }
            if (ttl !== null && typeof ttl !== "number") {
                this.logger.error("[saveToStorage] TTL muss eine Zahl oder null sein. Schlüssel:", key);
                return;
            }
            try {
                const storage = this.getStorage(session);
                const storedValue = { data: value };
                if (ttl) storedValue.expiry = Date.now() + ttl;
                let stringData = this.serializer(storedValue);
                if (this.encrypt && typeof this.encrypt === "function") {
                    stringData = this.encrypt(stringData);
                }
                storage.setItem(key, stringData);
                if (global.TW_DEBUG) this.logger.log(`[saveToStorage] Gespeichert: ${key} (${session ? "SessionStorage" : "LocalStorage"})`);
                this._triggerEvent("save", { key, value, session });
            } catch (error) {
                _handleError("saveToStorage", key, error);
            }
        },

        /**
         * Lädt Daten aus dem localStorage oder sessionStorage.
         * Berücksichtigt TTL und optionale Verschlüsselung.
         *
         * @param {string} key - Der Schlüssel für die Speicherung.
         * @param {boolean} [session=false] - Falls true, wird sessionStorage verwendet.
         * @returns {any|null} Der gespeicherte Wert oder null, falls nicht vorhanden/abgelaufen.
         */
        loadFromStorage(key, session = false) {
            if (typeof key !== "string" || key.trim() === "") {
                this.logger.error("[loadFromStorage] Ungültiger Schlüssel:", key);
                return null;
            }
            try {
                const storage = this.getStorage(session);
                let storedValue = storage.getItem(key);
                if (!storedValue) {
                    if (global.TW_DEBUG) this.logger.warn(`[loadFromStorage] ${key} nicht gefunden.`);
                    return null;
                }
                if (this.decrypt && typeof this.decrypt === "function") {
                    storedValue = this.decrypt(storedValue);
                }
                const parsedValue = this.deserializer(storedValue);
                if (!parsedValue) return null;
                if (parsedValue.expiry && Date.now() > parsedValue.expiry) {
                    this.removeFromStorage(key, session);
                    if (global.TW_DEBUG) this.logger.warn(`[loadFromStorage] ${key} ist abgelaufen und wurde entfernt.`);
                    return null;
                }
                return parsedValue.data;
            } catch (error) {
                _handleError("loadFromStorage", key, error);
                return null;
            }
        },

        /**
         * Entfernt einen Eintrag aus dem localStorage oder sessionStorage.
         *
         * @param {string} key - Der Schlüssel des zu löschenden Eintrags.
         * @param {boolean} [session=false] - Falls true, wird sessionStorage verwendet.
         */
        removeFromStorage(key, session = false) {
            if (typeof key !== "string" || key.trim() === "") {
                this.logger.error("[removeFromStorage] Ungültiger Schlüssel:", key);
                return;
            }
            try {
                const storage = this.getStorage(session);
                storage.removeItem(key);
                if (global.TW_DEBUG) this.logger.log(`[removeFromStorage] Gelöscht: ${key} (${session ? "SessionStorage" : "LocalStorage"})`);
                this._triggerEvent("remove", { key, session });
            } catch (error) {
                _handleError("removeFromStorage", key, error);
            }
        },

        /**
         * Aktualisiert einen bestehenden Eintrag im Storage mithilfe einer Update-Funktion.
         *
         * @param {string} key - Der Schlüssel für den Eintrag.
         * @param {function} updateFunction - Funktion, die den alten Wert transformiert.
         * @param {boolean} [session=false] - Falls true, wird sessionStorage verwendet.
         */
        updateStorage(key, updateFunction, session = false) {
            if (typeof key !== "string" || key.trim() === "") {
                this.logger.error("[updateStorage] Ungültiger Schlüssel:", key);
                return;
            }
            if (typeof updateFunction !== "function") {
                this.logger.error("[updateStorage] updateFunction muss eine Funktion sein.");
                return;
            }
            try {
                const existingData = this.loadFromStorage(key, session);
                if (existingData === null) return;
                const updatedData = updateFunction(existingData);
                if (JSON.stringify(updatedData) === JSON.stringify(existingData)) {
                    if (global.TW_DEBUG) this.logger.log(`[updateStorage] Keine Änderung für ${key}, kein Speichern nötig.`);
                    return;
                }
                this.saveToStorage(key, updatedData, session);
                if (global.TW_DEBUG) this.logger.log(`[updateStorage] Aktualisiert: ${key}`);
                this._triggerEvent("update", { key, oldValue: existingData, newValue: updatedData, session });
            } catch (error) {
                _handleError("updateStorage", key, error);
            }
        },

        // ---------------- Storage-Zugriff und Fallback ----------------

        /**
         * Gibt das verwendete Storage-Objekt zurück (localStorage/sessionStorage).
         * Falls der native Storage nicht verfügbar ist, wird ein In-Memory-Speicher genutzt.
         *
         * @param {boolean} [session=false] - Falls true, wird sessionStorage genutzt.
         * @returns {Storage|object} Das verwendete Storage-Objekt.
         */
        getStorage(session = false) {
            try {
                const storage = session ? global.sessionStorage : global.localStorage;
                storage.setItem("__storage_test", "test");
                storage.removeItem("__storage_test");
                return storage;
            } catch (e) {
                if (global.TW_DEBUG) this.logger.warn("[getStorage] Native Storage nicht verfügbar, verwende In-Memory-Speicher.");
                return inMemoryStorage;
            }
        },

        // ---------------- Automatische Bereinigung ----------------

        /**
         * Durchsucht den Storage und entfernt alle abgelaufenen Einträge.
         *
         * @param {boolean} [session=false] - Falls true, wird sessionStorage genutzt.
         * @returns {string[]} Array der entfernten Schlüssel.
         */
        cleanupStorage(session = false) {
            const storage = this.getStorage(session);
            const keysToRemove = [];
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                const value = storage.getItem(key);
                let parsed;
                try {
                    parsed = this.deserializer(value);
                } catch (e) {
                    continue; // Überspringen, falls Format nicht passt
                }
                if (parsed && parsed.expiry && Date.now() > parsed.expiry) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((key) => {
                this.removeFromStorage(key, session);
            });
            if (keysToRemove.length > 0 && global.TW_DEBUG) {
                this.logger.log(`[cleanupStorage] Entfernt: ${keysToRemove.length} abgelaufene Einträge.`);
            }
            this._triggerEvent("cleanup", { removed: keysToRemove });
            return keysToRemove;
        },

        // ---------------- Erweiterte Abfragefunktionen ----------------

        /**
         * Durchsucht den Storage anhand einer Filterfunktion.
         *
         * @param {function} filterFn - Funktion, die (key, value) entgegennimmt und true zurückgibt, wenn das Element in die Ergebnisse soll.
         * @param {boolean} [session=false] - Falls true, wird sessionStorage genutzt.
         * @returns {Array<{key: string, value: any}>} Array der gefundenen Objekte.
         */
        queryStorage(filterFn, session = false) {
            if (typeof filterFn !== "function") {
                this.logger.error("[queryStorage] Filterfunktion muss eine Funktion sein.");
                return [];
            }
            const storage = this.getStorage(session);
            const results = [];
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                const value = storage.getItem(key);
                let parsed;
                try {
                    parsed = this.deserializer(value);
                } catch (e) {
                    parsed = null;
                }
                if (filterFn(key, parsed)) {
                    results.push({ key, value: parsed });
                }
            }
            return results;
        },

        /**
         * Gibt alle Schlüssel des Storages zurück.
         *
         * @param {boolean} [session=false] - Falls true, wird sessionStorage genutzt.
         * @returns {string[]} Array der Schlüssel.
         */
        getAllKeys(session = false) {
            const storage = this.getStorage(session);
            const keys = [];
            for (let i = 0; i < storage.length; i++) {
                keys.push(storage.key(i));
            }
            return keys;
        },

        /**
         * Gibt alle Einträge des Storages als Objekt zurück.
         *
         * @param {boolean} [session=false] - Falls true, wird sessionStorage genutzt.
         * @returns {object} Objekt mit Schlüssel-Wert-Paaren.
         */
        getAllItems(session = false) {
            const storage = this.getStorage(session);
            const items = {};
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                items[key] = storage.getItem(key);
            }
            return items;
        },

        // ---------------- Konfigurationsmethode ----------------

        /**
         * Konfiguriert globale Einstellungen für den storageHelper.
         *
         * @param {object} options - Konfigurationsoptionen.
         * @param {function} [options.serializer] - Eigene Serializer-Funktion.
         * @param {function} [options.deserializer] - Eigene Deserializer-Funktion.
         * @param {function} [options.encrypt] - Optionale Verschlüsselungsfunktion.
         * @param {function} [options.decrypt] - Optionale Entschlüsselungsfunktion.
         * @param {boolean} [options.debug] - Debug-Modus ein-/ausschalten.
         * @param {object} [options.logger] - Eigener Logger (muss über log, warn, error verfügen).
         */
        configure(options = {}) {
            if (options.serializer && typeof options.serializer === 'function') {
                this.serializer = options.serializer;
            }
            if (options.deserializer && typeof options.deserializer === 'function') {
                this.deserializer = options.deserializer;
            }
            if (options.encrypt && typeof options.encrypt === 'function') {
                this.encrypt = options.encrypt;
            }
            if (options.decrypt && typeof options.decrypt === 'function') {
                this.decrypt = options.decrypt;
            }
            if (options.debug !== undefined) {
                global.TW_DEBUG = options.debug;
            }
            if (options.logger && typeof options.logger === "object") {
                this.logger = options.logger;
            }
        }
    };

    // ---------------- Synchronisation zwischen Tabs ----------------

    if (global.addEventListener) {
        global.addEventListener('storage', (e) => {
            storageHelper._triggerEvent("externalChange", {
                key: e.key,
                oldValue: e.oldValue,
                newValue: e.newValue,
                url: e.url,
                storageArea: e.storageArea
            });
        });
    }

    // ---------------- Global verfügbar machen ----------------

    if (!global.storageHelper) {
        global.storageHelper = storageHelper;
    } else {
        storageHelper.logger.warn("storageHelper ist bereits definiert. Überschreiben wird vermieden.");
    }

})(typeof window !== "undefined" ? window : this);
