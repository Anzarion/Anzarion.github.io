// reportProcessing.js
(function () {
  'use strict';

  // Berichtsdaten aus der Übersicht extrahieren
  function getReportData() {
    const reportData = [];
    jQuery('#report_list tbody tr').each((_, row) => {
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
    return reportData;
  }

  // Storage-Funktionen für vollständige Berichte
  function getStoredReports() {
    const stored = localStorage.getItem('playerReports');
    return stored ? JSON.parse(stored) : [];
  }

  function setStoredReports(reports) {
    localStorage.setItem('playerReports', JSON.stringify(reports));
  }

  // Storage-Funktionen für Report-IDs
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

  // Gebäudedaten parsen
  function parseBuildingData(rawData) {
    const levels = { timberCamp: 0, clayPit: 0, ironMine: 0, wall: 0, storage: 0, hide: 0 };
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

  // Filtern nach Dorf-Daten (nur Berichte, deren attackedCoords zu Dörfern mit playerId > 0 gehören)
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

  // Mergen von Berichten: Für jedes Ziel nur den aktuellsten Bericht behalten
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

  // Hauptfunktion, die den gesamten Ablauf der Berichtserfassung und -verarbeitung ausführt
  async function processReports() {
    // Schritt 1: Berichtsdaten extrahieren
    const allReports = getReportData();
    console.log("Extrahierte Berichtsdaten:", allReports);

    // Schritt 2: Vorfilterung anhand der Dorf-Daten
    const villageFilteredReports = await filterReportsByVillage(allReports);
    console.log("Nach Dorf-Filterung:", villageFilteredReports);

    // Schritt 3: Neue Berichte filtern (noch nicht im Report-ID-Cache)
    const newReports = filterNewReports(villageFilteredReports);
    console.log("Neue Berichte (noch nicht verarbeitet):", newReports);
    if (!newReports.length) {
      console.log("Keine neuen Berichte gefunden.");
      return;
    }

    // Schritt 4: Extrahiere Report-Links
    const reportLinks = newReports.map(r => r.reportLink);

    // Schritt 5: Fetch der neuen Berichte
    let playerReports = [];
    if (game_data.screen !== 'am_farm') {
      twSDK.startProgressBar(reportLinks.length);
    }
    twSDK.getAll(reportLinks, function (index, data) {
      if (game_data.screen !== 'am_farm') {
        twSDK.updateProgressBar(index, reportLinks.length);
      }
      var parser = new DOMParser();
      var htmlDoc = parser.parseFromString(data, 'text/html');
      var $htmlDoc = jQuery(htmlDoc);

      // Extrahiere Defender, Zeitstempel, Ressourcen, Gebäudedaten, Koordinaten
      var $defenderRow = GenericHelpers.findRowByLabel($htmlDoc, "Defender:");
      var defenderAnchor = $defenderRow.find('a[href*="screen=info_player"]').first();
      if (!$defenderRow.length || !defenderAnchor.length) return;
      var defenderName = twSDK.cleanString(defenderAnchor.text().trim());

      var $battleRow = GenericHelpers.findRowByLabel($htmlDoc, "Battle time");
      var rawTimestamp = $battleRow.length ? $battleRow.find("td").eq(1).text().trim() : "";
      var timestamp = rawTimestamp ? parseReportDate(rawTimestamp).toISOString() : "";

      var scoutedResources = null;
      var $resTd = $htmlDoc.find("#attack_spy_resources").find("th:contains('Resources scouted:')").siblings("td").first();
      if ($resTd.length) {
        var resText = $resTd.text().trim();
        if (resText.toLowerCase() === 'none') {
          scoutedResources = { wood: 0, stone: 0, iron: 0 };
        } else {
          var parts = resText.split(/\s+/);
          if (parts.length >= 3) {
            scoutedResources = {
              wood: GenericHelpers.parseResourceValue(parts[0]),
              stone: GenericHelpers.parseResourceValue(parts[1]),
              iron: GenericHelpers.parseResourceValue(parts[2])
            };
          }
        }
      }

      var buildingLevels = { timberCamp: 0, clayPit: 0, ironMine: 0, wall: 0, storage: 0, hide: 0 };
      var buildingDataRaw = $htmlDoc.find('#attack_spy_building_data').val();
      if (buildingDataRaw) {
        buildingLevels = parseBuildingData(buildingDataRaw);
      }

      var attackerCoords = "";
      var destinationCoords = "";
      var $originRow = GenericHelpers.findRowByLabel($htmlDoc, "Origin:");
      if ($originRow.length) {
        attackerCoords = twSDK.getLastCoordFromString($originRow.find("td").eq(1).text());
      }
      var $destinationRow = GenericHelpers.findRowByLabel($htmlDoc, "Destination:");
      if ($destinationRow.length) {
        destinationCoords = twSDK.getLastCoordFromString($destinationRow.find("td").eq(1).text());
      }

      if (attackerCoords === destinationCoords || defenderName === game_data.player.name) {
        return;
      }

      playerReports.push({
        reportUrl: reportLinks[index],
        defender: defenderName,
        timestamp: timestamp,
        scoutedResources: scoutedResources,
        buildingLevels: buildingLevels,
        attackerCoords: attackerCoords,
        defenderCoords: destinationCoords
      });
    }, function () {
      // Schritt 6: Mergen der neuen Berichte mit dem vorhandenen Cache
      var mergedReports = filterDuplicateReports(playerReports);
      const existingReports = getStoredReports();
      const existingMap = {};
      existingReports.forEach(rep => {
        const key = rep.defenderCoords || rep.defender;
        existingMap[key] = rep;
      });
      mergedReports.forEach(newRep => {
        const keyNew = newRep.defenderCoords || newRep.defender;
        const newTime = new Date(newRep.timestamp).getTime() || 0;
        if (existingMap[keyNew]) {
          const oldTime = new Date(existingMap[keyNew].timestamp).getTime() || 0;
          if (newTime > oldTime) {
            console.debug(`Neuer Bericht für ${keyNew}: ${newRep.timestamp} (${newTime}) > ${existingMap[keyNew].timestamp} (${oldTime})`);
            existingMap[keyNew] = newRep;
          } else {
            console.debug(`Behalte alten Bericht für ${keyNew}: ${newRep.timestamp} (${newTime}) <= ${existingMap[keyNew].timestamp} (${oldTime})`);
          }
        } else {
          console.debug(`Neuer Eintrag für ${keyNew} hinzugefügt: ${newRep.timestamp}`);
          existingMap[keyNew] = newRep;
        }
      });
      const finalReports = Object.values(existingMap);
      setStoredReports(finalReports);

      // Schritt 7: Aktualisiere den Report-ID-Cache
      const newIds = newReports.map(r => r.reportId);
      const storedIds = getStoredReportIds();
      const updatedIds = [...storedIds, ...newIds];
      setStoredReportIds(updatedIds);

      console.log('Player Reports Extractor: Gespeicherte Berichte:', finalReports);

      // Anzeige: abhängig von der Seite (Report-Seite vs. am_farm)
      if (game_data.screen === 'am_farm') {
        const storedReports = getStoredReports();
        FarmIntegration.integrateReportsIntoFarmTable(storedReports);
      } else {
        twSDK.renderFixedWidget(
          `<div><b>Player Reports Extractor</b><br/>Es wurden ${finalReports.length} Berichte gespeichert.</div>`,
          scriptConfig.scriptData.prefix,
          'player-reports-extractor-widget'
        );
      }
    }, function (error) {
      GenericHelpers.handleError(error);
    });
  }

  // Exportiere Funktionen, die von main.js benötigt werden
  window.ReportProcessing = {
    getReportData,
    getStoredReports,
    setStoredReports,
    getStoredReportIds,
    setStoredReportIds,
    filterNewReports,
    parseBuildingData,
    filterReportsByVillage,
    filterDuplicateReports,
    processReports
  };
})();
