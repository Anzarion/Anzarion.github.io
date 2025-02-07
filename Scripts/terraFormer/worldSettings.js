/**
 * worldSettings.js
 * ----------------
 * Lädt und speichert die Welteinstellungen (Gebäude, Einheiten, etc.).
 */

import { getStoredData, setStoredData } from "./storageHelper.js";
import { sendRequest } from "./requestHelper.js";
import { logInfo, logError } from "./logHelper.js";

// Konstante für den Speicher-Schlüssel
const WORLD_SETTINGS_KEY = "worldSettings";

/**
 * Ruft die Welteinstellungen über die API ab.
 */
export async function fetchWorldSettings() {
    logInfo("🌍 Lade Weltdaten...");

    try {
        let url = `/interface.php?func=get_config`;
        let response = await sendRequest(url);

        if (response) {
            setStoredData(WORLD_SETTINGS_KEY, response);
            logInfo("✅ Weltdaten erfolgreich gespeichert.");
            return response;
        } else {
            logError("❌ Konnte keine Weltdaten abrufen.");
            return null;
        }
    } catch (error) {
        logError(`Fehler beim Laden der Weltdaten: ${error}`);
        return null;
    }
}

/**
 * Gibt die gespeicherten Weltdaten zurück.
 * Falls keine vorhanden sind, wird ein neuer Abruf gestartet.
 */
export async function getWorldSettings() {
    let worldSettings = getStoredData(WORLD_SETTINGS_KEY);

    if (!worldSettings) {
        logInfo("📡 Keine gespeicherten Weltdaten gefunden. Lade neu...");
        return await fetchWorldSettings();
    }

    return worldSettings;
}
