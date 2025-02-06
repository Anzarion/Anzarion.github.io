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
                if (DEBUG) this.logDebug("Welteinstellungen erfolgreich geladen.");
                return this.config;
            }
    
            return this.fetchConfigFromServer().catch(() => {
                this.isLoading = false;
                if (DEBUG) this.logDebug("Server nicht erreichbar, lade letzte bekannte Konfiguration...");
                this.config = storedConfig ? JSON.parse(storedConfig) : {};
                return this.config;
            });
        },
    
        async fetchConfigFromServer() {
            try {
                const response = await fetch("/interface.php?func=get_config");
                const text = await response.text();
                const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
    
                this.config = this.xmlToJson(xmlDoc);
                this.saveAllConfig();
    
                if (DEBUG) this.logDebug("Welteinstellungen erfolgreich gespeichert.");
                return this.config;
            } catch (error) {
                console.error("Fehler beim Laden der Welteinstellungen:", error);
                throw error;
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
    
        // XML zu JSON Konvertierung
        xmlToJson(xml) {
            return [...xml.documentElement.children].reduce((obj, child) => {
                obj[child.tagName] = child.textContent.trim();
                return obj;
            }, {});
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
        if (DEBUG) WorldConfig.logDebug("Welteneinstellungen erfolgreich geladen und gespeichert.");
    })();
    