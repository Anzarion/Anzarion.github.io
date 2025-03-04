(function () {
  'use strict';

  // ------------------------------
  // Generische Hilfsfunktionen
  // ------------------------------
  
  function parseResourceValue(valueStr) {
    var clean = valueStr.replace(/[.,\s]/g, "");
    return parseInt(clean, 10);
  }

  function formatResourceOutput(value) {
    return value >= 1000 ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : value.toString();
  }

  const findRowByLabel = ($container, labelText) => {
    const $rows = $container.find("tr");
    return $rows.filter((_, row) => {
      const cellText = jQuery(row).find("td, th").first().text().trim();
      return cellText === labelText;
    }).first();
  };

  function createTableCell(content, style, colspan) {
    const styleAttr = style ? ` style="${style}"` : '';
    const colspanAttr = colspan ? ` colspan="${colspan}"` : '';
    return `<td${colspanAttr}${styleAttr}>${content}</td>`;
  }

  // ------------------------------
  // Berichtsdaten extrahieren
  // ------------------------------
async function getReportData() {
  console.log("[DEBUG] Starte `getReportData()` mit vollständiger Seitenerfassung...");
  const reportData = [];
  
  // Suchen der Seitennavigation
  const pageNavTd = document.querySelector("td[colspan='4'][align='center']");
  if (!pageNavTd) {
    console.warn("[DEBUG] Keine Seitennavigation gefunden.");
    return [];
  }

  // Ermitteln der Berichtsseiten-URLs anhand der Navigation
  const pageLinks = pageNavTd.querySelectorAll("a.paged-nav-item");
  let fromValues = [0];
  pageLinks.forEach(link => {
    const match = link.innerText.match(/\d+/);
    if (match) {
      const fromValue = parseInt(link.href.match(/from=(\d+)/)?.[1] || "0", 10);
      if (!fromValues.includes(fromValue)) {
        fromValues.push(fromValue);
      }
    }
  });

  const baseUrl = window.location.origin + window.location.pathname;
  const pageUrls = fromValues.map(from => `${baseUrl}?village=${game_data.village.id}&screen=report&mode=attack&from=${from}`);
  console.log("[DEBUG] Gefundene Berichtsseiten-URLs:", pageUrls);

  // Verwenden eines Promise-Wrappers, um auf alle asynchronen Requests zu warten
  try {
    const responses = await new Promise((resolve, reject) => {
      const responsesArr = [];
      twSDK.getAll(
        pageUrls,
        (index, data) => {
          responsesArr[index] = data;
        },
        () => {
          resolve(responsesArr);
        },
        (error) => {
          reject(error);
        }
      );
    });

    // Verarbeitung der Seiteninhalte
    for (let index = 0; index < responses.length; index++) {
      console.log(`[DEBUG] Verarbeite Berichtsübersicht Seite ${index + 1}/${pageUrls.length}`);
      if (!responses[index]) {
        console.warn(`[WARN] Kein Inhalt für Seite ${index + 1} erhalten.`);
        continue;
      }
      const doc = new DOMParser().parseFromString(responses[index], "text/html");
      jQuery(doc).find('#report_list tbody tr').each((_, row) => {
        const classList = row.className.split(' ');
        const reportClass = classList.find(cls => cls.startsWith('report-'));
        if (!reportClass) return;
        const reportId = reportClass.split('-')[1];
        const reportLink = jQuery(row).find('.report-link').attr('href');
        if (!reportLink) return;
        const rowText = jQuery(row).text();
        const coordMatches = rowText.match(/\d{1,3}\|\d{1,3}/g);
        const attackedCoords = (coordMatches && coordMatches.length > 1) ? coordMatches[1] : null;
        reportData.push({ reportId, reportLink, attackedCoords });
      });
    }

    console.log("[DEBUG] Alle Seiten verarbeitet! Berichtsdaten:", reportData);
    return reportData;
  } catch (error) {
    console.warn("[DEBUG] Fehler beim Laden der Seiten:", error);
    return [];
  }
}



  // ------------------------------
  // Plünderbare Kapazität berechnen
  // ------------------------------
  function calculatePlunderableCapacity(buildingLevels) {
    var storageLevel = buildingLevels.storage;
    var hideLevel = buildingLevels.hide;
    var warehouseCapacity = storageLevel > 0 ? warehouseCapacities[storageLevel - 1] : 0;
    var hidingCapacity = hideLevel > 0 ? hidingPlaceCapacities[hideLevel - 1] : 0;
    return warehouseCapacity - hidingCapacity;
  }

  // ------------------------------
  // Zeitstempel parsen
  // ------------------------------
function parseReportDate(dateString) {
  // Englisches Format: z.B. "Mar 03, 2025 11:06:14:684"
  if (dateString.includes(',')) {
    // Ersetze den letzten Doppelpunkt (der die Millisekunden trennt) durch einen Punkt
    const lastColonIndex = dateString.lastIndexOf(':');
    if (lastColonIndex !== -1) {
      dateString = dateString.substring(0, lastColonIndex) + '.' + dateString.substring(lastColonIndex + 1);
    }
    // Nun sollte z. B. "Mar 03, 2025 11:06:14.684" entstehen, das Date() meist korrekt parsen kann
    return new Date(dateString);
  } else {
    // Deutsches Format: z.B. "03.03.25 11:01:12"
    const [datePart, timePart] = dateString.split(' ');
    if (!datePart || !timePart) return new Date(dateString);

    // Erkennen des Datums-Trenners (Punkt oder Slash)
    const delimiter = datePart.includes('.') ? '.' : '/';
    let [day, month, year] = datePart.split(delimiter);

    // Falls das Jahr nur 2 Ziffern hat, wird "20" vorangestellt
    if (year.length === 2) {
      year = "20" + year;
    }

    // Erstelle einen ISO-kompatiblen String (YYYY-MM-DDTHH:MM:SS)
    const isoString = `${year}-${month}-${day}T${timePart}`;
    return new Date(isoString);
  }
}


  // ------------------------------
  // Fehlerbehandlung
  // ------------------------------
  function handleError(error) {
    UI.ErrorMessage(twSDK.tt('There was an error!'));
    console.error(`${twSDK.scriptInfo()} Error: `, error);
  }

  // ------------------------------
  // Storage-Funktionen für vollständige Berichte
  // ------------------------------
  function getStoredReports() {
    const stored = localStorage.getItem('playerReports');
    return stored ? JSON.parse(stored) : [];
  }

  function setStoredReports(reports) {
    localStorage.setItem('playerReports', JSON.stringify(reports));
  }

  // ------------------------------
  // Storage-Funktionen für Report-IDs
  // ------------------------------
  function getStoredReportIds() {
    const stored = localStorage.getItem('storedReportIds');
    return stored ? JSON.parse(stored) : [];
  }

  function setStoredReportIds(ids) {
    console.log("Setze Report IDs:", ids);
    localStorage.setItem('storedReportIds', JSON.stringify(ids));
    console.log("localStorage (storedReportIds):", localStorage.getItem('storedReportIds'));
  }

  function filterNewReports(reportDataArray) {
    const storedIds = getStoredReportIds();
    return reportDataArray.filter(report => !storedIds.includes(report.reportId));
  }

  // ------------------------------
  // Weltenspeed und Ressourcenproduktion
  // ------------------------------
  async function getWorldSpeed() {
    try {
      const worldConfig = await twSDK.getWorldConfig();
      const worldSpeed = parseFloat(worldConfig.config.speed);
      return worldSpeed;
    } catch (error) {
      console.error('Fehler beim Abrufen des Weltenspeed:', error);
      return 1;
    }
  }

  async function calculateProducedResources(lastReportTimestamp, mineLevel) {
    try {
      const worldSpeed = parseFloat(await getWorldSpeed());
      const now = twSDK.getServerDateTimeObject();
      const attackTime = new Date(lastReportTimestamp);
      const elapsedHours = (now - attackTime) / (1000 * 60 * 60);
      const productionRate = parseFloat(twSDK.resPerHour[mineLevel]);
      const produced = worldSpeed * productionRate * elapsedHours;
      return Math.round(produced);
    } catch (error) {
      console.error("Fehler bei der Berechnung der produzierten Ressourcen:", error);
      return 0;
    }
  }

  async function canAttack(defenderName) {
    try {
      const playersData = await twSDK.worldDataAPI('player');
      const defender = playersData.find(player =>
        twSDK.cleanString(player[1]) === twSDK.cleanString(defenderName)
      );
      if (!defender) {
        console.warn(`Kein Spieler für "${defenderName}" gefunden.`);
        return false;
      }
      const defenderPoints = parseInt(defender[4], 10);
      const myPoints = parseInt(game_data.player.points, 10);
      return myPoints <= defenderPoints * 20;
    } catch (error) {
      console.error("Fehler in canAttack:", error);
      return false;
    }
  }

  // ------------------------------
  // Gebäudedaten parsen
  // ------------------------------
  function parseBuildingData(rawData) {
    const levels = {
      timberCamp: 0,
      clayPit: 0,
      ironMine: 0,
      wall: 0,
      storage: 0,
      hide: 0
    };
    try {
      const data = JSON.parse(rawData);
      data.forEach(entry => {
        const level = parseInt(entry.level, 10) || 0;
        switch (entry.id) {
          case 'wood': levels.timberCamp = level; break;
          case 'stone': levels.clayPit = level; break;
          case 'iron': levels.ironMine = level; break;
          case 'wall': levels.wall = level; break;
          case 'storage': levels.storage = level; break;
          case 'hide': levels.hide = level; break;
        }
      });
    } catch (e) {
      console.error('Fehler beim Parsen der Gebäudedaten:', e);
    }
    return levels;
  }

  // ------------------------------
  // Filterung und Merging der Berichtsdaten
  // ------------------------------
  async function filterReportsByVillage(reports) {
    try {
      const villages = await twSDK.worldDataAPI('village');
      const villageMap = {};
      villages.forEach(village => {
        const [ , , villageX, villageY, playerId] = village;
        const coords = `${villageX}|${villageY}`;
        villageMap[coords] = playerId;
      });
      const filteredReports = reports.filter(report => {
        if (!report.attackedCoords) return false;
        const playerId = villageMap[report.attackedCoords];
        return playerId && parseInt(playerId, 10) > 0;
      });
      return filteredReports;
    } catch (error) {
      console.error("Fehler beim Filtern der Berichte nach Dorf-Daten:", error);
      return reports;
    }
  }

  function filterDuplicateReports(reports) {
    return Object.values(reports.reduce((acc, report) => {
      const key = report.defenderCoords || report.defender;
      const currentTime = Date.parse(report.timestamp) || 0;
      if (!acc[key] || currentTime > (Date.parse(acc[key].timestamp) || 0)) {
        acc[key] = report;
      }
      return acc;
    }, {}));
  }

  function formatReportTime(timestampStr) {
    const dt = new Date(timestampStr);
    if (isNaN(dt.getTime())) return timestampStr;
    const now = new Date();
    if (dt.toDateString() === now.toDateString()) {
      return `today at ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    }
    const pad = num => num.toString().padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
  }

  // ------------------------------
  // Kapazitäten Arrays
  // ------------------------------
  const warehouseCapacities = [
    1000, 1229, 1512, 1859, 2285, 2810, 3454, 4247, 5222, 6420,
    7893, 9705, 11932, 14670, 18037, 22177, 27266, 33523, 41217, 50675,
    62305, 76604, 94184, 115798, 142373, 175047, 215219, 264611, 325337, 400000
  ];

  const hidingPlaceCapacities = [
    150, 200, 267, 356, 474, 632, 843, 1125, 1500, 2000
  ];

  // ------------------------------
  // Exponieren der Funktionen als globales Objekt
  // ------------------------------
  window.genericHelpers = {
    parseResourceValue,
    formatResourceOutput,
    findRowByLabel,
    createTableCell,
    getReportData,
    calculatePlunderableCapacity,
    parseReportDate,
    handleError,
    getStoredReports,
    setStoredReports,
    getStoredReportIds,
    setStoredReportIds,
    filterNewReports,
    getWorldSpeed,
    calculateProducedResources,
    canAttack,
    parseBuildingData,
    filterReportsByVillage,
    filterDuplicateReports,
    formatReportTime,
    warehouseCapacities,
    hidingPlaceCapacities
  };
})();
