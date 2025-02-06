const DEBUG = window.MAIN_DEBUG ?? false; // Debug-Modus aktivieren (true/false)

// **Modul: Laden & Speichern der Welteinstellungen**
const WorldConfig = {
    config: null,
    isLoading: false,

    async loadConfig() {
        if (this.isLoading) return;
        this.isLoading = true;
        if (DEBUG) this.logDebug("Lade Welteinstellungen...");

        // Falls bereits im Speicher, lade es von dort
        const storedConfig = localStorage.getItem("world_config");
        if (storedConfig) {
            this.config = JSON.parse(storedConfig);
            this.isLoading = false;
            if (DEBUG) this.logDebug("Welteinstellungen aus dem Speicher geladen:", this.config);
            return this.config;
        }

        return this.fetchAllConfigs();
    },

    async fetchAllConfigs() {
        try {
            const endpoints = [
                "/interface.php?func=get_config",
                "/interface.php?func=get_building_info",
                "/interface.php?func=get_unit_info"
            ];
    
            this.config = {};
            for (const url of endpoints) {
                const response = await fetch(url);
                const text = await response.text();
    
                // Debugging-Ausgabe der rohen Daten vor der Verarbeitung
                if (DEBUG) {
                    console.log(`Raw Daten von ${url}:`, text); // Gibt die rohen XML-Daten in der Konsole aus
                }
    
                const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
                const parsedData = this.xmlConfigToJson(xmlDoc);
    
                // Prüft, ob die geparsten Daten leer sind
                if (Object.keys(parsedData).length === 0) {
                    console.warn(`Warnung: Keine Daten von ${url} zurückgegeben`);
                }
    
                Object.assign(this.config, parsedData);
            }
    
            this.saveAllConfig();
            if (DEBUG) this.logDebug("Alle Welteinstellungen gespeichert:", this.config);
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

            if (obj[nodeName] === undefined) {
                obj[nodeName] = this.xmlConfigToJson(item);
            } else {
                if (!Array.isArray(obj[nodeName])) {
                    obj[nodeName] = [obj[nodeName]];
                }
                obj[nodeName].push(this.xmlConfigToJson(item));
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
