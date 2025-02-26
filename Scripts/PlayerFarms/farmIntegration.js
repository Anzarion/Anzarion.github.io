// farmIntegration.js
(function () {
  'use strict';

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
      // Prüfe, ob Angriff erlaubt ist
      const attackable = await canAttack(report.defender);
      if (!attackable) continue;
      const targetId = report.targetId || i;
      const viewIdMatch = report.reportUrl.match(/view=(\d+)/);
      const viewId = viewIdMatch ? viewIdMatch[1] : 0;
      const rowClass = (i % 2 === 0) ? 'a' : 'b';
      // Berechne zusätzlich produzierte Ressourcen:
      const producedWood = await calculateProducedResources(report.timestamp, report.buildingLevels.timberCamp);
      const producedStone = await calculateProducedResources(report.timestamp, report.buildingLevels.clayPit);
      const producedIron  = await calculateProducedResources(report.timestamp, report.buildingLevels.ironMine);
      const originalWood = report.scoutedResources ? report.scoutedResources.wood : 0;
      const originalStone = report.scoutedResources ? report.scoutedResources.stone : 0;
      const originalIron = report.scoutedResources ? report.scoutedResources.iron : 0;
      const updatedWoodRaw = originalWood + producedWood;
      const updatedStoneRaw = originalStone + producedStone;
      const updatedIronRaw = originalIron + producedIron;
      const plunderableCapacity = calculatePlunderableCapacity(report.buildingLevels);
      const updatedWood = Math.min(updatedWoodRaw, plunderableCapacity);
      const updatedStone = Math.min(updatedStoneRaw, plunderableCapacity);
      const updatedIron = Math.min(updatedIronRaw, plunderableCapacity);
      const woodText = report.scoutedResources
        ? (updatedWood === plunderableCapacity
            ? `<span style="color: red;">${formatResourceOutput(updatedWood)}</span>`
            : formatResourceOutput(updatedWood))
        : '';
      const stoneText = report.scoutedResources
        ? (updatedStone === plunderableCapacity
            ? `<span style="color: red;">${formatResourceOutput(updatedStone)}</span>`
            : formatResourceOutput(updatedStone))
        : '';
      const ironText = report.scoutedResources
        ? (updatedIron === plunderableCapacity
            ? `<span style="color: red;">${formatResourceOutput(updatedIron)}</span>`
            : formatResourceOutput(updatedIron))
        : '';
      const resHtml = report.scoutedResources
        ? `<span class="nowrap"><span class="icon header wood" title="Wood"></span><span class="res">${woodText}</span></span>
           <span class="nowrap"><span class="icon header stone" title="Clay"></span><span class="res">${stoneText}</span></span>
           <span class="nowrap"><span class="icon header iron" title="Iron"></span><span class="res">${ironText}</span></span>`
        : '';
      let rowHtml = '';
      rowHtml += createTableCell(`<a onclick="return Accountmanager.farm.deleteReport(${targetId});" title="Delete all reports for this village" class="tooltip" href="#">
        <img src="https://dszz.innogamescdn.com/asset/449b3b09/graphic/delete_small.png" alt="" />
      </a>`);
      rowHtml += createTableCell(`<img src="https://dszz.innogamescdn.com/asset/449b3b09/graphic/dots/green.png" title="Complete victory" alt="" class="tooltip" />`);
      rowHtml += createTableCell(`<img src="https://dszz.innogamescdn.com/asset/449b3b09/graphic/max_loot/0.png" title="Partial haul: Your soldiers looted everything they could find." alt="" class="tooltip" />`);
      rowHtml += createTableCell(`<a href="${report.reportUrl}">${report.defender}</a>`);
      rowHtml += createTableCell(formatReportTime(report.timestamp));
      rowHtml += createTableCell(resHtml, 'text-align: center;', 3);
      rowHtml += createTableCell(report.buildingLevels.wall, 'text-align: center;');
      let distance = "";
      if (report.defenderCoords) {
        distance = twSDK.calculateDistanceFromCurrentVillage(report.defenderCoords).toFixed(1);
      }
      rowHtml += createTableCell(distance, 'text-align: center;');
      rowHtml += createTableCell(`<a href="#" onclick="return Accountmanager.farm.sendUnits(this, ${targetId}, 110)" class="tooltip farm_icon farm_icon_a" title="Send attack using Template A"></a>`, 'text-align: center;');
      rowHtml += createTableCell(`<a href="#" onclick="return Accountmanager.farm.sendUnits(this, ${targetId}, 141)" class="tooltip farm_icon farm_icon_b" title="Send attack using Template B"></a>`, 'text-align: center;');
      rowHtml += createTableCell(`<a href="#" onclick="return Accountmanager.farm.sendUnitsFromReport(this, ${targetId}, ${viewId}, {})" class="tooltip farm_icon farm_icon_c" title="Send attack using report info"></a>`, 'text-align: center;');
      rowHtml += createTableCell(`<a href="/game.php?village=447&screen=place&target=${targetId}" onclick="return Accountmanager.farm.openRallyPoint(${targetId}, event)">
        <img src="https://dszz.innogamescdn.com/asset/449b3b09/graphic/buildings/place.png" alt="Rally point" />
      </a>`, 'text-align: center;');
      rowsHtml += `<tr class="player_report row_${rowClass}">${rowHtml}</tr>`;
    }
    $plunderList.append(rowsHtml);
    console.log('Spielerberichte wurden in die Farm-Assistent-Tabelle integriert.');
  }

  // Exportiere die Funktion global
  window.integrateReportsIntoFarmTable = integrateReportsIntoFarmTable;

  // Falls weitere farm-spezifische Funktionen benötigt werden, können diese hier ergänzt werden.
})();
