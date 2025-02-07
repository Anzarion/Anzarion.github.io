/**
 * 📜 timeHelper.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.1.0
 * Beschreibung: Hilfsfunktionen für Zeitstempel und Datumsberechnungen.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/timeHelper.js
 * 
 * Funktionen:
 *  - Konvertiert Zeitstempel aus dem Spiel in lesbare Formate
 *  - Berechnet Differenzen zwischen Zeitpunkten
 *  - Unterstützt Formatierungen für Anzeigezwecke
 * 
 * Änderungen:
 *  - 1.1.0: Integration von twSDK für zentrale Skriptverwaltung
 *  - 1.0.0: Initiale Version mit Zeit-Funktionen
 */

// Warten, bis twSDK geladen ist, dann das Skript starten
$.getScript(`https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`, async function () {
    await twSDK.init({ name: "Time Helper", version: "1.1.0", author: "Anzarion" });

    console.log("⏳ timeHelper.js gestartet");

    const timeHelper = {
        /**
         * 🕒 Konvertiert einen Zeitstring in ein Date-Objekt.
         * @param {string} timeString - Zeitangabe aus dem Spiel.
         * @returns {Date} Konvertiertes Date-Objekt.
         */
        parseGameTime: function (timeString) {
            let [date, time] = timeString.split(" ");
            let [day, month, year] = date.split("/").map(Number);
            let [hours, minutes, seconds] = time.split(":").map(Number);
            return new Date(year, month - 1, day, hours, minutes, seconds);
        },

        /**
         * ⏲ Berechnet die Zeitdifferenz zwischen zwei Zeitpunkten.
         * @param {Date} past - Älterer Zeitpunkt.
         * @param {Date} current - Neuerer Zeitpunkt.
         * @returns {number} Differenz in Minuten.
         */
        getTimeDifferenceInMinutes: function (past, current = new Date()) {
            return Math.round((current - past) / 60000);
        },

        /**
         * 🏷 Formatiert eine Zeitdifferenz in ein lesbares Format.
         * @param {number} minutes - Minuten-Differenz.
         * @returns {string} Formattierter Zeitstring.
         */
        formatTimeDifference: function (minutes) {
            if (minutes < 60) return `${minutes} Min.`;
            let hours = Math.floor(minutes / 60);
            let remainingMinutes = minutes % 60;
            return `${hours} Std. ${remainingMinutes} Min.`;
        }
    };

    // Objekt global verfügbar machen
    window.timeHelper = timeHelper;
});
