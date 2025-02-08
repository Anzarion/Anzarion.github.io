/**
 * 📜 timeHelper.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Hilfsfunktionen zur Verarbeitung und Formatierung von Zeitangaben,
 *               insbesondere zur Umwandlung relativer Zeitstrings (z. B. "today at 16:05:55",
 *               "yesterday at 23:01:50", "on 06.02. at 13:05:28") in gültige Date-Objekte.
 * 
 * Funktionen:
 *  - parseTimeString: Wandelt einen Zeit-String in ein Date-Objekt um.
 *  - formatTime: Formatiert ein Date-Objekt in einen String im Format HH:MM:SS.
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version mit erweiterten Parsing-Funktionen für relative Zeitangaben,
 *           robuster Fehlerbehandlung und Debug-Logging.
 */

(function(global) {
    'use strict';

    const timeHelper = {
        /**
         * Wandelt einen Zeit-String in ein Date-Objekt um.
         * Unterstützt Formate wie:
         * - "today at HH:MM:SS"
         * - "yesterday at HH:MM:SS"
         * - "on DD.MM. at HH:MM:SS" (mit optionalem Punkt nach dem Monat)
         * Falls der String in keinem dieser Formate vorliegt, wird versucht, ihn direkt zu parsen.
         *
         * @param {string} timeStr - Der zu parsende Zeit-String.
         * @returns {Date|null} Das geparste Date-Objekt oder null, wenn das Parsing fehlschlägt.
         */
        parseTimeString(timeStr) {
            if (typeof timeStr !== "string") {
                console.error("timeHelper: Ungültiger Typ für timeStr:", timeStr);
                return null;
            }
            const str = timeStr.trim().toLowerCase();
            const now = new Date();
            let datePart;

            if (str.includes("today")) {
                const match = str.match(/today\s+at\s+(\d{1,2}:\d{2}:\d{2})/);
                if (match) {
                    const timePart = match[1];
                    const [hours, minutes, seconds] = timePart.split(":").map(Number);
                    datePart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
                } else {
                    console.warn("timeHelper: Kein Zeitteil gefunden im 'today'-Format:", timeStr);
                    return null;
                }
            } else if (str.includes("yesterday")) {
                const match = str.match(/yesterday\s+at\s+(\d{1,2}:\d{2}:\d{2})/);
                if (match) {
                    const timePart = match[1];
                    const [hours, minutes, seconds] = timePart.split(":").map(Number);
                    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    yesterday.setDate(yesterday.getDate() - 1);
                    datePart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), hours, minutes, seconds);
                } else {
                    console.warn("timeHelper: Kein Zeitteil gefunden im 'yesterday'-Format:", timeStr);
                    return null;
                }
            } else if (str.includes("on ")) {
                // Erwartetes Format: "on DD.MM. at HH:MM:SS" – der Punkt nach dem Monat ist optional
                const match = str.match(/on\s+(\d{1,2})\.(\d{1,2})\.?\s+at\s+(\d{1,2}:\d{2}:\d{2})/);
                if (match) {
                    const day = Number(match[1]);
                    const month = Number(match[2]) - 1; // Monate in JS sind 0-indexiert
                    const timePart = match[3];
                    const [hours, minutes, seconds] = timePart.split(":").map(Number);
                    let year = now.getFullYear();
                    let candidateDate = new Date(year, month, day, hours, minutes, seconds);
                    // Falls der Kandidat in der Zukunft liegt, könnte es das Datum des Vorjahres sein (optional)
                    if (candidateDate > now) {
                        candidateDate = new Date(year - 1, month, day, hours, minutes, seconds);
                    }
                    datePart = candidateDate;
                } else {
                    console.warn("timeHelper: Format 'on DD.MM. at HH:MM:SS' nicht erkannt in:", timeStr);
                    return null;
                }
            } else {
                // Fallback: Direkter Versuch, den String zu parsen
                datePart = new Date(timeStr);
                if (isNaN(datePart)) {
                    console.warn("timeHelper: Datum konnte nicht geparst werden:", timeStr);
                    return null;
                }
            }
            console.debug("timeHelper: Parsed time string:", timeStr, "=>", datePart);
            return datePart;
        },

        /**
         * Formatiert ein Date-Objekt in einen String im Format HH:MM:SS.
         *
         * @param {Date} date - Das zu formatierende Date-Objekt.
         * @returns {string} Der formatierte Zeit-String.
         */
        formatTime(date) {
            if (!(date instanceof Date) || isNaN(date)) {
                console.error("timeHelper: Ungültiges Date-Objekt für formatTime:", date);
                return "";
            }
            const pad = num => num.toString().padStart(2, "0");
            return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        }
    };

    // Global verfügbar machen
    if (!global.timeHelper) {
        global.timeHelper = timeHelper;
    } else {
        console.warn("timeHelper ist bereits definiert. Überschreiben wird vermieden.");
    }
})(typeof window !== "undefined" ? window : this);
