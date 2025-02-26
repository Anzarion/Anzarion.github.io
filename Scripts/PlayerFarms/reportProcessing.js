// reportProcessing.js
(function () {
  'use strict';

  (async function () {
    try {
      // Schritt 1: Berichtsdaten extrahieren (IDs, Links, attackedCoords)
      const allReports = getReportData();
      console.log("Extrahierte Berichtsdaten:", allReports);

      // Schritt 2: Vorfilterung nach Dorf-Daten (nur Berichte, deren attackedCoords zu Dörfern mit playerId > 0 gehören)
      const villageFilteredReports = await filterReportsByVillage(allReports);
      console.log("Nach Dorf-Filterung:", villageFilteredReports);

      // Schritt 3: Filtern der neuen Berichte (Report-IDs, die noch nicht im Cache sind)
      const newReports = filterNewReports(villageFilteredReports);
      console.log("Neue Berichte (noch nicht verarbeitet):", newReports);

      if (!newReports.length) {
        console.log("Keine neuen Berichte gefunden.");
        return;
      }

      // Schritt 4: Extrahiere die Report-Links der neuen Berichte
      const reportLinks = newReports.map(r => r.reportLink);

      // Schritt 5: Fetch der neuen Berichte via twSDK.getAll
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

        // Defender extrahieren
        var $defenderRow = findRowByLabel($htmlDoc, "Defender:");
        var defenderAnchor = $defenderRow.find('a[href*="screen=info_player"]').first();
        if ($defenderRow.length === 0 || !defenderAnchor.length) return;
        var defenderName = twSDK.cleanString(defenderAnchor.text().trim());

        // Zeitstempel extrahieren und in ISO konvertieren
        var $battleRow = findRowByLabel($htmlDoc, "Battle time");
        var rawTimestamp = $battleRow.length ? $battleRow.find("td").eq(1).text().trim() : "";
        var timestamp = rawTimestamp ? parseReportDate(rawTimestamp).toISOString() : "";

        // Ressourcen parsen
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
                wood: parseResourceValue(parts[0]),
                stone: parseResourceValue(parts[1]),
                iron: parseResourceValue(parts[2])
              };
            }
          }
        }

        // Gebäudedaten parsen
        var buildingLevels = { timberCamp: 0, clayPit: 0, ironMine: 0, wall: 0, storage: 0, hide: 0 };
        var buildingDataRaw = $htmlDoc.find('#attack_spy_building_data').val();
        if (buildingDataRaw) {
          buildingLevels = parseBuildingData(buildingDataRaw);
        }

        // Koordinaten extrahieren
        var attackerCoords = "";
        var destinationCoords = "";
        var $originRow = findRowByLabel($htmlDoc, "Origin:");
        if ($originRow.length) {
          attackerCoords = twSDK.getLastCoordFromString($originRow.find("td").eq(1).text());
        }
        var $destinationRow = findRowByLabel($htmlDoc, "Destination:");
        if ($destinationRow.length) {
          destinationCoords = twSDK.getLastCoordFromString($destinationRow.find("td").eq(1).text());
        }

        // Eigene Berichte ignorieren
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

        // Anzeige: Integration in die Farm-Assistent-Tabelle oder Widget-Anzeige
        if (game_data.screen === 'am_farm') {
          const storedReports = getStoredReports();
          integrateReportsIntoFarmTable(storedReports);
        } else {
          twSDK.renderFixedWidget(
            `<div><b>Player Reports Extractor</b><br/>Es wurden ${finalReports.length} Berichte gespeichert.</div>`,
            scriptConfig.scriptData.prefix,
            'player-reports-extractor-widget'
          );
        }
      }, function (error) {
        handleError(error);
      });
    } else {
      // Block B: Wenn die Seite "am_farm" ist – integriere Berichte aus dem Storage
      const storedReports = getStoredReports();
      integrateReportsIntoFarmTable(storedReports);
    }
  })().catch(err => handleError(err));
})();
