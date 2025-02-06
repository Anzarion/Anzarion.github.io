// Funktion zum loggen von Debugging-Informationen
function logDebug(message) {
    if (window.ScriptConfig.DEBUG_MODE) {
        console.log(message);
    }
}

// **Modul: Laden & Speichern der Welteinstellungen**
if (typeof WorldConfig === "undefined") {
    // Sicherstellen, dass `WorldConfig` korrekt definiert ist
    var WorldConfig = {
        config: null,
        isLoading: false,

        async loadConfig() {
            // Überprüfen, ob alle 3 Daten im LocalStorage vorhanden sind
            const storedConfig = localStorage.getItem("world_config");
            const storedBuildingInfo = localStorage.getItem("building_info");
            const storedUnitInfo = localStorage.getItem("unit_info");
        
            if (storedConfig) {
                this.config = JSON.parse(storedConfig);
                logDebug("Welteinstellungen aus dem Speicher geladen:", this.config);
            } else {
                logDebug("Keine gespeicherten Welteinstellungen gefunden.");
            }
        
            // Füge die gespeicherten Daten für `building_info` und `unit_info` hinzu
            if (storedBuildingInfo) {
                this.config.buildingInfo = JSON.parse(storedBuildingInfo);
                logDebug("Gebäudedaten aus dem Speicher geladen:", this.config.buildingInfo);
            }
        
            if (storedUnitInfo) {
                this.config.unitInfo = JSON.parse(storedUnitInfo);
                logDebug("Einheiteninformationen aus dem Speicher geladen:", this.config.unitInfo);
            }
        
            // Jetzt führe alle 3 API-Abfragen aus, falls noch Daten fehlen
            return this.fetchAllConfigs();
        },

        async fetchAllConfigs() {
            try {
                // Wenn die Welteinstellungen fehlen, rufe die API auf
                if (!localStorage.getItem("world_config")) {
                    const response = await fetch("/interface.php?func=get_config");
                    const text = await response.text();
                    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
                    this.config = this.xmlConfigToJson(xmlDoc);  // Korrektes Zusammenführen der Daten
                    localStorage.setItem("world_config", JSON.stringify(this.config));
                    logDebug("get_config Daten abgerufen und gespeichert:", this.config);
                }
        
                // Wenn die Gebäudedaten fehlen, rufe die API auf
                if (!localStorage.getItem("building_info")) {
                    const response = await fetch("/interface.php?func=get_building_info");
                    const text = await response.text();
                    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
                    const buildingData = this.xmlConfigToJson(xmlDoc);
                    this.config.buildingInfo = buildingData;
                    localStorage.setItem("building_info", JSON.stringify(buildingData));
                    logDebug("get_building_info Daten abgerufen und gespeichert:", buildingData);
                }
        
                // Wenn die Einheiteninformationen fehlen, rufe die API auf
                if (!localStorage.getItem("unit_info")) {
                    const response = await fetch("/interface.php?func=get_unit_info");
                    const text = await response.text();
                    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
                    const unitData = this.xmlConfigToJson(xmlDoc);
                    this.config.unitInfo = unitData;
                    localStorage.setItem("unit_info", JSON.stringify(unitData));
                    logDebug("get_unit_info Daten abgerufen und gespeichert:", unitData);
                }
        
                // Debug: Überprüfen, ob alle Daten jetzt korrekt zusammengeführt wurden
                logDebug("Aktuelle Welteinstellungen in this.config:", this.config);
        
                // Alle Daten zusammenführen
                logDebug("Alle Welteinstellungen erfolgreich abgerufen.");
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
                logDebug("Alle Welteinstellungen gespeichert. Andere Skripte können darauf zugreifen.");
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
            if (window.ScriptConfig.DEBUG_MODE) console.log("[WorldConfig]", ...messages);
        }
    };
}

// **Modul starten**
(async () => {
    await WorldConfig.loadConfig();
    if (window.ScriptConfig.DEBUG_MODE) WorldConfig.logDebug("Gespeicherte Welteinstellungen:", WorldConfig.config);
})();
