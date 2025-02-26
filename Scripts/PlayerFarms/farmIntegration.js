(function () {
  'use strict';

  // Dieses Skript wird auf der am_farm Seite ausgeführt.
  // Es lädt die gespeicherten Berichte aus dem localStorage und integriert sie in die Farm-Assistent-Tabelle.

  async function integrateReportsIntoFarmTable(reports) {
    if (!reports || !reports.length) return;
    const $plunderList = jQuery('#plunder_list');
    if (!$plunderList.length) {
      console.warn('Ziel-Tabelle (#plunder_list) nicht gefunden!');
      return;
    }
    // Header-Zeile hinzufügen
    $plunderList.prepend(`<tr class="player_report_header" style="background-color:#DFF0D8;">
      <td colspan="14"><strong>Spielerberichte</strong></td>
    </tr>`);
    let rowsHtml = '';
    for (let i = 0, len = reports.length; i < len; i++) {
      const report = reports[i];
      const attackable = await genericHelpers.canAttack(report.defender);
      if (!attackable) continue;
      const targetId = report.targetId || i;
      const viewIdMatch = report.reportUrl.match(/view=(\d+)/);
      const viewId = viewIdMatch ? viewIdMatch[1] : 0;
      const rowClass = (i % 2 === 0) ? 'a' : 'b';
      const producedWood = await genericHelpers.calculateProducedResources(report.timestamp, report.buildingLevels.timberCamp);
      const producedStone = await genericHelpers.calculateProducedResources(report.timestamp, report.buildingLevels.clayPit);
      const producedIron  = await genericHelpers.calculateProducedResources(report.timestamp, report.buildingLevels.ironMine);
      const originalWood = report.scoutedResources ? report.scoutedResources.wood : 0;
      const originalStone = report.scoutedResources ? report.scoutedResources.stone : 0;
      const originalIron = report.scoutedResources ? report.scoutedResources.iron : 0;
      const updatedWoodRaw = originalWood + producedWood;
      const updatedStoneRaw = originalStone + producedStone;
      const updatedIronRaw = originalIron + producedIron;
      const plunderableCapacity = genericHelpers.calculatePlunderableCapacity(report.buildingLevels);
      const updatedWood = Math.min(updatedWoodRaw, plunderableCapacity);
      const updatedStone = Math.min(updatedStoneRaw, plunderableCapacity);
      const updatedIron = Math.min(updatedIronRaw, plunderableCapacity);
      const woodText = report.scoutedResources
        ? (updatedWood === plunderableCapacity
            ? `<span style="color: red;">${genericHelpers.formatResourceOutput(updatedWood)}</span>`
            : genericHelpers.formatResourceOutput(updatedWood))
        : '';
      const stoneText = report.scoutedResources
        ? (updatedStone === plunderableCapacity
            ? `<span style="color: red;">${genericHelpers.formatResourceOutput(updatedStone)}</span>`
            : genericHelpers.formatResourceOutput(updatedStone))
        : '';
      const ironText = report.scoutedResources
        ? (updatedIron === plunderableCapacity
            ? `<span style="color: red;">${genericHelpers.formatResourceOutput(updatedIron)}</span>`
            : genericHelpers.formatResourceOutput(updatedIron))
        : '';
      const resHtml = report.scoutedResources
        ? `<span class="nowrap"><span class="icon header wood" title="Wood"></span><span class="res">${woodText}</span></span>
           <span class="nowrap"><span class="icon header stone" title="Clay"></span><span class="res">${stoneText}</span></span>
           <span class="nowrap"><span class="icon header iron" title="Iron"></span><span class="res">${ironText}</span></span>`
        : '';
      let rowHtml = '';
      rowHtml += genericHelpers.createTableCell(`<a onclick="return Accountmanager.farm.deleteReport(${targetId});" title="Delete all reports for this village" class="tooltip" href="#">
        <img src="https://dszz.innogamescdn.com/asset/449b3b09/graphic/delete_small.png" alt="" />
      </a>`);
      rowHtml += genericHelpers.createTableCell(`<img src="https://dszz.innogamescdn.com/asset/449b3b09/graphic/dots/green.png" title="Complete victory" alt="" class="tooltip" />`);
      rowHtml += genericHelpers.createTableCell(`<img src="https://dszz.innogamescdn.com/asset/449b3b09/graphic/max_loot/0.png" title="Partial haul: Your soldiers looted everything they could find." alt="" class="tooltip" />`);
      rowHtml += genericHelpers.createTableCell(`<a href="${report.reportUrl}">${report.defender}</a>`);
      rowHtml += genericHelpers.createTableCell(genericHelpers.formatReportTime(report.timestamp));
      rowHtml += genericHelpers.createTableCell(resHtml, 'text-align: center;', 3);
      rowHtml += genericHelpers.createTableCell(report.buildingLevels.wall, 'text-align: center;');
      let distance = "";
      if (report.defenderCoords) {
        distance = twSDK.calculateDistanceFromCurrentVillage(report.defenderCoords).toFixed(1);
      }
      rowHtml += genericHelpers.createTableCell(distance, 'text-align: center;');
      rowHtml += genericHelpers.createTableCell(`<a href="#" onclick="return Accountmanager.farm.sendUnits(this, ${targetId}, 110)" class="tooltip farm_icon farm_icon_a" title="Send attack using Template A"></a>`, 'text-align: center;');
      rowHtml += genericHelpers.createTableCell(`<a href="#" onclick="return Accountmanager.farm.sendUnits(this, ${targetId}, 141)" class="tooltip farm_icon farm_icon_b" title="Send attack using Template B"></a>`, 'text-align: center;');
      rowHtml += genericHelpers.createTableCell(`<a href="#" onclick="return Accountmanager.farm.sendUnitsFromReport(this, ${targetId}, ${viewId}, {})" class="tooltip farm_icon farm_icon_c" title="Send attack using report info"></a>`, 'text-align: center;');
      rowHtml += genericHelpers.createTableCell(`<a href="/game.php?village=447&screen=place&target=${targetId}" onclick="return Accountmanager.farm.openRallyPoint(${targetId}, event)">
        <img src="https://dszz.innogamescdn.com/asset/449b3b09/graphic/buildings/place.png" alt="Rally point" />
      </a>`, 'text-align: center;');
      rowsHtml += `<tr class="player_report row_${rowClass}">${rowHtml}</tr>`;
    }
    $plunderList.append(rowsHtml);
    console.log('Spielerberichte wurden in die Farm-Assistent-Tabelle integriert.');
  }

  // Starte die Integration beim Laden dieses Skripts
  try {
    const storedReports = genericHelpers.getStoredReports();
    integrateReportsIntoFarmTable(storedReports);
  } catch (err) {
    genericHelpers.handleError(err);
  }

  // Optional: Exponiere die Funktion global, falls andere Module darauf zugreifen sollen
  window.integrateReportsIntoFarmTable = integrateReportsIntoFarmTable;
})();
