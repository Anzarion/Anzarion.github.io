const DEBUG = window.DEBUG ?? false; // Debug-Modus aktivieren (true/false)

// **Modul: Laden & Speichern der Welteinstellungen**
const WorldConfig = {
    config: null,
    isLoading: false,

    async fetchAndStoreConfig(url, key) {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        } else {
            const response = await fetch(url);
            const text = await response.text();
            const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
            const data = this.xmlConfigToJson(xmlDoc);
            localStorage.setItem(key, JSON.stringify(data));
            return data;
        }
    },

    async loadConfig() {
        try {
            // Abrufen und Speichern der Daten
            const configData = await this.fetchAndStoreConfig("/interface.php?func=get_config", "world_config");
            const buildingData = await this.fetchAndStoreConfig("/interface.php?func=get_building_info", "building_info");
            const unitData = await this.fetchAndStoreConfig("/interface.php?func=get_unit_info", "unit_info");

            this.config = { ...configData, buildingInfo: buildingData, unitInfo: unitData };

            if (DEBUG) {
                console.log("Aktuelle Welteinstellungen:", this.config);
            }

            return this.config;
        } catch (error) {
            console.error("Fehler beim Laden der Welteinstellungen:", error);
        }
    },

    // Speichert ALLE Weltdaten in localStorage für spätere Nutzung durch andere Skripte
    saveAllConfig() {
        const currentConfig = JSON.stringify(this.config);
        if (localStorage.getItem("world_config") !== currentConfig) {
            localStorage.setItem("world_config", currentConfig);
            if (DEBUG) this.logDebug("Alle Welteinstellungen gespeichert. Andere Skripte können darauf zugreifen.");
        }
    },

    // Erweiterte XML zu JSON Konvertierung
    xmlConfigToJson(xml) {
        let obj = {};
        for (let i = 0; i < xml.children.length; i++) {
            let item = xml.children[i];
            let nodeName = item.nodeName;

            // Wenn der Knoten nur einmal existiert, speichere den Textinhalt
            if (item.children.length === 0) {
                obj[nodeName] = item.textContent.trim();
            } else {
                // Wenn der Knoten mehrfach vorkommt, speichere sie als Array
                if (obj[nodeName] === undefined) {
                    obj[nodeName] = this.xmlConfigToJson(item);
                } else {
                    if (!Array.isArray(obj[nodeName])) {
                        obj[nodeName] = [obj[nodeName]];
                    }
                    obj[nodeName].push(this.xmlConfigToJson(item));
                }
            }
        }
        return obj;
    },

    // Abrufen einzelner Werte aus der Weltkonfiguration mit Standardwert
    get(key, defaultValue = null) {
        return this.config?.[key] ?? defaultValue;
    },

    // Standardisierte Debug-Logging-Funktion
    logDebug(...messages) {
        if (DEBUG) console.log("[WorldConfig]", ...messages);
    }
};

// **Modul starten**
(async () => {
    await WorldConfig.loadConfig();
    if (DEBUG) WorldConfig.logDebug("Gespeicherte Welteinstellungen:", WorldConfig.config);
})();
