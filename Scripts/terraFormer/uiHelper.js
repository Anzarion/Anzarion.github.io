/**
 * 🎨 uiHelper.js
 * =====================
 * Autor:        Anzarion
 * Version:      1.0.0
 * Beschreibung: Stellt Funktionen zur Erstellung von UI-Elementen bereit.
 * GitHub:       https://anzarion.github.io/Scripts/terraFormer/uiHelper.js
 * 
 * Funktionen:
 *  - `createUIBox(options)`: Erstellt eine UI-Box mit gegebenen Optionen.
 *  - `createButton(label, onClick)`: Erstellt einen Button mit Event-Listener.
 *  - `updateUIBoxContent(elementId, content)`: Aktualisiert den Inhalt eines UI-Elements.
 * 
 * Änderungen:
 *  - 1.0.0: Initiale Version mit grundlegenden UI-Elementen
 */

const uiHelper = (() => {
    return {
        // Erstellt eine UI-Box mit den gegebenen Optionen
        createUIBox: function(options) {
            const box = document.createElement("div");
            box.id = options.id || "uiBox";
            box.style.position = "fixed";
            box.style.top = options.top || "100px";
            box.style.right = options.right || "10px";
            box.style.width = options.width || "250px";
            box.style.background = options.background || "#f4e4bc";
            box.style.border = options.border || "2px solid #5c4828";
            box.style.padding = options.padding || "10px";
            box.style.zIndex = "9999";
            box.style.fontSize = options.fontSize || "12px";
            box.style.overflowY = "auto";
            box.style.maxHeight = options.maxHeight || "400px";
            box.innerHTML = options.content || "<b>UI Box</b>";
            document.body.appendChild(box);
        },

        // Erstellt einen Button mit Event-Listener
        createButton: function(label, onClick) {
            const button = document.createElement("button");
            button.textContent = label;
            button.style.margin = "5px";
            button.addEventListener("click", onClick);
            return button;
        },

        // Aktualisiert den Inhalt eines bestehenden UI-Elements
        updateUIBoxContent: function(elementId, content) {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = content;
            }
        }
    };
})();
