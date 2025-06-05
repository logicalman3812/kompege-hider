// ==UserScript==
// @name         kompege | hide author's tasks
// @namespace    https://github.com/logicalman3812/kompege-hider
// @version      1.0
// @author       archlinuxgui
// @description  for hide author's tasks
// @match        https://kompege.ru/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/logicalman3812/kompege-hider/main/kompege-hider.user.js
// @downloadURL  https://raw.githubusercontent.com/ТвойGitHubИмя/kompege-hide-authors/main/kompege-hide-authors.user.js
// ==/UserScript==

(function () {
    'use strict';

    let uiContainer = null;

    function getAuthorsOnPage() {
        const authors = new Set();
        const taskTextDivs = document.querySelectorAll('.task-text');

        taskTextDivs.forEach(div => {
            const firstChild = div.querySelector('*');
            if (firstChild) {
                const txt = firstChild.textContent.trim();
                const match = txt.match(/^\(([^)]+)\)/);
                if (match) {
                    authors.add(match[1]);
                }
            }
        });

        return [...authors].sort();
    }

    function hideTasksByAuthors(selectedAuthors) {
        document.querySelectorAll('td').forEach(td => {
            const taskText = td.querySelector('.task-text');
            if (!taskText) return;

            const firstChild = taskText.querySelector('*');
            if (!firstChild) return;

            const txt = firstChild.textContent.trim();
            const match = txt.match(/^\(([^)]+)\)/);
            if (!match) return;

            const author = match[1];
            if (selectedAuthors.includes(author)) {
                td.style.display = 'none';
                const numTd = td.previousElementSibling;
                if (numTd && numTd.classList.contains('center')) {
                    numTd.style.display = 'none';
                }
            }
        });
    }

    function hideAllAuthorTasks() {
        document.querySelectorAll('td').forEach(td => {
            const taskText = td.querySelector('.task-text');
            if (!taskText) return;

            const firstChild = taskText.querySelector('*');
            if (!firstChild) return;

            const txt = firstChild.textContent.trim();
            const match = txt.match(/^\(([^)]+)\)/);
            if (!match) return;

            td.style.display = 'none';
            const numTd = td.previousElementSibling;
            if (numTd && numTd.classList.contains('center')) {
                numTd.style.display = 'none';
            }
        });
    }

    function showAllTasks() {
        document.querySelectorAll('td').forEach(td => {
            td.style.display = '';
        });
    }

    function buildUI() {
        if (uiContainer) return;

        const authors = getAuthorsOnPage();
        if (!authors.length) {
            alert('Авторы не найдены на странице.');
            return;
        }

        uiContainer = document.createElement('div');
        uiContainer.style = `
            position: fixed; top:10px; right:10px;
            background:#fff; border:1px solid #ccc;
            padding:10px; z-index:9999;
            font-size:14px; font-family:sans-serif;
            border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.2);
            max-height:90vh; overflow-y:auto;
            width: 260px;
        `;

        const title = document.createElement('div');
        title.textContent = 'Скрыть задачи от авторов:';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        uiContainer.appendChild(title);

        const scrollBox = document.createElement('div');
        scrollBox.style = `
            max-height: 200px;
            overflow-y: auto;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            padding: 6px;
            border-radius: 4px;
            background: #fafafa;
        `;

        authors.forEach(a => {
            const lbl = document.createElement('label');
            lbl.style.display = 'block';
            lbl.style.marginBottom = '4px';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = a;
            cb.style.marginRight = '6px';
            lbl.append(cb);
            lbl.append(document.createTextNode(a));
            scrollBox.append(lbl);
        });

        uiContainer.appendChild(scrollBox);

        const btnGroup = document.createElement('div');
        btnGroup.style.marginTop = '4px';
        btnGroup.style.display = 'flex';
        btnGroup.style.flexDirection = 'column';
        btnGroup.style.gap = '6px';

        const makeButton = (text, onClick, color) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.onclick = onClick;
            btn.style.cssText = `
                padding:6px 12px; cursor:pointer;
                background:${color}; color:#fff;
                border:none; border-radius:4px;
                font-family:sans-serif; font-size:14px;
                user-select:none;
                transition: background-color 0.3s;
            `;
            btn.onmouseenter = () => btn.style.backgroundColor = shadeColor(color, -10);
            btn.onmouseleave = () => btn.style.backgroundColor = color;
            return btn;
        };

        btnGroup.appendChild(makeButton('Скрыть выбранных', () => {
            const sel = Array.from(scrollBox.querySelectorAll('input[type=checkbox]'))
                              .filter(cb => cb.checked)
                              .map(cb => cb.value);
            hideTasksByAuthors(sel);
        }, '#007bff'));

        btnGroup.appendChild(makeButton('Скрыть всех авторов', () => {
            hideAllAuthorTasks();
        }, '#dc3545'));

        btnGroup.appendChild(makeButton('Показать всё', () => {
            showAllTasks();
        }, '#28a745'));

        btnGroup.appendChild(makeButton('Закрыть панель', () => {
            uiContainer.remove();
            uiContainer = null;
        }, '#6c757d'));

        uiContainer.appendChild(btnGroup);
        document.body.append(uiContainer);
    }

    function shadeColor(color, percent) {
        let f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent;
        let R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#" + (0x1000000 +
            (Math.round((t-R)*p/100)+R)*0x10000 +
            (Math.round((t-G)*p/100)+G)*0x100 +
            (Math.round((t-B)*p/100)+B)).toString(16).slice(1);
    }

    function addOpenButton() {
        const btn = document.createElement('button');
        btn.textContent = 'Открыть панель авторов';
        btn.onclick = buildUI;
        btn.style.cssText = `
            position:fixed; bottom:10px; right:10px;
            padding:8px 14px; cursor:pointer;
            background:#343a40; color:#fff;
            border:none; border-radius:6px;
            font-family:sans-serif; font-size:14px;
            z-index:9999;
            user-select:none;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transition: background-color 0.3s;
        `;
        btn.onmouseenter = () => btn.style.backgroundColor = '#23272b';
        btn.onmouseleave = () => btn.style.backgroundColor = '#343a40';
        document.body.appendChild(btn);
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            addOpenButton();
        }, 1000);
    });
})();
