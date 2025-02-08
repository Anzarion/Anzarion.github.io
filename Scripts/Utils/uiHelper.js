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
 *  - createElement: Erzeugt ein neues DOM-Element mit individuellen Optionen.
 *  - updateElement: Aktualisiert Inhalte und Attribute eines Elements.
 *  - removeElement: Entfernt ein Element aus dem DOM.
 *  - createButton: Erzeugt einen Button mit Text, CSS-Klassen und einem Click-Event.
 *  - createContainer: Erzeugt einen div-Container zur Gruppierung von UI-Komponenten.
 *  - showElement / hideElement: Blendet Elemente ein oder aus.
 *  - appendElement / clearElement: Fügt ein Kind-Element hinzu oder leert einen Container.
 *  - createTable: Baut eine Tabelle aus einem Datenarray.
 *  - attachEvent / detachEvent: Fügt Event-Listener hinzu oder entfernt sie.
 *  - createModal, showModal, hideModal: Funktionen zur Erzeugung und Steuerung von modalen Dialogen.
 *  - attachTooltip: Fügt einem Element einen einfachen Tooltip hinzu.
 *  - registerResponsiveHandler: Registriert einen Callback für Fenstergrößenänderungen.
 *  - createProgressBar, updateProgressBar, removeProgressBar: Funktionen zur Erzeugung und Aktualisierung von Fortschrittsbalken.
 */

(function(global) {
    'use strict';

    const uiHelper = {
        // ---------------- Basisfunktionen ----------------

        /**
         * Erzeugt ein neues DOM-Element.
         *
         * @param {string} tag - Der HTML-Tag (z. B. "div", "button").
         * @param {object} [options={}] - Optionen:
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
         *
         * @param {HTMLElement} element - Das zu aktualisierende Element.
         * @param {object} [options={}] - Optionen:
         *   - innerHTML {string} (optional)
         *   - attributes {object} (optional)
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
         *
         * @param {HTMLElement} element - Das zu entfernende Element.
         */
        removeElement(element) {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        },

        /**
         * Erzeugt einen Button.
         *
         * @param {string} text - Der angezeigte Text.
         * @param {object} [options={}] - Optionen:
         *   - classes {Array<string>} (optional, Standard: ["btn"])
         *   - onClick {function} (optional)
         *   - attributes {object} (optional)
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
         *
         * @param {string} id - Die ID des Containers.
         * @param {Array<string>} [classes=[]] - Optional, CSS-Klassen.
         * @returns {HTMLElement} Der erzeugte Container.
         */
        createContainer(id, classes = []) {
            return this.createElement("div", { id, classes });
        },

        /**
         * Blendet ein Element ein.
         *
         * @param {HTMLElement} element - Das einzublendende Element.
         */
        showElement(element) {
            if (element) {
                element.style.display = "";
            }
        },

        /**
         * Blendet ein Element aus.
         *
         * @param {HTMLElement} element - Das auszublendende Element.
         */
        hideElement(element) {
            if (element) {
                element.style.display = "none";
            }
        },

        /**
         * Fügt ein Kind-Element zum Eltern-Element hinzu.
         *
         * @param {HTMLElement} parent - Das Eltern-Element.
         * @param {HTMLElement} child - Das Kind-Element.
         */
        appendElement(parent, child) {
            if (parent && child) {
                parent.appendChild(child);
            }
        },

        /**
         * Leert den Inhalt eines Elements.
         *
         * @param {HTMLElement} element - Das zu leerende Element.
         */
        clearElement(element) {
            if (element) {
                element.innerHTML = "";
            }
        },

        /**
         * Erzeugt eine Tabelle aus Daten.
         *
         * @param {Array<object>} data - Array von Objekten (jede Zeile).
         * @param {Array<string>} columns - Liste der Spaltennamen (als Schlüssel in den Objekten).
         * @param {object} [options={}] - Optionen, z. B. CSS-Klassen.
         * @returns {HTMLTableElement} Die erzeugte Tabelle.
         */
        createTable(data, columns, options = {}) {
            const table = this.createElement("table", {
                classes: options.classes || ["vis"]
            });
            // Tabellenkopf
            const thead = this.createElement("thead");
            const headerRow = this.createElement("tr");
            columns.forEach(col => {
                const th = this.createElement("th", { innerHTML: col });
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            // Tabellenkörper
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
         *
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
         *
         * @param {HTMLElement} element - Das Ziel-Element.
         * @param {string} event - Der Eventname.
         * @param {function} handler - Die Event-Handler-Funktion.
         */
        detachEvent(element, event, handler) {
            if (element && typeof handler === "function") {
                element.removeEventListener(event, handler);
            }
        },

        // ---------------- Modale Dialoge ----------------

        /**
         * Erzeugt ein modales Fenster.
         *
         * @param {object} options - Optionen:
         *   - id {string} (optional)
         *   - header {string} (optional, HTML-Text für den Header)
         *   - content {string} (optional, HTML-Text für den Body)
         *   - footer {string} (optional, HTML-Text für den Footer)
         *   - classes {Array<string>} (optional, zusätzliche CSS-Klassen für den Container)
         * @returns {object} Ein Objekt mit den Elementen { overlay, container }.
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
         * Zeigt ein modales Fenster an, indem es dem Dokument angehängt wird.
         *
         * @param {object} modalObj - Das Objekt, das von createModal zurückgegeben wurde.
         */
        showModal(modalObj) {
            document.body.appendChild(modalObj.overlay);
            modalObj.overlay.style.display = "block";
        },

        /**
         * Schließt ein modales Fenster, indem es aus dem Dokument entfernt wird.
         *
         * @param {object} modalObj - Das Objekt, das von createModal zurückgegeben wurde.
         */
        hideModal(modalObj) {
            if (modalObj.overlay.parentNode) {
                modalObj.overlay.parentNode.removeChild(modalObj.overlay);
            }
        },

        // ---------------- Tooltips ----------------

        /**
         * Fügt einem Element einen einfachen Tooltip hinzu.
         * Bei mouseover wird ein Tooltip-Element erstellt und bei mouseout wieder entfernt.
         *
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
                // Positioniere den Tooltip oberhalb des Elements
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
         *
         * @param {function} callback - Die Funktion, die bei einem resize-Event aufgerufen wird.
         */
        registerResponsiveHandler(callback) {
            window.addEventListener("resize", callback);
        },

        /**
         * Entfernt einen zuvor registrierten resize-Event-Listener.
         *
         * @param {function} callback - Die Funktion, die entfernt werden soll.
         */
        removeResponsiveHandler(callback) {
            window.removeEventListener("resize", callback);
        },

        // ---------------- Dynamische Fortschrittsbalken ----------------

        /**
         * Erzeugt einen Fortschrittsbalken.
         *
         * @param {object} [options={}] - Optionen:
         *   - id {string} (optional)
         *   - classes {Array<string>} (optional)
         *   - initialProgress {number} (optional, Standard: 0, als Prozentwert)
         * @returns {object} Ein Objekt mit den Elementen { container, bar }.
         */
        createProgressBar(options = {}) {
            const container = this.createElement("div", { 
                id: options.id, 
                classes: ["progress-bar-container"].concat(options.classes || []) 
            });
            const bar = this.createElement("div", { classes: ["progress-bar"], attributes: { "role": "progressbar" } });
            bar.style.width = (options.initialProgress || 0) + "%";
            container.appendChild(bar);
            return { container, bar };
        },

        /**
         * Aktualisiert einen vorhandenen Fortschrittsbalken.
         *
         * @param {object} progressBarObj - Das Objekt, das von createProgressBar zurückgegeben wurde.
         * @param {number} progress - Der neue Fortschrittswert (als Prozentwert).
         */
        updateProgressBar(progressBarObj, progress) {
            if (progressBarObj && progressBarObj.bar) {
                progressBarObj.bar.style.width = progress + "%";
            }
        },

        /**
         * Entfernt einen Fortschrittsbalken aus dem DOM.
         *
         * @param {object} progressBarObj - Das Objekt, das von createProgressBar zurückgegeben wurde.
         */
        removeProgressBar(progressBarObj) {
            if (progressBarObj && progressBarObj.container && progressBarObj.container.parentNode) {
                progressBarObj.container.parentNode.removeChild(progressBarObj.container);
            }
        }
    };

    // Global verfügbar machen
    if (!global.uiHelper) {
        global.uiHelper = uiHelper;
    } else {
        console.warn("uiHelper ist bereits definiert. Überschreiben wird vermieden.");
    }

})(typeof window !== "undefined" ? window : this);
