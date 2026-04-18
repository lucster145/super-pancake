// App definitions with Play Store info
const APPS = {
    playstore: {
        name: 'Play Store',
        icon: '🎮',
        color: '#4CAF50',
        minWidth: 800,
        minHeight: 600
    },
    notes: {
        name: 'Notes',
        icon: '📝',
        color: '#FFB81C',
        minWidth: 400,
        minHeight: 300
    },
    game2048: {
        name: '2048 Game',
        icon: '🎯',
        color: '#3498DB',
        minWidth: 500,
        minHeight: 400
    },
    musicplayer: {
        name: 'Music Player',
        icon: '🎵',
        color: '#E91E63',
        minWidth: 400,
        minHeight: 350
    },
    calculator: {
        name: 'Calculator',
        icon: '🧮',
        color: '#9C27B0',
        minWidth: 350,
        minHeight: 400
    },
    memory: {
        name: 'Memory Game',
        icon: '🧠',
        color: '#FF5722',
        minWidth: 500,
        minHeight: 450
    },
    dino: {
        name: 'Chrome Dino',
        icon: '🦕',
        color: '#8B4513',
        minWidth: 600,
        minHeight: 300
    },
    books: {
        name: 'Books Library',
        icon: '📚',
        color: '#FF6B6B',
        minWidth: 600,
        minHeight: 500
    }
};

// Store app installation state
const installedApps = new Set(['playstore', 'notes', 'game2048', 'musicplayer', 'calculator', 'memory', 'dino', 'books']);

// Global error handler for better debugging
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    // Could show user-friendly error message here
});

// Performance: Use requestAnimationFrame for smooth animations
let animationFrameId = null;

function requestAnimationFrame(callback) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = window.requestAnimationFrame(callback);
}

// Window management
class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndex = 10;
        this.offsetX = 50;
        this.offsetY = 50;
        this.offsetCounter = 0;
    }

    createWindow(appId) {
        const app = APPS[appId];
        if (!app) return null;

        const template = document.getElementById('window-template');
        const windowEl = template.content.cloneNode(true).firstElementChild;
        
        windowEl.dataset.appId = appId;
        windowEl.style.width = app.minWidth + 'px';
        windowEl.style.height = app.minHeight + 'px';
        windowEl.style.left = (this.offsetCounter * this.offsetX) + 'px';
        windowEl.style.top = (this.offsetCounter * this.offsetY) + 'px';
        
        this.offsetCounter = (this.offsetCounter + 1) % 5;

        const titleEl = windowEl.querySelector('.window-title');
        titleEl.textContent = app.name;

        const contentEl = windowEl.querySelector('.window-content');
        contentEl.id = `content-${appId}`;
        contentEl.innerHTML = this.getWindowContent(appId);

        const container = document.getElementById('windows-container');
        container.appendChild(windowEl);

        // Setup window controls
        this.setupWindowControls(windowEl);
        this.makeWindowDraggable(windowEl);
        this.makeWindowResizable(windowEl);
        this.focusWindow(windowEl);

        // Initialize app-specific logic
        this.initializeAppLogic(appId, contentEl);

        this.windows.push(windowEl);
        
        // Add to taskbar
        this.addToTaskbar(appId, windowEl);

        return windowEl;
    }

    focusWindow(windowEl) {
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        windowEl.classList.add('active');
        windowEl.style.zIndex = this.zIndex++;
        
        const appId = windowEl.dataset.appId;
        document.querySelectorAll('.taskbar-app-icon').forEach(icon => {
            if (icon.dataset.appId === appId) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });
    }

    setupWindowControls(windowEl) {
        const minimizeBtn = windowEl.querySelector('.minimize-btn');
        const maximizeBtn = windowEl.querySelector('.maximize-btn');
        const closeBtn = windowEl.querySelector('.close-btn');
        const header = windowEl.querySelector('.window-header');

        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            windowEl.style.display = 'none';
        });

        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (windowEl.dataset.maximized === 'true') {
                windowEl.style.width = windowEl.dataset.originalWidth;
                windowEl.style.height = windowEl.dataset.originalHeight;
                windowEl.style.left = windowEl.dataset.originalLeft;
                windowEl.style.top = windowEl.dataset.originalTop;
                windowEl.dataset.maximized = 'false';
            } else {
                windowEl.dataset.originalWidth = windowEl.style.width;
                windowEl.dataset.originalHeight = windowEl.style.height;
                windowEl.dataset.originalLeft = windowEl.style.left;
                windowEl.dataset.originalTop = windowEl.style.top;
                windowEl.style.width = '100%';
                windowEl.style.height = 'calc(100% - 48px)';
                windowEl.style.left = '0';
                windowEl.style.top = '0';
                windowEl.dataset.maximized = 'true';
            }
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(windowEl);
        });

        header.addEventListener('mousedown', () => {
            this.focusWindow(windowEl);
        });
    }

    makeWindowDraggable(windowEl) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        const header = windowEl.querySelector('.window-header');

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            isDragging = true;
            initialX = e.clientX - windowEl.offsetLeft;
            initialY = e.clientY - windowEl.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            windowEl.style.left = currentX + 'px';
            windowEl.style.top = currentY + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    makeWindowResizable(windowEl) {
        const content = windowEl.querySelector('.window-content');
        let isResizing = false;
        let startX;
        let startY;
        let startWidth;
        let startHeight;

        // Resize from bottom-right corner by using a pseudo-element
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = 'position: absolute; width: 15px; height: 15px; right: 0; bottom: 0; cursor: nwse-resize;';
        windowEl.appendChild(resizeHandle);

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = windowEl.offsetWidth;
            startHeight = windowEl.offsetHeight;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);
            windowEl.style.width = Math.max(300, newWidth) + 'px';
            windowEl.style.height = Math.max(200, newHeight) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    addToTaskbar(appId, windowEl) {
        const taskbarApps = document.getElementById('taskbar-apps');
        
        // Check if already in taskbar
        if (document.querySelector(`[data-app-id="${appId}"]`)) {
            return;
        }

        const app = APPS[appId];
        const icon = document.createElement('div');
        icon.className = 'taskbar-app-icon';
        icon.dataset.appId = appId;
        icon.textContent = app.icon;

        icon.addEventListener('click', () => {
            if (windowEl.style.display === 'none') {
                windowEl.style.display = 'flex';
            }
            this.focusWindow(windowEl);
        });

        taskbarApps.appendChild(icon);
    }

    closeWindow(windowEl) {
        const appId = windowEl.dataset.appId;
        windowEl.remove();
        this.windows = this.windows.filter(w => w !== windowEl);
        
        const taskbarIcon = document.querySelector(`[data-app-id="${appId}"]`);
        if (taskbarIcon) {
            taskbarIcon.remove();
        }
    }

    getWindowContent(appId) {
        const app = APPS[appId];
        
        switch(appId) {
            case 'playstore':
                return this.getPlayStoreContent();
            case 'notes':
                return this.getNotesContent();
            case 'game2048':
                return this.getGame2048Content();
            case 'musicplayer':
                return this.getMusicPlayerContent();
            case 'calculator':
                return this.getCalculatorContent();
            case 'memory':
                return this.getMemoryGameContent();
            case 'dino':
                return this.getDinoGameContent();
            case 'books':
                return this.getBooksContent();
            default:
                return '<p>App not implemented</p>';
        }
    }

    getPlayStoreContent() {
        let html = '<div class="play-store-content">';
        
        for (const [appId, app] of Object.entries(APPS)) {
            if (appId === 'playstore') continue;
            
            const isInstalled = installedApps.has(appId);
            const btnText = isInstalled ? 'OPEN' : 'INSTALL';
            const btnClass = isInstalled ? 'installed' : '';
            
            html += `
                <div class="app-card" style="background: linear-gradient(135deg, ${app.color} 0%, ${this.shadeColor(app.color, -20)} 100%);">
                    <div class="app-card-icon">${app.icon}</div>
                    <div class="app-card-name">${app.name}</div>
                    <div class="app-card-desc">Amazing app</div>
                    <button class="app-card-btn ${btnClass}" onclick="installOrOpenApp('${appId}')">${btnText}</button>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    getNotesContent() {
        return `
            <div class="notes-content">
                <div class="notes-header">
                    <button class="game-button" onclick="addNewNote()">+ New Note</button>
                </div>
                <div class="notes-list" id="notes-list">
                    <div class="note-item" onclick="selectNote(this)">Click to add note</div>
                </div>
                <textarea class="note-text" id="note-text" placeholder="Write your note here..."></textarea>
            </div>
        `;
    }

    getGame2048Content() {
        return `
            <div class="game-content">
                <div class="game-title">2048</div>
                <div class="game-board">
                    <div id="game-board" class="game-grid"></div>
                    <button class="game-button" onclick="initGame2048()">New Game</button>
                    <div style="margin-top: 20px; font-size: 18px; font-weight: 600;">
                        Score: <span id="game-score">0</span>
                    </div>
                </div>
            </div>
        `;
    }

    getMusicPlayerContent() {
        return `
            <div class="media-player">
                <div class="now-playing">
                    <div class="album-art" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">🎵</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Now Playing</div>
                    <div style="font-size: 14px; color: #666;">Summer Hit 2024</div>
                    <div style="font-size: 12px; color: #999; margin-top: 8px;">Artist Name</div>
                </div>
                <input type="range" min="0" max="100" value="50" style="width: 80%; margin: 20px 0;">
                <div style="font-size: 12px; color: #999; margin-bottom: 16px;">2:35 / 4:20</div>
                <div class="player-controls">
                    <button class="player-btn" title="Previous">⏮</button>
                    <button class="player-btn" title="Play/Pause" onclick="toggleMusicPlay(this)">▶</button>
                    <button class="player-btn" title="Next">⏭</button>
                </div>
                <div style="margin-top: 20px; font-size: 14px; font-weight: 600;">Playlist</div>
                <div style="margin-top: 8px; font-size: 12px; color: #666;">
                    <div>• Summer Hit 2024</div>
                    <div>• Chill Vibes</div>
                    <div>• Night Drive</div>
                </div>
            </div>
        `;
    }

    getCalculatorContent() {
        const buttons = [
            ['7', '8', '9', '÷'],
            ['4', '5', '6', '×'],
            ['1', '2', '3', '−'],
            ['0', '.', '=', '+']
        ];

        let html = `
            <div class="calculator">
                <div class="calc-display" id="calc-display">0</div>
                <div style="margin-bottom: 12px;">
                    <button class="calc-btn clear" onclick="clearCalc()">CLEAR</button>
                </div>
                <div class="calc-grid">
        `;

        for (const row of buttons) {
            for (const btn of row) {
                let classAdd = '';
                if (['+', '−', '×', '÷'].includes(btn)) {
                    classAdd = 'operator';
                } else if (btn === '=') {
                    classAdd = 'equals';
                }
                html += `<button class="calc-btn ${classAdd}" onclick="handleCalcClick('${btn}')">${btn}</button>`;
            }
        }

        html += `
                </div>
            </div>
        `;
        return html;
    }

    getMemoryGameContent() {
        return `
            <div class="game-content">
                <div class="game-title">Memory Game</div>
                <button class="game-button" onclick="initMemoryGame()">New Game</button>
                <div id="memory-board" class="game-grid" style="grid-template-columns: repeat(4, 60px); margin-top: 20px;"></div>
                <div style="margin-top: 20px; font-size: 18px; font-weight: 600;">
                    Matches: <span id="memory-score">0</span> / 8
                </div>
            </div>
        `;
    }

    getDinoGameContent() {
        const highScore = localStorage.getItem('dinoHighScore') || '0';
        return `
            <div class="game-content">
                <div class="game-title">Chrome Dino</div>
                <div style="text-align: center; margin-bottom: 20px; color: #666; font-size: 14px;">
                    Press SPACEBAR or TAP to jump! Avoid the cacti!
                </div>
                <div style="text-align: center; margin-bottom: 15px; font-weight: 600;">
                    High Score: <span id="dino-high-score">${highScore}</span>
                </div>
                <div id="dino-game" class="dino-game">
                    <div id="dino-ground" class="dino-ground"></div>
                    <div id="dino-player" class="dino-player">🦕</div>
                    <div id="dino-score" class="dino-score">Score: 0</div>
                    <div id="dino-game-over" class="dino-game-over hidden">
                        <div class="game-over-text">GAME OVER</div>
                        <div id="dino-final-score" style="font-size: 18px; margin-bottom: 15px;"></div>
                        <button class="game-button" onclick="restartDinoGame()">Restart</button>
                    </div>
                </div>
            </div>
        `;
    }

    getBooksContent() {
        return `
            <div class="books-content">
                <div class="books-header">
                    <h2>📚 Books Library</h2>
                    <p style="font-size: 12px; color: #666; margin-top: 5px;">Popular books for 10 year olds</p>
                </div>
                <div class="books-list">
                    <div class="book-item" onclick="openBook(0)">
                        <div class="book-cover">📖</div>
                        <div class="book-title">The Hobbit</div>
                        <div class="book-author">by J.R.R. Tolkien</div>
                    </div>
                    <div class="book-item" onclick="openBook(1)">
                        <div class="book-cover">⚡</div>
                        <div class="book-title">Percy Jackson</div>
                        <div class="book-author">by Rick Riordan</div>
                    </div>
                    <div class="book-item" onclick="openBook(2)">
                        <div class="book-cover">🧙</div>
                        <div class="book-title">Harry Potter</div>
                        <div class="book-author">by J.K. Rowling</div>
                    </div>
                    <div class="book-item" onclick="openBook(3)">
                        <div class="book-cover">🦁</div>
                        <div class="book-title">The Lion The Witch & Wardrobe</div>
                        <div class="book-author">by C.S. Lewis</div>
                    </div>
                    <div class="book-item" onclick="openBook(4)">
                        <div class="book-cover">🏝️</div>
                        <div class="book-title">Treasure Island</div>
                        <div class="book-author">by Robert Stevenson</div>
                    </div>
                    <div class="book-item" onclick="openBook(5)">
                        <div class="book-cover">🌳</div>
                        <div class="book-title">Where The Wild Things Are</div>
                        <div class="book-author">by Maurice Sendak</div>
                    </div>
                </div>
                <div id="book-reader" class="book-reader hidden">
                    <button onclick="closeBook()" style="margin-bottom: 15px;">← Back to Library</button>
                    <div id="book-content" style="background: white; padding: 15px; border-radius: 8px; line-height: 1.6; max-height: 300px; overflow-y: auto;"></div>
                </div>
            </div>
        `;
    }

    shadeColor(color, amount) {
        let usePound = false;
        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }
        let num = parseInt(color, 16);
        let r = Math.max(0, Math.min(255, (num >> 16) + amount));
        let g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
        let b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return (usePound ? "#" : "") + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    initializeAppLogic(appId, contentEl) {
        switch(appId) {
            case 'notes':
                initNotesApp(contentEl);
                break;
            case 'game2048':
                initGame2048();
                break;
            case 'calculator':
                initCalculator();
                break;
            case 'memory':
                initMemoryGame();
                break;
            case 'dino':
                initDinoGame();
                break;
            case 'books':
                initBooksApp(contentEl);
                break;
        }
    }
}

// Global window manager
const windowManager = new WindowManager();

// Start menu toggle
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('hidden');
    if (!menu.classList.contains('hidden')) {
        populateAllAppsList();
    }
}

function populateAllAppsList() {
    const listContainer = document.getElementById('all-apps-list');
    listContainer.innerHTML = '';

    for (const [appId, app] of Object.entries(APPS)) {
        const tile = document.createElement('div');
        tile.className = 'app-tile';
        tile.onclick = () => {
            openApp(appId);
            toggleStartMenu();
        };

        tile.innerHTML = `
            <div class="app-tile-icon" style="background: ${app.color};">${app.icon}</div>
            <div class="app-tile-name">${app.name}</div>
        `;

        listContainer.appendChild(tile);
    }
}

// App launching
function openApp(appId) {
    const existingWindow = Array.from(windowManager.windows).find(w => w.dataset.appId === appId);
    if (existingWindow) {
        windowManager.focusWindow(existingWindow);
        return;
    }
    windowManager.createWindow(appId);
}

function installOrOpenApp(appId) {
    if (!installedApps.has(appId)) {
        installedApps.add(appId);
        const playStoreWindow = windowManager.windows.find(w => w.dataset.appId === 'playstore');
        if (playStoreWindow) {
            playStoreWindow.querySelector('.window-content').innerHTML = windowManager.getPlayStoreContent();
        }
    } else {
        openApp(appId);
        // Close play store window
        let playStoreWin = windowManager.windows.find(w => w.dataset.appId === 'playstore');
        if (playStoreWin) {
            windowManager.focusWindow(playStoreWin);
        }
    }
}

// Desktop context menu
document.getElementById('desktop').addEventListener('contextmenu', (e) => {
    if (e.target.closest('.window') || e.target.closest('.desktop-icon') || e.target.closest('.taskbar')) {
        return;
    }
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.classList.remove('hidden');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu')) {
        document.getElementById('context-menu').classList.add('hidden');
    }
});

// Desktop icon click and keyboard support
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const appId = icon.dataset.app;
        openApp(appId);
    });

    // Keyboard support
    icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const appId = icon.dataset.app;
            openApp(appId);
        }
    });
});

// Start button
document.getElementById('start-btn').addEventListener('click', toggleStartMenu);

// Clock update
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
}

setInterval(updateClock, 1000);
updateClock();

// ===== NOTES APP =====
function initNotesApp(contentEl) {
    const notesList = contentEl.querySelector('#notes-list');
    const noteText = contentEl.querySelector('#note-text');
    let currentNote = null;
    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    function displayNotes() {
        notesList.innerHTML = '';
        if (notes.length === 0) {
            notesList.innerHTML = '<div class="note-item" onclick="selectNote(this)">Click to add note</div>';
            return;
        }
        notes.forEach((note, idx) => {
            const item = document.createElement('div');
            item.className = 'note-item';
            item.textContent = note.title || 'Untitled';
            item.onclick = () => {
                selectNoteItem(item, idx);
            };
            notesList.appendChild(item);
        });
    }

    window.selectNoteItem = (el, idx) => {
        document.querySelectorAll('.note-item').forEach(n => n.classList.remove('selected'));
        el.classList.add('selected');
        currentNote = idx;
        noteText.value = notes[idx].content || '';
    };

    window.addNewNote = () => {
        notes.push({ title: 'New Note', content: '' });
        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
        currentNote = notes.length - 1;
        if (notes.length > 0) {
            const items = document.querySelectorAll('.note-item');
            items[items.length - 1].click();
        }
    };

    window.selectNote = function(el) {
        if (el.textContent === 'Click to add note') {
            window.addNewNote();
        }
    };

    noteText.addEventListener('change', () => {
        if (currentNote !== null) {
            notes[currentNote].content = noteText.value;
            localStorage.setItem('notes', JSON.stringify(notes));
        }
    });

    displayNotes();
}

// ===== 2048 GAME =====
function initGame2048() {
    const board = document.getElementById('game-board');
    if (!board) return;
    
    board.innerHTML = '';
    const gameState = {
        tiles: Array(16).fill(0),
        score: 0
    };

    function spawnTile() {
        const empty = gameState.tiles.map((t, i) => t === 0 ? i : null).filter(i => i !== null);
        if (empty.length > 0) {
            gameState.tiles[empty[Math.floor(Math.random() * empty.length)]] = Math.random() > 0.9 ? 4 : 2;
        }
    }

    function render() {
        board.innerHTML = '';
        gameState.tiles.forEach(tile => {
            const el = document.createElement('div');
            el.className = 'game-tile';
            el.textContent = tile === 0 ? '' : tile;
            el.style.background = tile ? `hsl(${Math.log2(tile) * 30}, 70%, 60%)` : '#ddd';
            el.style.color = tile > 4 ? 'white' : '#333';
            board.appendChild(el);
        });
        document.getElementById('game-score').textContent = gameState.score;
    }

    spawnTile();
    spawnTile();
    render();

    window.addEventListener('keydown', (e) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        e.preventDefault();

        const move = (tiles, left) => {
            const process = (row) => {
                row = row.filter(v => v);
                for (let i = 0; i < row.length - 1; i++) {
                    if (row[i] === row[i + 1]) {
                        row[i] *= 2;
                        gameState.score += row[i];
                        row.splice(i + 1, 1);
                    }
                }
                return row.concat(Array(4 - row.length).fill(0));
            };

            let changed = false;
            if (left) {
                for (let i = 0; i < 4; i++) {
                    const newRow = process(tiles.slice(i * 4, i * 4 + 4));
                    if (JSON.stringify(newRow) !== JSON.stringify(tiles.slice(i * 4, i * 4 + 4))) changed = true;
                    tiles.splice(i * 4, 4, ...newRow);
                }
            }
            return changed;
        };

        const oldState = JSON.stringify(gameState.tiles);
        if (e.key === 'ArrowLeft') move(gameState.tiles, true);
        else if (e.key === 'ArrowRight') {
            gameState.tiles.reverse();
            move(gameState.tiles, true);
            gameState.tiles.reverse();
        } else if (e.key === 'ArrowUp') {
            const transposed = [];
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    transposed.push(gameState.tiles[j * 4 + i]);
                }
            }
            move(transposed, true);
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    gameState.tiles[j * 4 + i] = transposed[i * 4 + j];
                }
            }
        } else if (e.key === 'ArrowDown') {
            const transposed = [];
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    transposed.push(gameState.tiles[j * 4 + i]);
                }
            }
            transposed.reverse();
            move(transposed, true);
            transposed.reverse();
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    gameState.tiles[j * 4 + i] = transposed[i * 4 + j];
                }
            }
        }

        if (JSON.stringify(gameState.tiles) !== oldState) {
            spawnTile();
        }
        render();
    });
}

// ===== CALCULATOR =====
function initCalculator() {
    window.calcState = {
        display: '0',
        current: '',
        operator: null,
        previous: ''
    };
}

window.handleCalcClick = function(btn) {
    const display = document.getElementById('calc-display');
    if (!display) return;

    if (['+', '−', '×', '÷'].includes(btn)) {
        if (window.calcState.current) {
            window.calcState.previous = window.calcState.current;
            window.calcState.operator = btn;
            window.calcState.current = '';
        }
    } else if (btn === '=') {
        if (window.calcState.operator && window.calcState.previous && window.calcState.current) {
            let result;
            const prev = parseFloat(window.calcState.previous);
            const curr = parseFloat(window.calcState.current);
            switch(window.calcState.operator) {
                case '+': result = prev + curr; break;
                case '−': result = prev - curr; break;
                case '×': result = prev * curr; break;
                case '÷': result = prev / curr; break;
            }
            window.calcState.current = result.toString();
            window.calcState.operator = null;
            window.calcState.previous = '';
        }
    } else if (btn === '.') {
        if (!window.calcState.current.includes('.')) {
            window.calcState.current += btn;
        }
    } else {
        window.calcState.current += btn;
    }

    display.textContent = window.calcState.current || window.calcState.display;
};

window.clearCalc = function() {
    window.calcState = { display: '0', current: '', operator: null, previous: '' };
    const display = document.getElementById('calc-display');
    if (display) display.textContent = '0';
};

// ===== MEMORY GAME =====
function initMemoryGame() {
    const board = document.getElementById('memory-board');
    if (!board) return;

    board.innerHTML = '';
    const cards = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤'].flatMap(emoji => [emoji, emoji]);
    const shuffled = cards.sort(() => Math.random() - 0.5);
    
    let revealed = [];
    let matched = 0;

    shuffled.forEach((card, idx) => {
        const tile = document.createElement('div');
        tile.className = 'game-tile';
        tile.dataset.value = card;
        tile.dataset.index = idx;
        tile.textContent = '?';
        tile.onclick = () => revealCard(tile);
        board.appendChild(tile);
    });

    window.revealCard = function(tile) {
        if (tile.classList.contains('matched') || revealed.includes(tile)) return;
        
        tile.textContent = tile.dataset.value;
        revealed.push(tile);

        if (revealed.length === 2) {
            if (revealed[0].dataset.value === revealed[1].dataset.value) {
                revealed.forEach(t => t.classList.add('matched'));
                matched++;
                document.getElementById('memory-score').textContent = matched;
            } else {
                setTimeout(() => {
                    revealed.forEach(t => t.textContent = '?');
                    revealed = [];
                }, 600);
            }
        }
    };
}

// Music player toggle
window.toggleMusicPlay = function(btn) {
    btn.textContent = btn.textContent === '▶' ? '⏸' : '▶';
};

window.createNewWindow = function(appId) {
    toggleStartMenu();
    openApp(appId);
};

window.refreshDesktop = function() {
    location.reload();
};

// ===== DINO GAME =====
let dinoGameState = {
    interval: null,
    spawnTimeout: null,
    score: 0,
    jumping: false,
    gameOver: false
};

function initDinoGame() {
    const gameContainer = document.getElementById('dino-game');
    if (!gameContainer) return;

    // Reset game state
    dinoGameState.score = 0;
    dinoGameState.jumping = false;
    dinoGameState.gameOver = false;

    // Clear any existing cacti
    const existingCacti = gameContainer.querySelectorAll('.dino-cactus');
    existingCacti.forEach(cactus => cactus.remove());
    
    clearInterval(dinoGameState.interval);
    if (dinoGameState.spawnTimeout) clearTimeout(dinoGameState.spawnTimeout);

    // Update score display
    const scoreEl = document.getElementById('dino-score');
    if (scoreEl) scoreEl.textContent = 'Score: 0';

    // Hide game over screen
    const gameOverEl = document.getElementById('dino-game-over');
    if (gameOverEl) gameOverEl.classList.add('hidden');

    // Reset dino position
    const dinoEl = document.getElementById('dino-player');
    if (dinoEl) {
        dinoEl.classList.remove('jumping');
        dinoEl.style.bottom = '20px';
    }

    // Add event listeners
    gameContainer.addEventListener('click', () => dinoJump());
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            dinoJump();
        }
    });

    // Start game loop
    dinoGameState.interval = setInterval(dinoGameLoop, 30);

    // Spawn first cactus after a delay
    dinoGameState.spawnTimeout = setTimeout(spawnCactus, 2000);
}

function dinoJump() {
    if (dinoGameState.gameOver || dinoGameState.jumping) return;

    const dinoEl = document.getElementById('dino-player');
    if (!dinoEl) return;

    dinoGameState.jumping = true;
    dinoEl.classList.add('jumping');

    setTimeout(() => {
        dinoEl.classList.remove('jumping');
        dinoGameState.jumping = false;
    }, 500);
}

function spawnCactus() {
    if (dinoGameState.gameOver) return;

    const gameContainer = document.getElementById('dino-game');
    if (!gameContainer) return;

    const cactus = document.createElement('div');
    cactus.className = 'dino-cactus';
    cactus.textContent = '🌵';
    cactus.style.right = '-10%';

    gameContainer.appendChild(cactus);

    // Animate cactus
    let position = -10;
    const moveInterval = setInterval(() => {
        if (!gameContainer.contains(cactus)) {
            clearInterval(moveInterval);
            return;
        }

        position += 1.5;
        cactus.style.right = position + '%';

        if (position > 110) {
            clearInterval(moveInterval);
            if (cactus.parentNode) cactus.parentNode.removeChild(cactus);
        }
    }, 20);

    // Spawn next cactus
    const nextSpawnTime = Math.random() * 1500 + 1000;
    dinoGameState.spawnTimeout = setTimeout(spawnCactus, nextSpawnTime);
}

function dinoGameLoop() {
    if (dinoGameState.gameOver) return;

    dinoGameState.score++;
    const scoreEl = document.getElementById('dino-score');
    if (scoreEl) scoreEl.textContent = `Score: ${Math.floor(dinoGameState.score / 10)}`;

    checkCollisions();
}

function checkCollisions() {
    const dinoEl = document.getElementById('dino-player');
    const cacti = document.querySelectorAll('.dino-cactus');

    if (!dinoEl || dinoGameState.jumping) return;

    const dinoRect = dinoEl.getBoundingClientRect();

    cacti.forEach(cactus => {
        const cactusRect = cactus.getBoundingClientRect();

        if (dinoRect.right > cactusRect.left + 5 &&
            dinoRect.left < cactusRect.right - 5 &&
            dinoRect.bottom > cactusRect.top) {
            endDinoGame();
        }
    });
}

function endDinoGame() {
    dinoGameState.gameOver = true;
    clearInterval(dinoGameState.interval);
    if (dinoGameState.spawnTimeout) clearTimeout(dinoGameState.spawnTimeout);

    // Calculate final score
    const finalScore = Math.floor(dinoGameState.score / 10);
    const currentHighScore = parseInt(localStorage.getItem('dinoHighScore') || '0');
    
    // Update high score if needed
    let scoreMessage = `Final Score: ${finalScore}`;
    if (finalScore > currentHighScore) {
        localStorage.setItem('dinoHighScore', finalScore);
        scoreMessage += ' 🎉 NEW HIGH SCORE!';
        const highScoreEl = document.getElementById('dino-high-score');
        if (highScoreEl) highScoreEl.textContent = finalScore;
    }

    const gameOverEl = document.getElementById('dino-game-over');
    if (gameOverEl) {
        gameOverEl.classList.remove('hidden');
        const finalScoreEl = document.getElementById('dino-final-score');
        if (finalScoreEl) finalScoreEl.textContent = scoreMessage;
    }
}

function restartDinoGame() {
    // Clean up
    clearInterval(dinoGameInterval);
    const gameContainer = document.getElementById('dino-game');
    if (gameContainer) {
        const existingCacti = gameContainer.querySelectorAll('.dino-cactus');
        existingCacti.forEach(cactus => cactus.remove());
    }

    // Restart
    initDinoGame();
}

// ===== BOOKS APP =====
const BOOKS = [
    {
        id: 0,
        title: 'The Crystal Kingdom',
        author: 'Emma Sterling',
        emoji: '💎',
        content: 'Maya discovers an ancient portal hidden in her grandmother\'s attic that leads to the Crystal Kingdom, a magical realm where gems have special powers. With her newfound friends Kai and Luna, she must protect the kingdom from dark forces trying to steal its crystals. Together they learn that true strength comes from friendship and believing in themselves.'
    },
    {
        id: 1,
        title: 'Space Explorer\'s Quest',
        author: 'Alex Rivera',
        emoji: '🚀',
        content: 'Zephyr joins an intergalactic exploration team and travels to distant planets searching for the legendary Nebula Stone. Along the way, Zephyr makes friends with aliens from different species and discovers that cooperation and kindness are more valuable than any treasure. The adventure teaches lessons about bravery, responsibility, and protecting the environment.'
    },
    {
        id: 2,
        title: 'Mystery of Whispering Woods',
        author: 'Jordan Blake',
        emoji: '🔍',
        content: 'Three friends stumble upon a hidden village in the ancient Whispering Woods where animals can talk and magic is real. They must solve the mystery of why the village is disappearing and help the forest creatures break a forgotten spell. A thrilling adventure that combines mystery, magic, and the importance of environmental conservation.'
    },
    {
        id: 3,
        title: 'The Rainbow Dragon\'s Secret',
        author: 'Sofia Chen',
        emoji: '🐉',
        content: 'When a mysterious rainbow dragon crash-lands in the village, young Olive becomes its guardian and caretaker. Together they discover the dragon has lost its colors and magical abilities. Olive embarks on a journey to find the five Sacred Gems scattered across fantastical lands, learning about courage and compassion along the way.'
    },
    {
        id: 4,
        title: 'Code Breaker Academy',
        author: 'Marcus Webb',
        emoji: '🔐',
        content: 'Jasmine discovers she has a special talent for solving codes and puzzles, and is invited to attend the prestigious Code Breaker Academy. Here she trains with other talented kids to solve ancient mysteries and help recover lost treasures. The story shows how teamwork, persistence, and clever thinking can overcome any challenge.'
    },
    {
        id: 5,
        title: 'Underwater Secrets',
        author: 'Riley Jensen',
        emoji: '🌊',
        content: 'Finn inherits a magical amulet that allows him to breathe underwater and communicate with sea creatures. He discovers an underwater civilization facing extinction and must work with his new aquatic friends to save their home. An ocean adventure teaching about environmental awareness and the beauty of marine life.'
    }
];

function initBooksApp(contentEl) {
    const bookList = contentEl.querySelector('.books-list');
    const bookReader = contentEl.querySelector('#book-reader');
    
    window.openBook = (bookId) => {
        bookList.style.display = 'none';
        bookReader.classList.remove('hidden');
        
        const book = BOOKS[bookId];
        const bookContentEl = contentEl.querySelector('#book-content');
        
        if (bookContentEl) {
            bookContentEl.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">${book.emoji}</div>
                    <h3 style="margin: 0; color: #333;">${book.title}</h3>
                    <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">by ${book.author}</p>
                </div>
                <p>${book.content}</p>
            `;
        }
    };
    
    window.closeBook = () => {
        bookList.style.display = 'grid';
        bookReader.classList.add('hidden');
    };
}

// Initialize
console.log('Windows 11 Game loaded successfully!');
