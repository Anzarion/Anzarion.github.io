// genericHelpers.js
(function () {
  'use strict';

  function parseResourceValue(valueStr) {
    var clean = valueStr.replace(/[.,\s]/g, "");
    return parseInt(clean, 10);
  }

  function formatResourceOutput(value) {
    return value >= 1000 ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : value.toString();
  }

  function findRowByLabel($container, labelText) {
    const $rows = $container.find("tr");
    return $rows.filter((_, row) => {
      const cellText = jQuery(row).find("td, th").first().text().trim();
      return cellText === labelText;
    }).first();
  }

  function createTableCell(content, style, colspan) {
    const styleAttr = style ? ` style="${style}"` : '';
    const colspanAttr = colspan ? ` colspan="${colspan}"` : '';
    return `<td${colspanAttr}${styleAttr}>${content}</td>`;
  }

  function parseReportDate(dateString) {
    if (dateString.includes(',')) {
      const lastColonIndex = dateString.lastIndexOf(':');
      if (lastColonIndex !== -1) {
        dateString = dateString.substring(0, lastColonIndex) + '.' + dateString.substring(lastColonIndex + 1);
      }
      return new Date(dateString);
    } else {
      const [datePart, timePart] = dateString.split(' ');
      if (!datePart || !timePart) return new Date(dateString);
      const [day, month, year] = datePart.split('/');
      const isoString = `${year}-${month}-${day}T${timePart}`;
      return new Date(isoString);
    }
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

  function handleError(error) {
    UI.ErrorMessage(twSDK.tt('There was an error!'));
    console.error(`${twSDK.scriptInfo()} Error: `, error);
  }

  window.GenericHelpers = {
    parseResourceValue,
    formatResourceOutput,
    findRowByLabel,
    createTableCell,
    parseReportDate,
    formatReportTime,
    handleError
  };
})();
