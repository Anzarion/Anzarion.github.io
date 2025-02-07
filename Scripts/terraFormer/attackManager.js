/**
 * attackManager.js
 * ----------------
 * Verwaltet Angriffe und Spähaktionen in "Die Stämme".
 * Steuert das automatische Versenden von Spähern und Angriffen.
 */

import { getStoredData, setStoredData } from "./storageHelper.js";
import { logInfo, logError } from "./logHelper.js";
import { sendRequest } from "./requestHelper.js";

// Konstante für den Angriffsspeicher
const ATTACK_STORAGE_KEY = "attackQueue";

/**
 * Fügt ein Dorf zur Angriffswarteschlange hinzu.
 * @param {Object} village - Dorfobjekt mit ID und Koordinaten.
 */
export function addVillageToAttackQueue(village) {
    let attackQueue = getStoredData(ATTACK_STORAGE_KEY) || [];
    
    // Überprüfen, ob das Dorf bereits in der Queue ist
    if (!attackQueue.some(entry => entry.id === village.id)) {
        attackQueue.push(village);
        setStoredData(ATTACK_STORAGE_KEY, attackQueue);
        logInfo(`📌 Dorf zur Angriffswarteschlange hinzugefügt: ${village.id}`);
    } else {
        logInfo(`⚠ Dorf ${village.id} ist bereits in der Warteschlange.`);
    }
}

/**
 * Sendet Späher zu einem Dorf.
 * @param {Object} village - Ziel-Dorf.
 */
export async function sendScouts(village) {
    try {
        let url = `/game.php?village=${village.origin}&screen=place&ajax=confirm`;
        let params = {
            target: village.id,
            spy: 1,
            h: game_data.csrf,
        };

        let response = await sendRequest(url, params);
        if (response.success) {
            logInfo(`🕵️ Späher zu Dorf ${village.id} gesendet.`);
        } else {
            logError(`Fehler beim Senden von Spähern zu ${village.id}: ${response.message}`);
        }
    } catch (error) {
        logError(`Fehler beim Späherbefehl: ${error}`);
    }
}

/**
 * Verarbeitet die Angriffswarteschlange und sendet Angriffe aus.
 */
export async function processAttackQueue() {
    let attackQueue = getStoredData(ATTACK_STORAGE_KEY) || [];

    if (attackQueue.length === 0) {
        logInfo("✔ Keine offenen Angriffe.");
        return;
    }

    for (let village of attackQueue) {
        await sendScouts(village);
    }

    // Nach Verarbeitung die Queue leeren
    setStoredData(ATTACK_STORAGE_KEY, []);
    logInfo("✅ Angriffswarteschlange verarbeitet.");
}
