const DEBUG = window.MAIN_DEBUG ?? false; // Debug-Modus aktivieren (true/false)

// **Modul: Laden & Speichern der Welteinstellungen**
const WorldConfig = {
    config: null,
    isLoading: false,

    async loadConfig() {
        // Überprüfen, ob alle 3 Daten im LocalStorage vorhanden sind
        const storedConfig = localStorage.getItem("world_config");
        const storedBuildingInfo = localStorage.getItem("building_info");
        const storedUnitInfo = localStorage.getItem("unit_info");
    
        if (storedConfig && storedBuildingInfo && storedUnitInfo) {
            // Wenn alle Daten vorhanden sind, lade sie aus dem Speicher
            this.config = JSON.parse(storedConfig);
            if (DEBUG) this.logDebug("Welteinstellungen aus dem Speicher geladen:", this.config);
        } else {
            if (DEBUG) this.logDebug("Daten fehlen im LocalStorage, lade neue Welteinstellungen...");
            // Führe die API-Abfragen durch
            return this.fetchAllConfigs();
        }
    
        return this.config; // Gib die geladenen Daten zurück, wenn alles vorhanden ist
    },

    async fetchAllConfigs() {
        try {
            this.config = {};
    
            // Wenn die Welteinstellungen fehlen, rufe die API auf
            if (!localStorage.getItem("world_config")) {
                const response = await fetch("/interface.php?func=get_config");
                const text = await response.text();
                const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
                this.config = this.xmlConfigToJson(xmlDoc);
                localStorage.setItem("world_config", JSON.stringify(this.config));
                if (DEBUG) this.logDebug("get_config Daten abgerufen und gespeichert:", this.config);
            }
    
            // Wenn die Gebäudedaten fehlen, rufe die API auf
            if (!localStorage.getItem("building_info")) {
                const response = await fetch("/interface.php?func=get_building_info");
                const text = await response.text();
                const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
                const buildingData = this.xmlConfigToJson(xmlDoc);
                localStorage.setItem("building_info", JSON.stringify(buildingData));
                if (DEBUG) this.logDebug("get_building_info Daten abgerufen und gespeichert:", buildingData);
            }
    
            // Wenn die Einheiteninformationen fehlen, rufe die API auf
            if (!localStorage.getItem("unit_info")) {
                const response = await fetch("/interface.php?func=get_unit_info");
                const text = await response.text();
                const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
                const unitData = this.xmlConfigToJson(xmlDoc);
                localStorage.setItem("unit_info", JSON.stringify(unitData));
                if (DEBUG) this.logDebug("get_unit_info Daten abgerufen und gespeichert:", unitData);
            }
    
            // Debug: Überprüfen, ob die `this.config`-Daten jetzt korrekt sind
            if (DEBUG) {
                console.log("Aktuelle Welteinstellungen in this.config:", this.config);
            }
    
            // Alle Daten zusammenführen
            if (DEBUG) this.logDebug("Alle Welteinstellungen erfolgreich abgerufen.");
            return this.config;
        } catch (error) {
            console.error("Fehler beim Laden der Welteinstellungen:", error);
        } finally {
            this.isLoading = false;
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
