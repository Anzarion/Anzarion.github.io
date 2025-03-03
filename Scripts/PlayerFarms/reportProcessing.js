(async function () {
  try {
    console.log("[DEBUG] Starte Berichtsextraktion...");
    
    // `getReportData()` ist jetzt asynchron und benötigt `await`
    const allReports = await genericHelpers.getReportData();
    console.log("[DEBUG] Extrahierte Berichtsdaten:", allReports);

    if (game_data.screen !== 'am_farm') {
      // Schritt 2: Vorfilterung – nur Berichte relevanter Dörfer
      const villageFilteredReports = await genericHelpers.filterReportsByVillage(allReports);
      console.log("[DEBUG] Nach Dorf-Filterung:", villageFilteredReports);

      // Schritt 3: Filtere neue Berichte (IDs, die noch nicht im Cache sind)
      const newReports = genericHelpers.filterNewReports(villageFilteredReports);
      console.log("[DEBUG] Neue Berichte (noch nicht verarbeitet):", newReports);

      if (!newReports.length) {
        console.log("[DEBUG] Keine neuen Berichte gefunden.");
        return;
      }

  // Schritt 4: Extrahiere Report-Links
  const reportLinks = newReports.map(r => r.reportLink);

  // Schritt 5: Abruf der detaillierten Berichte mit Promise‑Wrapper
  let playerReports = [];
  twSDK.startProgressBar(reportLinks.length);

  const responses = await new Promise((resolve, reject) => {
    const responsesArr = [];
    twSDK.getAll(
      reportLinks,
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

  for (let index = 0; index < responses.length; index++) {
    twSDK.updateProgressBar(index, reportLinks.length);
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(responses[index], 'text/html');
    const $htmlDoc = jQuery(htmlDoc);
    
    // Defender extrahieren
    const $defenderRow = genericHelpers.findRowByLabel($htmlDoc, "Verteidiger:");
    const defenderAnchor = $defenderRow.find('a[href*="screen=info_player"]').first();
    if ($defenderRow.length === 0 || !defenderAnchor.length) continue;
    const defenderName = twSDK.cleanString(defenderAnchor.text().trim());
    
    // Zeitstempel extrahieren
    const $battleRow = genericHelpers.findRowByLabel($htmlDoc, "Kampfzeit");
    const rawTimestamp = $battleRow.length ? $battleRow.find("td").eq(1).text().trim() : "";
    const timestamp = rawTimestamp ? genericHelpers.parseReportDate(rawTimestamp).toISOString() : "";
    
    // Ressourcen parsen
// Standardobjekt: Alle Ressourcen werden initial auf 0 gesetzt
let scoutedResources = { wood: 0, stone: 0, iron: 0 };

const $resTd = $htmlDoc.find("#attack_spy_resources")
  .find("th:contains('Erspähte Rohstoffe:')")
  .siblings("td").first();

if ($resTd.length) {
  // Für Holz: Suche das Element mit data-title "Holz" im Icon und hole den umgebenden Text
  let $wood = $resTd.find("span.icon.header.wood[data-title='Holz']").parent();
  if ($wood.length) {
    let text = $wood.text().trim();
    scoutedResources.wood = genericHelpers.parseResourceValue(text);
  }
  
  // Für Lehm: Suche das Element mit data-title "Lehm" im Icon
  let $stone = $resTd.find("span.icon.header.stone[data-title='Lehm']").parent();
  if ($stone.length) {
    let text = $stone.text().trim();
    scoutedResources.stone = genericHelpers.parseResourceValue(text);
  }
  
  // Für Eisen: Suche das Element mit data-title "Eisen" im Icon
  let $iron = $resTd.find("span.icon.header.iron[data-title='Eisen']").parent();
  if ($iron.length) {
    let text = $iron.text().trim();
    scoutedResources.iron = genericHelpers.parseResourceValue(text);
  }
}
    
    // Gebäudedaten parsen
    let buildingLevels = { timberCamp: 0, clayPit: 0, ironMine: 0, wall: 0, storage: 0, hide: 0 };
    const buildingDataRaw = $htmlDoc.find('#attack_spy_building_data').val();
    if (buildingDataRaw) {
      buildingLevels = genericHelpers.parseBuildingData(buildingDataRaw);
    }
    
    // Koordinaten extrahieren
    let attackerCoords = "";
    let destinationCoords = "";
    const $originRow = genericHelpers.findRowByLabel($htmlDoc, "Herkunft:");
    if ($originRow.length) {
      attackerCoords = twSDK.getLastCoordFromString($originRow.find("td").eq(1).text());
    }
    const $destinationRow = genericHelpers.findRowByLabel($htmlDoc, "Ziel:");
    if ($destinationRow.length) {
      destinationCoords = twSDK.getLastCoordFromString($destinationRow.find("td").eq(1).text());
    }
    
    if (attackerCoords === destinationCoords || defenderName === game_data.player.name) {
      continue;
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
  }


      // Schritt 6: Mergen der neuen Berichte mit dem vorhandenen Cache
      const mergedReports = genericHelpers.filterDuplicateReports(playerReports);
      const existingReports = genericHelpers.getStoredReports();
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
            console.debug(`[DEBUG] Neuer Bericht für ${keyNew}: ${newRep.timestamp}`);
            existingMap[keyNew] = newRep;
          } else {
            console.debug(`[DEBUG] Behalte alten Bericht für ${keyNew}`);
          }
        } else {
          console.debug(`[DEBUG] Neuer Eintrag für ${keyNew}: ${newRep.timestamp}`);
          existingMap[keyNew] = newRep;
        }
      });

      const finalReports = Object.values(existingMap);
      genericHelpers.setStoredReports(finalReports);

      // Schritt 7: Aktualisiere den Report-ID-Cache
      const newIds = newReports.map(r => r.reportId);
      const storedIds = genericHelpers.getStoredReportIds();
      const updatedIds = [...storedIds, ...newIds];
      genericHelpers.setStoredReportIds(updatedIds);

      console.log("[DEBUG] Player Reports Extractor: Gespeicherte Berichte:", finalReports);

      // Anzeige: Widget anzeigen
      twSDK.renderFixedWidget(
        `<div><b>Player Reports Extractor</b><br/>Es wurden ${finalReports.length} Berichte gespeichert.</div>`,
        scriptConfig.scriptData.prefix,
        'player-reports-extractor-widget'
      );

    } else {
      console.log("[DEBUG] Kein Berichtsextraktionsprozess für `am_farm`.");
    }
  } catch (err) {
    genericHelpers.handleError(err);
  }
})();
