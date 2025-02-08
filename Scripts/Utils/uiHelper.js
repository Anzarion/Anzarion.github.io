/**
 * uiHelper.js
 * ====================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Eine Sammlung von Funktionen zur dynamischen Erzeugung, Aktualisierung,
 *               Veränderung und Löschung von UI-Elementen, die sich nahtlos in das
 *               Aussehen des Browsergames integrieren.
 * 
 * Funktionen:
 *  - createElement, updateElement, removeElement, createButton, createContainer,
 *    showElement, hideElement, appendElement, clearElement, createTable,
 *    attachEvent, detachEvent,
 *  - createModal, showModal, hideModal,
 *  - attachTooltip,
 *  - registerResponsiveHandler, removeResponsiveHandler,
 *  - createProgressBar, updateProgressBar,
 *  - addGlobalStyle, renderFixedWidget, tt
 */

(function(global) {
    'use strict';

    const uiHelper = {
        // Eigenschaft zur Erkennung mobiler Geräte
        isMobile: (document.getElementById("mobileHeader") !== null),

        // ---------------- Basisfunktionen ----------------

        /**
         * Erzeugt ein neues DOM-Element.
         * @param {string} tag - Der HTML-Tag (z. B. "div", "button").
         * @param {Object} [options={}] - Optionen:
         *   - id {string} (optional)
         *   - classes {Array<string>} (optional)
         *   - attributes {Object} (optional, z. B. { "data-type": "example" })
         *   - innerHTML {string} (optional)
         * @returns {HTMLElement} Das erzeugte Element.
         */
        createElement(tag, options = {}) {
            const elem = document.createElement(tag);
            if (options.id) {
                elem.id = options.id;
            }
            if (options.classes && Array.isArray(options.classes)) {
                elem.classList.add(...options.classes);
            }
            if (options.attributes && typeof options.attributes === "object") {
                Object.entries(options.attributes).forEach(([attr, value]) => {
                    elem.setAttribute(attr, value);
                });
            }
            if (options.innerHTML) {
                elem.innerHTML = options.innerHTML;
            }
            return elem;
        },

        /**
         * Aktualisiert den Inhalt oder die Attribute eines Elements.
         * @param {HTMLElement} element - Das zu aktualisierende Element.
         * @param {Object} [options={}] - Optionen: innerHTML und attributes.
         */
        updateElement(element, options = {}) {
            if (!element) return;
            if (options.innerHTML !== undefined) {
                element.innerHTML = options.innerHTML;
            }
            if (options.attributes && typeof options.attributes === "object") {
                Object.entries(options.attributes).forEach(([attr, value]) => {
                    element.setAttribute(attr, value);
                });
            }
        },

        /**
         * Entfernt ein Element aus dem DOM.
         * @param {HTMLElement} element - Das zu entfernende Element.
         */
        removeElement(element) {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        },

        /**
         * Erzeugt einen Button.
         * @param {string} text - Der angezeigte Text.
         * @param {Object} [options={}] - Optionen: classes, onClick und attributes.
         * @returns {HTMLButtonElement} Der erzeugte Button.
         */
        createButton(text, options = {}) {
            const btn = this.createElement("button", {
                classes: options.classes || ["btn"],
                attributes: options.attributes,
                innerHTML: text
            });
            if (typeof options.onClick === "function") {
                btn.addEventListener("click", options.onClick);
            }
            return btn;
        },

        /**
         * Erzeugt einen Container (div) für UI-Komponenten.
         * @param {string} id - Die ID des Containers.
         * @param {Array<string>} [classes=[]] - Optionale CSS-Klassen.
         * @returns {HTMLElement} Der erzeugte Container.
         */
        createContainer(id, classes = []) {
            return this.createElement("div", { id, classes });
        },

        /**
         * Blendet ein Element ein.
         * @param {HTMLElement} element - Das einzublendende Element.
         */
        showElement(element) {
            if (element) element.style.display = "";
        },

        /**
         * Blendet ein Element aus.
         * @param {HTMLElement} element - Das auszublendende Element.
         */
        hideElement(element) {
            if (element) element.style.display = "none";
        },

        /**
         * Fügt ein Kind-Element zum Eltern-Element hinzu.
         * @param {HTMLElement} parent - Das Eltern-Element.
         * @param {HTMLElement} child - Das Kind-Element.
         */
        appendElement(parent, child) {
            if (parent && child) parent.appendChild(child);
        },

        /**
         * Leert den Inhalt eines Elements.
         * @param {HTMLElement} element - Das zu leerende Element.
         */
        clearElement(element) {
            if (element) element.innerHTML = "";
        },

        /**
         * Erzeugt eine Tabelle aus einem Array von Objekten.
         * @param {Array<Object>} data - Array von Zeilen-Objekten.
         * @param {Array<string>} columns - Spaltennamen (Schlüssel in den Objekten).
         * @param {Object} [options={}] - Zusätzliche Optionen (z. B. CSS-Klassen).
         * @returns {HTMLTableElement} Die erzeugte Tabelle.
         */
        createTable(data, columns, options = {}) {
            const table = this.createElement("table", {
                classes: options.classes || ["vis"]
            });
            const thead = this.createElement("thead");
            const headerRow = this.createElement("tr");
            columns.forEach(col => {
                const th = this.createElement("th", { innerHTML: col });
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            const tbody = this.createElement("tbody");
            data.forEach(item => {
                const row = this.createElement("tr");
                columns.forEach(col => {
                    const td = this.createElement("td", { innerHTML: item[col] !== undefined ? item[col] : "" });
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            return table;
        },

        /**
         * Fügt einen Event-Listener zu einem Element hinzu.
         * @param {HTMLElement} element - Das Ziel-Element.
         * @param {string} event - Der Eventname (z. B. "click").
         * @param {function} handler - Die Event-Handler-Funktion.
         */
        attachEvent(element, event, handler) {
            if (element && typeof handler === "function") {
                element.addEventListener(event, handler);
            }
        },

        /**
         * Entfernt einen Event-Listener von einem Element.
         * @param {HTMLElement} element - Das Ziel-Element.
         * @param {string} event - Der Eventname.
         * @param {function} handler - Die zu entfernende Funktion.
         */
        detachEvent(element, event, handler) {
            if (element && typeof handler === "function") {
                element.removeEventListener(event, handler);
            }
        },

        // ---------------- Modale Dialoge ----------------

        /**
         * Erzeugt ein modales Fenster.
         * @param {Object} [options={}] - Optionen:
         *   - id {string} (optional)
         *   - header {string} (optional, HTML für den Header)
         *   - content {string} (optional, HTML für den Body)
         *   - footer {string} (optional, HTML für den Footer)
         *   - classes {Array<string>} (optional)
         * @returns {Object} Ein Objekt mit den DOM-Elementen { overlay, container }.
         */
        createModal(options = {}) {
            const overlay = this.createElement("div", { classes: ["modal-overlay"] });
            const container = this.createElement("div", { 
                classes: ["modal-container"].concat(options.classes || []),
                id: options.id 
            });
            if (options.header) {
                const header = this.createElement("div", { classes: ["modal-header"], innerHTML: options.header });
                container.appendChild(header);
            }
            const body = this.createElement("div", { classes: ["modal-body"], innerHTML: options.content || "" });
            container.appendChild(body);
            if (options.footer) {
                const footer = this.createElement("div", { classes: ["modal-footer"], innerHTML: options.footer });
                container.appendChild(footer);
            }
            overlay.appendChild(container);
            return { overlay, container };
        },

        /**
         * Zeigt ein modales Fenster an, indem es dem Dokument hinzugefügt wird.
         * @param {Object} modalObj - Das Objekt, das von createModal zurückgegeben wurde.
         */
        showModal(modalObj) {
            document.body.appendChild(modalObj.overlay);
            modalObj.overlay.style.display = "block";
        },

        /**
         * Entfernt ein modales Fenster aus dem DOM.
         * @param {Object} modalObj - Das Objekt, das von createModal zurückgegeben wurde.
         */
        hideModal(modalObj) {
            if (modalObj.overlay.parentNode) {
                modalObj.overlay.parentNode.removeChild(modalObj.overlay);
            }
        },

        // ---------------- Tooltips ----------------

        /**
         * Fügt einem Element einen einfachen Tooltip hinzu.
         * @param {HTMLElement} element - Das Ziel-Element.
         * @param {string} text - Der Tooltip-Text.
         */
        attachTooltip(element, text) {
            let tooltip;
            function showTooltip(e) {
                tooltip = document.createElement("div");
                tooltip.className = "ui-tooltip";
                tooltip.innerHTML = text;
                tooltip.style.position = "absolute";
                document.body.appendChild(tooltip);
                const rect = element.getBoundingClientRect();
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + "px";
                tooltip.style.left = (rect.left + (rect.width - tooltip.offsetWidth) / 2) + "px";
            }
            function hideTooltip() {
                if (tooltip && tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                    tooltip = null;
                }
            }
            element.addEventListener("mouseover", showTooltip);
            element.addEventListener("mouseout", hideTooltip);
        },

        // ---------------- Responsive Anpassungen ----------------

        /**
         * Registriert einen Callback, der bei Fenstergrößenänderungen ausgeführt wird.
         * @param {function} callback - Die Callback-Funktion.
         */
        registerResponsiveHandler(callback) {
            window.addEventListener("resize", callback);
        },

        /**
         * Entfernt einen registrierten Resize-Event-Listener.
         * @param {function} callback - Die zu entfernende Funktion.
         */
        removeResponsiveHandler(callback) {
            window.removeEventListener("resize", callback);
        },

        // ---------------- Dynamische Fortschrittsbalken ----------------

        /**
         * Erzeugt einen Fortschrittsbalken, der die spieleigenen CSS‑Stile verwendet.
         * Die Struktur entspricht der progressbar-Funktionalität:
         * Ein äußerer Container mit ID "progressbar" und Klasse "progress-bar",
         * ein inneres Div mit ID "progress" und ein Label mit der Klasse "count".
         * @param {number} total - Die Gesamtanzahl an Schritten (z.B. Gesamtberichte).
         */
        createProgressBar: function(total) {
            const width = jQuery('#content_value')[0].clientWidth;
            const preloaderContent = `
                <div id="progressbar" class="progress-bar" style="margin-bottom:12px;">
                    <span class="count label">0/${total}</span>
                    <div id="progress">
                        <span class="count label" style="width: ${width}px;">
                            0/${total}
                        </span>
                    </div>
                </div>
            `;
    
            if (this.isMobile) {
                jQuery('#content_value').eq(0).prepend(preloaderContent);
            } else {
                jQuery('#contentContainer').eq(0).prepend(preloaderContent);
            }
        },

        /**
         * Aktualisiert den Fortschrittsbalken, indem die Breite des Füll-Divs und das Label aktualisiert werden.
         * @param {number} index - Der aktuelle Fortschritt (0-basiert).
         * @param {number} total - Die Gesamtanzahl der Schritte.
         */
        updateProgressBar: function(index, total) {
            jQuery('#progress').css('width', `${((index + 1) / total) * 100}%`);
            jQuery('.count').text(`${index + 1}/${total}`);
            if (index + 1 == total) {
                jQuery('#progressbar').fadeOut(1000);
            }
        },

        // ---------------- UI-spezifische Funktionen ----------------

        /**
         * Liefert globale CSS-Regeln für UI-Widgets.
         * @returns {string} Die CSS-Regeln als String.
         */
        addGlobalStyle: function() {
            return `
                /* Table Styling */
                .ra-table-container { overflow-y: auto; overflow-x: hidden; height: auto; max-height: 400px; }
                .ra-table th { font-size: 14px; }
                .ra-table th label { margin: 0; padding: 0; }
                .ra-table th,
                .ra-table td { padding: 5px; text-align: center; }
                .ra-table td a { word-break: break-all; }
                .ra-table a:focus { color: blue; }
                .ra-table a.btn:focus { color: #fff; }
                .ra-table tr:nth-of-type(2n) td { background-color: #f0e2be; }
                .ra-table tr:nth-of-type(2n+1) td { background-color: #fff5da; }
    
                .ra-table-v2 th,
                .ra-table-v2 td { text-align: left; }
    
                .ra-table-v3 { border: 2px solid #bd9c5a; }
                .ra-table-v3 th,
                .ra-table-v3 td { border-collapse: separate; border: 1px solid #bd9c5a; text-align: left; }
    
                /* Inputs */
                .ra-textarea { width: 100%; height: 80px; resize: none; }
    
                /* Popup */
                .ra-popup-content { width: 360px; }
                .ra-popup-content * { box-sizing: border-box; }
                .ra-popup-content input[type="text"] { padding: 3px; width: 100%; }
                .ra-popup-content .btn-confirm-yes { padding: 3px !important; }
                .ra-popup-content label { display: block; margin-bottom: 5px; font-weight: 600; }
                .ra-popup-content > div { margin-bottom: 15px; }
                .ra-popup-content > div:last-child { margin-bottom: 0 !important; }
                .ra-popup-content textarea { width: 100%; height: 100px; resize: none; }
    
                /* Elements */
                .ra-details { display: block; margin-bottom: 8px; border: 1px solid #603000; padding: 8px; border-radius: 4px; }
                .ra-details summary { font-weight: 600; cursor: pointer; }
                .ra-details p { margin: 10px 0 0 0; padding: 0; }
    
                /* Helpers */
                .ra-pa5 { padding: 5px !important; }
                .ra-mt15 { margin-top: 15px !important; }
                .ra-mb10 { margin-bottom: 10px !important; }
                .ra-mb15 { margin-bottom: 15px !important; }
                .ra-tal { text-align: left !important; }
                .ra-tac { text-align: center !important; }
                .ra-tar { text-align: right !important; }
    
                /* RESPONSIVE */
                @media (max-width: 480px) {
                    .ra-fixed-widget {
                        position: relative !important;
                        top: 0;
                        left: 0;
                        display: block;
                        width: auto;
                        height: auto;
                        z-index: 1;
                    }
    
                    .ra-box-widget {
                        position: relative;
                        display: block;
                        box-sizing: border-box;
                        width: 97%;
                        height: auto;
                        margin: 10px auto;
                    }
    
                    .ra-table {
                        border-collapse: collapse !important;
                    }
    
                    .custom-close-button { display: none; }
                    .ra-fixed-widget h3 { margin-bottom: 15px; }
                    .ra-popup-content { width: 100%; }
                }
            `;
        },

        /**
         * Rendert ein feststehendes Widget mit Header, Body und Footer.
         * Das Widget ist draggable (sofern jQuery UI verfügbar) und enthält einen Close-Button.
         * @param {string} body - Der HTML-Inhalt für den Body des Widgets.
         * @param {string} id - Eine eindeutige ID für das Widget.
         * @param {string} mainClass - Eine Basisklasse für das Widget.
         * @param {string} customStyle - Zusätzliche CSS-Regeln als String.
         * @param {string} width - Die Breite des Widgets (z. B. "360px").
         * @param {string} [customName="Widget"] - Der im Header angezeigte Name.
         * @returns {HTMLElement} Das gerenderte Widget.
         */
        renderFixedWidget: function(body, id, mainClass, customStyle, width, customName = "Widget") {
            const globalStyle = this.addGlobalStyle();
            const content = `
                <div class="${mainClass} ra-fixed-widget" id="${id}">
                    <div class="${mainClass}-header">
                        <h3>${customName}</h3>
                    </div>
                    <div class="${mainClass}-body">
                        ${body}
                    </div>
                    <div class="${mainClass}-footer">
                        <small>
                            <strong>${customName} v1.0</strong> - 
                            <a href="#" target="_blank" rel="noreferrer noopener">Help</a>
                        </small>
                    </div>
                    <a class="popup_box_close custom-close-button" href="#">&nbsp;</a>
                </div>
                <style>
                    .${mainClass} { 
                        position: fixed; 
                        top: 10vw; 
                        right: 10vw; 
                        z-index: 99999; 
                        border: 2px solid #7d510f; 
                        border-radius: 10px; 
                        padding: 10px; 
                        background: #e3d5b3 url('/graphic/index/main_bg.jpg') scroll right top repeat; 
                        overflow-y: auto;
                        width: ${width || "360px"};
                    }
                    .${mainClass} * { box-sizing: border-box; }
                    ${globalStyle}
                    .custom-close-button { 
                        position: absolute; 
                        top: 5px; 
                        right: 5px; 
                        cursor: pointer;
                    }
                    ${customStyle}
                </style>
            `;
    
            if (window.jQuery) {
                if (jQuery(`#${id}`).length < 1) {
                    if (this.isMobile) {
                        jQuery('#content_value').prepend(content);
                    } else {
                        jQuery('#contentContainer').prepend(content);
                        jQuery(`#${id}`).draggable({
                            cancel: '.ra-table, input, textarea, button, select, option'
                        });
                        jQuery(`#${id} .custom-close-button`).on('click', function(e) {
                            e.preventDefault();
                            jQuery(`#${id}`).remove();
                        });
                    }
                } else {
                    jQuery(`.${mainClass}-body`).html(body);
                }
            } else {
                const container = this.createElement("div", { innerHTML: content });
                document.body.prepend(container);
            }
            return document.getElementById(id);
        },

        /**
         * Übersetzungsfunktion. Gibt den übergebenen String zurück.
         * @param {string} string - Der zu übersetzende String.
         * @returns {string} Der übersetzte oder Original-String.
         */
        tt: function(string) {
            return string;
        }
    };

    if (!global.uiHelper) {
        global.uiHelper = uiHelper;
    } else {
        console.warn("uiHelper ist bereits definiert. Überschreiben wird vermieden.");
    }
})(typeof window !== "undefined" ? window : this);
