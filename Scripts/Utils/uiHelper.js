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
 *  - createProgressBar, updateProgressBar, removeProgressBar,
 *  - addGlobalStyle, renderFixedWidget, tt
 */

(function(global) {
    'use strict';

    const uiHelper = {
        // ---------------- Basisfunktionen ----------------

        /**
         * Erzeugt ein neues DOM-Element.
         * @param {string} tag - Der HTML-Tag (z. B. "div", "button").
         * @param {Object} [options={}] - Optionen:
         *   - id {string} (optional)
         *   - classes {Array<string>} (optional)
         *   - attributes {object} (optional, z. B. { "data-type": "example" })
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
         * @param {Object} [options={}] - Zusätzliche Optionen (z.B. CSS-Klassen).
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
         * Fügt einen Event-Listener hinzu.
         * @param {HTMLElement} element - Das Ziel-Element.
         * @param {string} event - Der Eventname (z.B. "click").
         * @param {function} handler - Die Event-Handler-Funktion.
         */
        attachEvent(element, event, handler) {
            if (element && typeof handler === "function") {
                element.addEventListener(event, handler);
            }
        },

        /**
         * Entfernt einen Event-Listener.
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
         * @returns {Object} Ein Objekt mit { overlay, container }.
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
         * Zeigt ein modales Fenster an.
         * @param {Object} modalObj - Das Objekt von createModal.
         */
        showModal(modalObj) {
            document.body.appendChild(modalObj.overlay);
            modalObj.overlay.style.display = "block";
        },

        /**
         * Entfernt ein modales Fenster.
         * @param {Object} modalObj - Das Objekt von createModal.
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
         * Erzeugt einen Fortschrittsbalken.
         * Es werden keine festen Inline-Stile außer der Höhe gesetzt, damit die
         * spieleigenen CSS-Stile verwendet werden.
         * @param {Object} [options={}] - Optionen:
         *   - id {string} (optional)
         *   - classes {Array<string>} (optional)
         *   - initialProgress {number} (optional, Standard: 0, als Prozentwert)
         * @returns {Object} Ein Objekt mit { container, bar, progressLabel }.
         */
        createProgressBar(options = {}) {
            const container = this.createElement("div", { 
                id: options.id, 
                classes: ["progress-bar-container"].concat(options.classes || [])
            });
            // Wir setzen hier nur die Höhe; der Rest der Styles wird von den Spiele-CSS-Regeln übernommen.
            container.style.height = "20px";
            // Erzeuge den Balken; hier wird nur die Breite dynamisch gesetzt.
            const bar = this.createElement("div", { 
                classes: ["progress-bar"], 
                attributes: { "role": "progressbar" }
            });
            bar.style.width = (options.initialProgress || 0) + "%";
            container.appendChild(bar);
            // Erzeuge ein Label zur Anzeige des Fortschritts (z.B. "0%").
            const progressLabel = this.createElement("span", { 
                classes: ["count", "label"],
                innerHTML: (options.initialProgress || 0) + "%"
            });
            progressLabel.style.position = "absolute";
            progressLabel.style.width = "100%";
            progressLabel.style.textAlign = "center";
            progressLabel.style.lineHeight = "inherit";
            container.appendChild(progressLabel);
            return { container, bar, progressLabel };
        },

        /**
         * Aktualisiert den Fortschrittsbalken, indem die Breite des Balkens und das Label aktualisiert werden.
         * @param {Object} progressBarObj - Das Objekt von createProgressBar.
         * @param {number} progress - Der neue Fortschrittswert (als Prozentwert).
         */
        updateProgressBar(progressBarObj, progress) {
            if (progressBarObj && progressBarObj.bar) {
                progressBarObj.bar.style.width = progress + "%";
                if (progressBarObj.progressLabel) {
                    progressBarObj.progressLabel.textContent = progress + "%";
                }
            }
        },

        /**
         * Entfernt einen Fortschrittsbalken aus dem DOM.
         * @param {Object} progressBarObj - Das Objekt von createProgressBar.
         */
        removeProgressBar(progressBarObj) {
            if (progressBarObj && progressBarObj.container && progressBarObj.container.parentNode) {
                progressBarObj.container.parentNode.removeChild(progressBarObj.container);
            }
        },

        // ---------------- UI-spezifische Funktionen ----------------

        /**
         * Liefert globale CSS-Regeln für UI-Widgets.
         * @returns {string} CSS-Regeln als String.
         */
        addGlobalStyle() {
            return `
                .ra-table { border-collapse: collapse; }
                .ra-table th, .ra-table td { padding: 5px; text-align: center; }
                .ra-fixed-widget { 
                    position: fixed; 
                    top: 10vw; 
                    right: 10vw; 
                    z-index: 99999; 
                    border: 2px solid #7d510f; 
                    border-radius: 10px; 
                    padding: 10px; 
                    background: #e3d5b3 url('/graphic/index/main_bg.jpg') scroll right top repeat; 
                    overflow-y: auto;
                }
                .ra-fixed-widget h3 { margin: 0; padding: 0; }
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
         * @param {string} [customName="Widget"] - Der Name, der im Header angezeigt wird.
         * @returns {HTMLElement} Das gerenderte Widget.
         */
        renderFixedWidget(body, id, mainClass, customStyle, width, customName = "Widget") {
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
                    if (global.mobiledevice) {
                        jQuery('#content_value').prepend(content);
                    } else {
                        jQuery('#contentContainer').prepend(content);
                        jQuery(`#${id}`).draggable({
                            cancel: '.ra-table, input, textarea, button, select, option',
                        });
                        jQuery(`#${id} .custom-close-button`).on('click', function (e) {
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
        tt(string) {
            return string;
        }
    };

    if (!global.uiHelper) {
        global.uiHelper = uiHelper;
    } else {
        console.warn("uiHelper ist bereits definiert. Überschreiben wird vermieden.");
    }
})(typeof window !== "undefined" ? window : this);
