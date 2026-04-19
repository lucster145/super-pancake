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
        name: 'Jumper Game',
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
    },
    football: {
        name: 'Throaball',
        icon: '⚽',
        color: '#228B22',
        minWidth: 600,
        minHeight: 400
    },
    calendar: {
        name: 'Calendar',
        icon: '📅',
        color: '#2196F3',
        minWidth: 500,
        minHeight: 400
    },
    net2: {
        name: 'Net2',
        icon: '🎬',
        color: '#E50914',
        minWidth: 800,
        minHeight: 600
    },
    browser: {
        name: 'Web Browser',
        icon: '🌐',
        color: '#4285F4',
        minWidth: 700,
        minHeight: 500
    }
};

// Store app installation state
const installedApps = new Set(['playstore', 'notes', 'game2048', 'musicplayer', 'calculator', 'memory', 'dino', 'books', 'football', 'calendar', 'net2', 'browser']);

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
        
        // Clean up app-specific resources
        this.cleanupApp(appId);
        
        windowEl.remove();
        this.windows = this.windows.filter(w => w !== windowEl);
        
        const taskbarIcon = document.querySelector(`[data-app-id="${appId}"]`);
        if (taskbarIcon) {
            taskbarIcon.remove();
        }
    }

    cleanupApp(appId) {
        switch(appId) {
            case 'dino':
                // Clean up dino game
                cancelAnimationFrame(dinoGameState.interval);
                if (dinoGameState.spawnTimeout) clearTimeout(dinoGameState.spawnTimeout);
                // Remove event listeners
                const gameContainer = document.getElementById('dino-game');
                if (gameContainer) {
                    gameContainer.removeEventListener('click', dinoJumpHandler);
                }
                document.removeEventListener('keydown', dinoKeyHandler);
                break;
            case 'football':
                // Clean up football game
                clearInterval(footballGameState.interval);
                document.removeEventListener('keydown', footballKeyHandler);
                break;
            // Add cleanup for other apps if needed
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
            case 'football':
                return this.getFootballGameContent();
            case 'calendar':
                return this.getCalendarContent();
            case 'net2':
                return this.getNet2Content();
            case 'browser':
                return this.getBrowserContent();
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
                <div class="game-title">Jumper Game</div>
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
                        <div style="font-size: 14px; margin-bottom: 15px; color: #ccc;">
                            Press R or click Restart to play again
                        </div>
                        <button class="game-button" onclick="restartDinoGame()">Restart</button>
                    </div>
                </div>
            </div>
        `;
    }

    getFootballGameContent() {
        const highScore = localStorage.getItem('footballHighScore') || '0';
        return `
            <div class="game-content">
                <div class="game-title">Throaball</div>
                <div style="text-align: center; margin-bottom: 20px; color: #666; font-size: 14px;">
                    Press SPACEBAR to charge and throw the ball! Hit the targets for points!
                </div>
                <div style="text-align: center; margin-bottom: 15px; font-weight: 600;">
                    High Score: <span id="football-high-score">${highScore}</span>
                </div>
                <div id="football-game" class="football-game">
                    <div class="football-field">
                        <div id="football-player" class="football-player">🏃‍♂️</div>
                        <div id="football-ball" class="football-ball">⚽</div>
                        <div id="football-target-1" class="football-target" style="left: 200px;">🎯</div>
                        <div id="football-target-2" class="football-target" style="left: 350px;">🎯</div>
                        <div id="football-target-3" class="football-target" style="left: 500px;">🎯</div>
                    </div>
                    <div id="football-score" class="football-score">Score: 0</div>
                    <div id="football-power" class="football-power">Power: 0%</div>
                    <div id="football-game-over" class="football-game-over hidden">
                        <div class="game-over-text">ROUND COMPLETE</div>
                        <div id="football-final-score" style="font-size: 18px; margin-bottom: 15px;"></div>
                        <button class="game-button" onclick="restartFootballGame()">Next Round</button>
                    </div>
                </div>
            </div>
        `;
    }

    getCalendarContent() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDate = now.getDate();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

        let calendarHTML = `
            <div class="calendar-content">
                <div class="calendar-header">
                    <button class="calendar-nav" onclick="changeMonth(-1)">◀</button>
                    <h2 id="calendar-title">${monthNames[currentMonth]} ${currentYear}</h2>
                    <button class="calendar-nav" onclick="changeMonth(1)">▶</button>
                </div>
                <div class="calendar-weekdays">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div class="calendar-grid" id="calendar-grid">
        `;

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === currentDate && currentMonth === now.getMonth() && currentYear === now.getFullYear();
            const todayClass = isToday ? ' today' : '';
            calendarHTML += `<div class="calendar-day${todayClass}" onclick="selectDate(${day})">${day}</div>`;
        }

        calendarHTML += `
                </div>
                <div class="calendar-events">
                    <h3>Today's Events</h3>
                    <div id="today-events">
                        <div class="event-item">
                            <div class="event-time">9:00 AM</div>
                            <div class="event-title">Team Meeting</div>
                        </div>
                        <div class="event-item">
                            <div class="event-time">2:00 PM</div>
                            <div class="event-title">Project Review</div>
                        </div>
                        <div class="event-item">
                            <div class="event-time">6:00 PM</div>
                            <div class="event-title">Dinner with Friends</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return calendarHTML;
    }

    getNet2Content() {
        return `
            <div class="net2-content">
                <div class="net2-header">
                    <div class="net2-logo">Net2</div>
                    <div class="net2-nav">
                        <button class="net2-nav-btn active" onclick="showNet2Category('home', event)">Home</button>
                        <button class="net2-nav-btn" onclick="showNet2Category('movies', event)">Movies</button>
                        <button class="net2-nav-btn" onclick="showNet2Category('tv', event)">TV Shows</button>
                        <button class="net2-nav-btn" onclick="showNet2Category('my-list', event)">My List</button>
                    </div>
                    <div class="net2-search">
                        <input type="text" placeholder="Search movies, TV shows..." id="net2-search">
                    </div>
                </div>

                <div class="net2-main" id="net2-main">
                    <div class="net2-hero">
                        <div class="hero-content">
                            <h1 id="net2-hero-title">Stranger Things</h1>
                            <p id="net2-hero-description">When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.</p>
                            <div class="hero-buttons">
                                <button class="net2-play-btn" onclick="playNet2Content('Stranger Things')">▶ Play</button>
                                <button class="net2-info-btn" onclick="playNet2Info('Stranger Things')">ℹ More Info</button>
                            </div>
                        </div>
                    </div>

                    <div class="net2-row">
                        <h2>Trending Now</h2>
                        <div class="net2-row-content">
                            <div class="net2-item" onclick="playNet2Content('The Crown')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E👑%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EThe Crown%3C/text%3E%3C/svg%3E" alt="The Crown">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Breaking Bad')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E🧪%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EBreaking Bad%3C/text%3E%3C/svg%3E" alt="Breaking Bad">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('The Witcher')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E⚔️%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EThe Witcher%3C/text%3E%3C/svg%3E" alt="The Witcher">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Money Heist')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E💰%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EMoney Heist%3C/text%3E%3C/svg%3E" alt="Money Heist">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Dark')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E🌑%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EDark%3C/text%3E%3C/svg%3E" alt="Dark">
                            </div>
                        </div>
                    </div>

                    <div class="net2-row">
                        <h2>Popular on Net2</h2>
                        <div class="net2-row-content">
                            <div class="net2-item" onclick="playNet2Content('Inception')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E🧠%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EInception%3C/text%3E%3C/svg%3E" alt="Inception">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Interstellar')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E🚀%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EInterstellar%3C/text%3E%3C/svg%3E" alt="Interstellar">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('The Matrix')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E💊%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EThe Matrix%3C/text%3E%3C/svg%3E" alt="The Matrix">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Pulp Fiction')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E🔫%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EPulp Fiction%3C/text%3E%3C/svg%3E" alt="Pulp Fiction">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Fight Club')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23333' width='200' height='300'/%3E%3Ctext x='100' y='150' font-size='24' fill='white' text-anchor='middle'%3E👊%3C/text%3E%3Ctext x='100' y='180' font-size='14' fill='white' text-anchor='middle'%3EFight Club%3C/text%3E%3C/svg%3E" alt="Fight Club">
                            </div>
                        </div>
                    </div>
                    <div id="net2-player" class="net2-player hidden">
                        <div class="net2-player-screen">
                            <button class="net2-player-close" onclick="closeNet2Player()">✕</button>
                            <h2 id="net2-player-title">Now Playing</h2>
                            <p id="net2-player-description">Enjoy your show on Net2.</p>
                            <div class="net2-video-window" id="net2-video-window">
                                <div class="net2-video-content">
                                    <div class="net2-video-scene" id="net2-video-scene">
                                        <div class="net2-video-text">Loading...</div>
                                    </div>
                                    <div class="net2-video-overlay">
                                        <div class="net2-progress-bar">
                                            <div class="net2-progress-fill" id="net2-progress-fill"></div>
                                        </div>
                                        <div class="net2-controls">
                                            <button class="net2-control-btn" onclick="net2PlayPause()" id="net2-play-btn">⏸️</button>
                                            <button class="net2-control-btn" onclick="net2Skip(-10)">⏪ 10s</button>
                                            <button class="net2-control-btn" onclick="net2Skip(10)">10s ⏩</button>
                                            <button class="net2-control-btn" onclick="net2Fullscreen()">⛶</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="net2-player-actions">
                                <button onclick="closeNet2Player()">Exit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getBrowserContent() {
        return `
            <div class="browser-content">
                <div class="browser-toolbar">
                    <button class="browser-nav-btn" onclick="browserGoBack()">←</button>
                    <button class="browser-nav-btn" onclick="browserGoForward()">→</button>
                    <button class="browser-nav-btn" onclick="browserRefresh()">🔄</button>
                    <input type="text" class="browser-address" id="browser-address" placeholder="Search or enter address" value="https://www.example.com">
                    <button class="browser-search-btn" onclick="browserSearch()">Search</button>
                </div>
                <div class="browser-results" id="browser-results">
                    <div class="browser-homepage">
                        <h1>Welcome to Web Browser</h1>
                        <p>Search for anything or enter a website address.</p>
                        <div class="browser-shortcuts">
                            <div class="shortcut" onclick="browserNavigate('space')">🚀 Space</div>
                            <div class="shortcut" onclick="browserNavigate('dinosaurs')">🦕 Dinosaurs</div>
                            <div class="shortcut" onclick="browserNavigate('minecraft')">⛏️ Minecraft</div>
                            <div class="shortcut" onclick="browserNavigate('animals')">🐘 Animals</div>
                            <div class="shortcut" onclick="browserNavigate('ocean')">🌊 Ocean</div>
                            <div class="shortcut" onclick="browserNavigate('science')">🔬 Science</div>
                            <div class="shortcut" onclick="browserNavigate('robots')">🤖 Robots</div>
                            <div class="shortcut" onclick="browserNavigate('football')">⚽ Football</div>
                            <div class="shortcut" onclick="browserNavigate('history')">📜 History</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.funfacts.com')">🌟 FunFacts.com</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.simplegames.com')">🎮 SimpleGames.com</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.dailynews.com')">📰 DailyNews.com</div>
                        </div>
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
            case 'football':
                initFootballGame();
                break;
            case 'calendar':
                initCalendar();
                break;
            case 'net2':
                initNet2();
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
    jumpStartTime: 0,
    gameOver: false
};

function dinoJumpHandler() {
    dinoJump();
}

function dinoKeyHandler(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        dinoJump();
    } else if (e.code === 'KeyR' && dinoGameState.gameOver) {
        // Allow restart with R key when game is over
        restartDinoGame();
    }
}

function initDinoGame() {
    const gameContainer = document.getElementById('dino-game');
    if (!gameContainer) return;

    // Reset game state
    dinoGameState.score = 0;
    dinoGameState.jumping = false;
    dinoGameState.jumpStartTime = 0;
    dinoGameState.gameOver = false;

    // Clear any existing cacti
    const existingCacti = gameContainer.querySelectorAll('.dino-cactus');
    existingCacti.forEach(cactus => cactus.remove());

    // Clear any existing timers
    cancelAnimationFrame(dinoGameState.interval);
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
        dinoEl.textContent = '🦕'; // Reset to normal dino
    }

    // Remove existing event listeners to prevent duplicates
    gameContainer.removeEventListener('click', dinoJumpHandler);
    document.removeEventListener('keydown', dinoKeyHandler);

    // Add event listeners
    gameContainer.addEventListener('click', dinoJumpHandler);
    document.addEventListener('keydown', dinoKeyHandler);

    // Start game loop with requestAnimationFrame for smoother performance
    const gameLoop = () => {
        if (!dinoGameState.gameOver) {
            dinoGameLoop();
            dinoGameState.interval = requestAnimationFrame(gameLoop);
        }
    };
    dinoGameState.interval = requestAnimationFrame(gameLoop);

    // Spawn first cactus after a delay
    dinoGameState.spawnTimeout = setTimeout(spawnCactus, 2000);
}

function dinoJump() {
    if (dinoGameState.gameOver || dinoGameState.jumping) return;

    const dinoEl = document.getElementById('dino-player');
    if (!dinoEl) return;

    dinoGameState.jumping = true;
    dinoGameState.jumpStartTime = Date.now();
    dinoEl.classList.add('jumping');
    dinoEl.textContent = '🦕'; // Normal dino

    // Use JavaScript animation for more precise control
    const jumpDuration = 600; // Slightly longer jump
    const jumpHeight = 70; // Jump height in pixels
    const startBottom = 20;
    const endTime = dinoGameState.jumpStartTime + jumpDuration;

    const animateJump = () => {
        const now = Date.now();
        const elapsed = now - dinoGameState.jumpStartTime;
        const progress = Math.min(elapsed / jumpDuration, 1);

        // Parabolic jump curve
        const height = Math.sin(progress * Math.PI) * jumpHeight;
        const currentBottom = startBottom + height;

        dinoEl.style.bottom = currentBottom + 'px';

        // Change dino expression during jump
        if (progress < 0.5) {
            dinoEl.textContent = '🦕'; // Ascending
        } else {
            dinoEl.textContent = '🦖'; // Descending (different dino)
        }

        if (progress < 1) {
            requestAnimationFrame(animateJump);
        } else {
            // Jump finished
            dinoEl.style.bottom = startBottom + 'px';
            dinoEl.classList.remove('jumping');
            dinoEl.textContent = '🦕'; // Back to normal
            dinoGameState.jumping = false;
        }
    };

    requestAnimationFrame(animateJump);
}

function spawnCactus() {
    if (dinoGameState.gameOver) return;

    const gameContainer = document.getElementById('dino-game');
    if (!gameContainer) return;

    const cactus = document.createElement('div');
    cactus.className = 'dino-cactus';
    cactus.textContent = '🌵';
    cactus.style.right = '-60px'; // Start just off-screen
    cactus.style.bottom = '20px';

    gameContainer.appendChild(cactus);

    // Animate cactus using requestAnimationFrame for smoother movement
    let position = -60; // Start position in pixels
    const speed = 3; // Pixels per frame

    const moveCactus = () => {
        if (!gameContainer.contains(cactus) || dinoGameState.gameOver) {
            if (cactus.parentNode) cactus.parentNode.removeChild(cactus);
            return;
        }

        position += speed;
        cactus.style.right = position + 'px';

        // Remove cactus when it goes off-screen
        if (position > gameContainer.offsetWidth + 60) {
            if (cactus.parentNode) cactus.parentNode.removeChild(cactus);
            return;
        }

        requestAnimationFrame(moveCactus);
    };

    requestAnimationFrame(moveCactus);

    // Spawn next cactus with variable timing based on score
    const baseDelay = Math.max(2000 - Math.floor(dinoGameState.score / 50) * 100, 1000);
    const randomDelay = Math.random() * 800;
    const nextSpawnTime = baseDelay + randomDelay;

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

    if (!dinoEl) return;

    const gameContainer = document.getElementById('dino-game');
    if (!gameContainer) return;

    const containerRect = gameContainer.getBoundingClientRect();
    const dinoRect = dinoEl.getBoundingClientRect();

    // Get current dino bottom position (accounting for jumping)
    const dinoBottom = parseFloat(dinoEl.style.bottom) || 20;

    cacti.forEach(cactus => {
        const cactusRect = cactus.getBoundingClientRect();

        // Calculate positions relative to game container
        const dinoLeft = dinoRect.left - containerRect.left;
        const dinoRight = dinoRect.right - containerRect.left;
        const cactusLeft = cactusRect.left - containerRect.left;
        const cactusRight = cactusRect.right - containerRect.left;

        // Check for horizontal overlap
        const horizontalOverlap = dinoRight > cactusLeft && dinoLeft < cactusRight;

        // Check vertical collision - dino must be on the ground (not jumping high enough)
        const dinoHeight = dinoRect.bottom - dinoRect.top;
        const cactusHeight = cactusRect.bottom - cactusRect.top;
        const verticalCollision = dinoBottom <= 25; // Allow small tolerance for ground level

        if (horizontalOverlap && verticalCollision && !dinoGameState.jumping) {
            endDinoGame();
        }
    });
}

function endDinoGame() {
    dinoGameState.gameOver = true;
    cancelAnimationFrame(dinoGameState.interval);
    if (dinoGameState.spawnTimeout) clearTimeout(dinoGameState.spawnTimeout);

    // Change dino to sad expression
    const dinoEl = document.getElementById('dino-player');
    if (dinoEl) {
        dinoEl.textContent = '💀'; // Dead dino
    }

    const finalScore = Math.floor(dinoGameState.score / 10);
    const currentHighScore = parseInt(localStorage.getItem('dinoHighScore') || '0');

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
    cancelAnimationFrame(dinoGameState.interval);
    if (dinoGameState.spawnTimeout) clearTimeout(dinoGameState.spawnTimeout);
    const gameContainer = document.getElementById('dino-game');
    if (gameContainer) {
        const existingCacti = gameContainer.querySelectorAll('.dino-cactus');
        existingCacti.forEach(cactus => cactus.remove());
    }

    // Restart
    initDinoGame();
}

// ===== FOOTBALL GAME =====
let footballGameState = {
    power: 0,
    powerIncreasing: false,
    ballThrown: false,
    ballX: 80,
    ballY: 30,
    targets: [],
    score: 0,
    round: 1,
    interval: null
};

function initFootballGame() {
    const gameContainer = document.getElementById('football-game');
    if (!gameContainer) return;

    // Reset game state
    footballGameState.power = 0;
    footballGameState.powerIncreasing = false;
    footballGameState.ballThrown = false;
    footballGameState.ballX = 80;
    footballGameState.ballY = 30;
    footballGameState.score = 0;
    footballGameState.targets = [200, 350, 500]; // Target positions
    footballGameState.round = 1;

    // Update displays
    updateFootballScore();
    updateFootballPower();

    // Reset ball position
    const ballEl = document.getElementById('football-ball');
    if (ballEl) {
        ballEl.style.left = '80px';
        ballEl.style.bottom = '30px';
    }

    // Reset targets
    resetFootballTargets();

    // Hide game over screen
    const gameOverEl = document.getElementById('football-game-over');
    if (gameOverEl) gameOverEl.classList.add('hidden');

    // Remove existing event listeners
    gameContainer.removeEventListener('keydown', footballKeyHandler);
    document.removeEventListener('keydown', footballKeyHandler);

    // Add event listeners
    document.addEventListener('keydown', footballKeyHandler);

    // Start power meter
    startFootballPowerMeter();
}

function footballKeyHandler(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!footballGameState.ballThrown) {
            if (footballGameState.powerIncreasing) {
                // Release the ball
                throwFootball();
            } else {
                // Start charging power
                footballGameState.powerIncreasing = true;
            }
        }
    }
}

function startFootballPowerMeter() {
    footballGameState.interval = setInterval(() => {
        if (footballGameState.powerIncreasing && !footballGameState.ballThrown) {
            footballGameState.power = Math.min(footballGameState.power + 2, 100);
            updateFootballPower();
        }
    }, 50);
}

function updateFootballPower() {
    const powerEl = document.getElementById('football-power');
    if (powerEl) {
        powerEl.textContent = `Power: ${footballGameState.power}%`;
    }
}

function updateFootballScore() {
    const scoreEl = document.getElementById('football-score');
    if (scoreEl) {
        scoreEl.textContent = `Score: ${footballGameState.score}`;
    }
}

function throwFootball() {
    footballGameState.ballThrown = true;
    footballGameState.powerIncreasing = false;

    const power = footballGameState.power;
    const ballEl = document.getElementById('football-ball');
    if (!ballEl) return;

    // Calculate trajectory
    const angle = 45; // 45 degree angle
    const velocity = power / 10; // Power affects distance
    const gravity = 0.5;

    let x = 80;
    let y = 30;
    let vx = velocity * Math.cos(angle * Math.PI / 180);
    let vy = velocity * Math.sin(angle * Math.PI / 180);

    const animateBall = () => {
        x += vx;
        y += vy;
        vy -= gravity;

        ballEl.style.left = x + 'px';
        ballEl.style.bottom = y + 'px';

        // Check for target hits
        checkFootballTargets(x, y);

        // Check if ball is out of bounds or hit ground
        if (y <= 20 || x > 600) {
            endFootballRound();
            return;
        }

        requestAnimationFrame(animateBall);
    };

    requestAnimationFrame(animateBall);
}

function checkFootballTargets(ballX, ballY) {
    const targets = document.querySelectorAll('.football-target');
    targets.forEach((target, index) => {
        if (!target.classList.contains('hit')) {
            const targetRect = target.getBoundingClientRect();
            const gameRect = document.getElementById('football-game').getBoundingClientRect();

            const targetX = targetRect.left - gameRect.left;
            const targetY = targetRect.bottom - gameRect.top;

            // Check if ball is near target
            const distance = Math.sqrt(Math.pow(ballX - targetX, 2) + Math.pow(ballY - (250 - targetY), 2));

            if (distance < 30) {
                target.classList.add('hit');
                target.textContent = '💥';
                footballGameState.score += 10;
                updateFootballScore();
            }
        }
    });
}

function resetFootballTargets() {
    const targets = document.querySelectorAll('.football-target');
    targets.forEach(target => {
        target.classList.remove('hit');
        target.textContent = '🎯';
    });
}

function endFootballRound() {
    clearInterval(footballGameState.interval);

    // Calculate round bonus
    const targetsHit = document.querySelectorAll('.football-target.hit').length;
    const roundBonus = targetsHit * 5;
    footballGameState.score += roundBonus;

    // Update high score
    const currentHighScore = parseInt(localStorage.getItem('footballHighScore') || '0');
    if (footballGameState.score > currentHighScore) {
        localStorage.setItem('footballHighScore', footballGameState.score);
        const highScoreEl = document.getElementById('football-high-score');
        if (highScoreEl) highScoreEl.textContent = footballGameState.score;
    }

    // Show round complete screen
    const gameOverEl = document.getElementById('football-game-over');
    if (gameOverEl) {
        gameOverEl.classList.remove('hidden');
        const finalScoreEl = document.getElementById('football-final-score');
        if (finalScoreEl) {
            finalScoreEl.textContent = `Round ${footballGameState.round} Score: ${footballGameState.score} (Targets: ${targetsHit}/3, Bonus: ${roundBonus})`;
        }
    }
}

function restartFootballGame() {
    footballGameState.round++;
    initFootballGame();
}

// ===== CALENDAR APP =====
let currentCalendarDate = new Date();

function initCalendar() {
    // Calendar is mostly static HTML, but we could add dynamic features here
    updateCalendarDisplay();
}

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    updateCalendarDisplay();
}

function selectDate(day) {
    // Could add date selection functionality here
    console.log(`Selected date: ${day}`);
}

function updateCalendarDisplay() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

    const titleEl = document.getElementById('calendar-title');
    if (titleEl) {
        titleEl.textContent = `${monthNames[currentCalendarDate.getMonth()]} ${currentCalendarDate.getFullYear()}`;
    }

    // Update calendar grid
    const gridEl = document.getElementById('calendar-grid');
    if (gridEl) {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const now = new Date();

        let html = '';

        // Empty cells
        for (let i = 0; i < firstDayOfMonth; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            const todayClass = isToday ? ' today' : '';
            html += `<div class="calendar-day${todayClass}" onclick="selectDate(${day})">${day}</div>`;
        }

        gridEl.innerHTML = html;
    }
}

// ===== NET2 APP =====
function initNet2() {
    // Net2 is mostly static HTML with interactive elements
}

function showNet2Category(category, event) {
    // Update navigation buttons
    document.querySelectorAll('.net2-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }

    const heroTitle = document.getElementById('net2-hero-title');
    const heroDesc = document.getElementById('net2-hero-description');
    const categories = {
        home: {
            title: 'Stranger Things',
            desc: 'A small town uncovers a mystery involving experiments, supernatural forces, and a strange little girl.'
        },
        movies: {
            title: 'Movie Night',
            desc: 'Watch the latest thrillers, sci-fi epics, and dramas from the Net2 movie library.'
        },
        tv: {
            title: 'Top TV Shows',
            desc: 'Binge the best TV series and discover new favorites in the TV catalog.'
        },
        'my-list': {
            title: 'My List',
            desc: 'Continue watching your saved shows and movies anytime.'
        }
    };

    if (heroTitle && heroDesc && categories[category]) {
        heroTitle.textContent = categories[category].title;
        heroDesc.textContent = categories[category].desc;
    }
}

function playNet2Content(title) {
    const player = document.getElementById('net2-player');
    const titleEl = document.getElementById('net2-player-title');
    const descEl = document.getElementById('net2-player-description');

    if (player) {
        player.classList.remove('hidden');
    }
    if (titleEl) {
        titleEl.textContent = `Now Playing: ${title}`;
    }
    if (descEl) {
        descEl.textContent = `Enjoy this episode or movie from Net2. Press Exit when you want to stop.`;
    }
    
    // Start video simulation
    startNet2Video();
}

function playNet2Info(title) {
    alert(`ℹ ${title}\n\nThis is a featured Net2 title. Press Play to start watching it.`);
}

function closeNet2Player() {
    const player = document.getElementById('net2-player');
    if (player) {
        player.classList.add('hidden');
    }
    // Stop video simulation
    if (net2VideoInterval) {
        clearInterval(net2VideoInterval);
        net2VideoInterval = null;
    }
    net2IsPlaying = false;
}

// ===== NET2 VIDEO PLAYER =====
let net2VideoInterval = null;
let net2IsPlaying = false;
let net2CurrentTime = 0;
let net2Duration = 120; // 2 minutes for demo

const net2Scenes = [
    { text: "🎬 Opening scene...", duration: 10 },
    { text: "🏃 Action sequence!", duration: 15 },
    { text: "💬 Dialogue moment", duration: 20 },
    { text: "🌟 Dramatic reveal", duration: 25 },
    { text: "🎭 Character development", duration: 30 },
    { text: "🏁 Climax approaching", duration: 20 }
];

function startNet2Video() {
    net2IsPlaying = true;
    net2CurrentTime = 0;
    updateNet2Progress();
    
    let sceneIndex = 0;
    let sceneTime = 0;
    
    net2VideoInterval = setInterval(() => {
        if (!net2IsPlaying) return;
        
        net2CurrentTime++;
        sceneTime++;
        
        // Update progress bar
        updateNet2Progress();
        
        // Change scenes
        if (sceneTime >= net2Scenes[sceneIndex].duration) {
            sceneIndex = (sceneIndex + 1) % net2Scenes.length;
            sceneTime = 0;
            updateNet2Scene(sceneIndex);
        }
        
        // End video
        if (net2CurrentTime >= net2Duration) {
            net2IsPlaying = false;
            clearInterval(net2VideoInterval);
            net2VideoInterval = null;
            updateNet2Scene(-1); // End credits
        }
    }, 1000); // Update every second
}

function updateNet2Scene(index) {
    const sceneEl = document.getElementById('net2-video-scene');
    const textEl = sceneEl.querySelector('.net2-video-text');
    
    if (index === -1) {
        textEl.textContent = "🎉 The End - Thanks for watching!";
        return;
    }
    
    textEl.textContent = net2Scenes[index].text;
}

function updateNet2Progress() {
    const progressFill = document.getElementById('net2-progress-fill');
    const progress = (net2CurrentTime / net2Duration) * 100;
    progressFill.style.width = progress + '%';
}

function net2PlayPause() {
    const btn = document.getElementById('net2-play-btn');
    net2IsPlaying = !net2IsPlaying;
    btn.textContent = net2IsPlaying ? '⏸️' : '▶️';
}

function net2Skip(seconds) {
    net2CurrentTime = Math.max(0, Math.min(net2Duration, net2CurrentTime + seconds));
    updateNet2Progress();
}

function net2Fullscreen() {
    const player = document.getElementById('net2-player');
    if (player.requestFullscreen) {
        player.requestFullscreen();
    }
}

// ===== BROWSER APP =====
function browserSearch() {
    const addressInput = document.getElementById('browser-address');
    const query = addressInput.value.trim();
    if (query) {
        browserNavigate(query);
    }
}

function browserNavigate(query) {
    const resultsDiv = document.getElementById('browser-results');
    const addressInput = document.getElementById('browser-address');
    
    addressInput.value = query;
    
    const results = {
        'space': `<div class="result-item"><h3>🚀 Space & The Universe</h3><p>Space is an almost perfect vacuum containing a thin scattering of particles — mostly hydrogen and helium plasma — and electromagnetic radiation, magnetic fields, neutrinos, dust, and cosmic rays.</p><p><strong>Fun Facts:</strong></p><ul><li>The Sun makes up 99.86% of the mass of our Solar System</li><li>A day on Venus is longer than a year on Venus</li><li>There are more stars in the universe than grains of sand on Earth</li><li>The footprints on the Moon will last 100 million years</li></ul></div>`,
        'dinosaurs': `<div class="result-item"><h3>🦕 Dinosaurs</h3><p>Dinosaurs were a group of reptiles that dominated Earth for over 165 million years. They first appeared during the Triassic period.</p><p><strong>Cool Dinos:</strong></p><ul><li>T-Rex - King of the dinosaurs, 40 feet long</li><li>Triceratops - Had 3 horns and a giant frill</li><li>Velociraptor - Fast and intelligent hunter</li><li>Brachiosaurus - Giraffe-like neck, 85 feet tall</li></ul></div>`,
        'minecraft': `<div class="result-item"><h3>⛏️ Minecraft</h3><p>Minecraft is the best-selling video game of all time with over 238 million copies sold. It was created by Markus "Notch" Persson in 2009.</p><p><strong>Game Modes:</strong></p><ul><li>Survival - Gather resources, fight mobs, survive</li><li>Creative - Unlimited blocks, fly freely, build anything</li><li>Adventure - Play custom maps made by others</li><li>Hardcore - One life only, permadeath mode</li></ul></div>`,
        'animals': `<div class="result-item"><h3>🐘 Amazing Animals</h3><p>Earth is home to over 8.7 million species of animals. From the tiniest insects to the largest whales, the animal kingdom is incredibly diverse.</p><p><strong>Record Holders:</strong></p><ul><li>Cheetah - Fastest land animal at 70 mph</li><li>Blue Whale - Largest animal ever, 100 feet long</li><li>Peregrine Falcon - Fastest bird at 240 mph diving</li><li>Elephant - Largest land animal, incredible memory</li></ul></div>`,
        'ocean': `<div class="result-item"><h3>🌊 The Ocean</h3><p>Oceans cover over 70% of Earth's surface and contain about 97% of all water. The deepest point is the Mariana Trench at nearly 36,000 feet deep.</p><p><strong>Ocean Facts:</strong></p><ul><li>Over 80% of the ocean remains unexplored</li><li>The ocean is home to 94% of all life on Earth</li><li>Coral reefs support 25% of all marine species</li><li>A whale's heartbeat can be heard from 2 miles away</li></ul></div>`,
        'science': `<div class="result-item"><h3>🔬 Science</h3><p>Science is the systematic study of the world around us through observation and experiment. It covers everything from atoms to galaxies.</p><p><strong>Fields of Science:</strong></p><ul><li>Biology - Study of living organisms</li><li>Chemistry - Study of matter and reactions</li><li>Physics - Study of energy and forces</li><li>Astronomy - Study of stars and planets</li></ul></div>`,
        'robots': `<div class="result-item"><h3>🤖 Robots & AI</h3><p>Robots are machines capable of carrying out complex actions automatically. Artificial Intelligence allows computers to learn and make decisions.</p><p><strong>Cool Robot Facts:</strong></p><ul><li>The word "robot" comes from Czech meaning "forced labor"</li><li>There are over 3 million industrial robots in use today</li><li>NASA's Mars rovers are robots exploring another planet</li><li>AI can now beat humans at chess, Go, and video games</li></ul></div>`,
        'football': `<div class="result-item"><h3>⚽ Football</h3><p>Football (soccer) is the most popular sport in the world with over 4 billion fans. It is played in over 200 countries worldwide.</p><p><strong>Key Facts:</strong></p><ul><li>FIFA World Cup is watched by over 3.5 billion people</li><li>The sport dates back over 2,000 years to ancient China</li><li>Lionel Messi and Cristiano Ronaldo are the greatest of all time</li><li>A standard match is 90 minutes with two 45-minute halves</li></ul></div>`,
        'history': `<div class="result-item"><h3>📜 World History</h3><p>Human history spans over 300,000 years. Major civilizations like Egypt, Rome, Greece, and China shaped the modern world we live in today.</p><p><strong>Key Events:</strong></p><ul><li>Ancient Egypt built the pyramids ~2560 BC</li><li>The Roman Empire lasted over 1,000 years</li><li>The Moon landing happened on July 20, 1969</li><li>The Internet was invented in the 1980s</li></ul></div>`,
    };

    const key = Object.keys(results).find(k => query.toLowerCase().includes(k) || k.includes(query.toLowerCase()));

    // Check for website URLs
    const websites = {
        'www.funfacts.com': getFunFactsWebsite,
        'funfacts.com': getFunFactsWebsite,
        'www.simplegames.com': getSimpleGamesWebsite,
        'simplegames.com': getSimpleGamesWebsite,
        'www.dailynews.com': getDailyNewsWebsite,
        'dailynews.com': getDailyNewsWebsite,
    };
    const siteKey = Object.keys(websites).find(k => query.toLowerCase().includes(k));

    let content;
    if (siteKey) {
        content = websites[siteKey]();
    } else if (key) {
        content = results[key];
    } else {
        content = `<div class="result-item"><h3>🔍 No results found for "${query}"</h3><p>Try searching: space, dinosaurs, minecraft, animals, ocean, science, robots, football, or history.</p><p>Or visit a website: <a onclick="browserNavigate('www.funfacts.com')" style="cursor:pointer;color:#4285f4">www.funfacts.com</a> · <a onclick="browserNavigate('www.simplegames.com')" style="cursor:pointer;color:#4285f4">www.simplegames.com</a> · <a onclick="browserNavigate('www.dailynews.com')" style="cursor:pointer;color:#4285f4">www.dailynews.com</a></p></div>`;
    }

    resultsDiv.innerHTML = `
        <div class="search-results">
            <h2>Search Results for "${query}"</h2>
            ${content}
        </div>
    `;
}

function getFunFactsWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#ff6b6b,#feca57);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🌟 FunFacts.com</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Learn something amazing every day!</p>
            </div>
            <div class="fake-site-body" style="background:white;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee;">
                <h2 style="color:#ff6b6b;">Today's Top Facts</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px;">
                    <div style="background:#fff5f5;padding:16px;border-radius:8px;border-left:4px solid #ff6b6b;">
                        <h3>🐙 Octopus Facts</h3>
                        <p>Octopuses have 3 hearts, 9 brains, and blue blood! Each arm has its own mini-brain.</p>
                    </div>
                    <div style="background:#fff9e6;padding:16px;border-radius:8px;border-left:4px solid #feca57;">
                        <h3>🍯 Honey Facts</h3>
                        <p>Honey never expires! Archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible.</p>
                    </div>
                    <div style="background:#e8f8e8;padding:16px;border-radius:8px;border-left:4px solid #55efc4;">
                        <h3>⚡ Lightning Facts</h3>
                        <p>Lightning strikes Earth about 100 times per second — that's 8 million times a day!</p>
                    </div>
                    <div style="background:#e8f0ff;padding:16px;border-radius:8px;border-left:4px solid #74b9ff;">
                        <h3>🧠 Brain Facts</h3>
                        <p>Your brain generates about 23 watts of electricity — enough to power a small light bulb!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getSimpleGamesWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#6c5ce7,#a29bfe);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🎮 SimpleGames.com</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Free fun games for everyone!</p>
            </div>
            <div class="fake-site-body" style="background:white;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee;">
                <h2 style="color:#6c5ce7;">Featured Games</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:12px;">
                    <div style="background:#f8f5ff;padding:16px;border-radius:8px;text-align:center;cursor:pointer;border:2px solid #a29bfe;" onclick="openApp('dino')">
                        <div style="font-size:36px;">🦕</div>
                        <h3 style="margin:8px 0 4px;">Jumper Game</h3>
                        <p style="font-size:12px;color:#888;">Jump over obstacles!</p>
                        <button style="margin-top:8px;background:#6c5ce7;color:white;border:none;padding:6px 16px;border-radius:20px;cursor:pointer;">Play</button>
                    </div>
                    <div style="background:#f8f5ff;padding:16px;border-radius:8px;text-align:center;cursor:pointer;border:2px solid #a29bfe;" onclick="openApp('game2048')">
                        <div style="font-size:36px;">🎯</div>
                        <h3 style="margin:8px 0 4px;">2048</h3>
                        <p style="font-size:12px;color:#888;">Merge the tiles!</p>
                        <button style="margin-top:8px;background:#6c5ce7;color:white;border:none;padding:6px 16px;border-radius:20px;cursor:pointer;">Play</button>
                    </div>
                    <div style="background:#f8f5ff;padding:16px;border-radius:8px;text-align:center;cursor:pointer;border:2px solid #a29bfe;" onclick="openApp('memory')">
                        <div style="font-size:36px;">🧠</div>
                        <h3 style="margin:8px 0 4px;">Memory</h3>
                        <p style="font-size:12px;color:#888;">Match the cards!</p>
                        <button style="margin-top:8px;background:#6c5ce7;color:white;border:none;padding:6px 16px;border-radius:20px;cursor:pointer;">Play</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getDailyNewsWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#2d3436,#636e72);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">📰 DailyNews.com</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Your trusted source for daily news</p>
            </div>
            <div class="fake-site-body" style="background:white;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee;">
                <h2 style="color:#2d3436;">Top Stories</h2>
                <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
                    <div style="padding:16px;border-bottom:1px solid #eee;display:flex;gap:16px;align-items:flex-start;">
                        <span style="font-size:32px;">🚀</span>
                        <div>
                            <h3 style="margin:0 0 6px;">Scientists Discover New Earth-Like Planet</h3>
                            <p style="margin:0;color:#636e72;font-size:14px;">Astronomers at the Space Research Institute have confirmed a new planet in the habitable zone just 40 light years away.</p>
                            <span style="font-size:12px;color:#b2bec3;">2 hours ago · Science</span>
                        </div>
                    </div>
                    <div style="padding:16px;border-bottom:1px solid #eee;display:flex;gap:16px;align-items:flex-start;">
                        <span style="font-size:32px;">⚽</span>
                        <div>
                            <h3 style="margin:0 0 6px;">World Cup Qualifying Begins This Weekend</h3>
                            <p style="margin:0;color:#636e72;font-size:14px;">Over 200 nations kick off their World Cup qualifying campaigns in matches across all continents.</p>
                            <span style="font-size:12px;color:#b2bec3;">4 hours ago · Sports</span>
                        </div>
                    </div>
                    <div style="padding:16px;display:flex;gap:16px;align-items:flex-start;">
                        <span style="font-size:32px;">🤖</span>
                        <div>
                            <h3 style="margin:0 0 6px;">New AI Robot Can Cook Full Meals in Minutes</h3>
                            <p style="margin:0;color:#636e72;font-size:14px;">A new household robot prototype demonstrated the ability to cook a three-course meal entirely on its own using AI vision.</p>
                            <span style="font-size:12px;color:#b2bec3;">6 hours ago · Technology</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

    resultsDiv.innerHTML = `
        <div class="search-results">
            <h2>Search Results for "${query}"</h2>
            ${content}
        </div>
    `;
}

function browserGoBack() {
    // Simple back - just go to homepage
    const resultsDiv = document.getElementById('browser-results');
    const addressInput = document.getElementById('browser-address');
    
    addressInput.value = 'https://www.example.com';
    resultsDiv.innerHTML = `
        <div class="browser-homepage">
            <h1>Welcome to Web Browser</h1>
            <p>Search for anything or enter a website address.</p>
                <div class="browser-shortcuts">
                <div class="shortcut" onclick="browserNavigate('space')">🚀 Space</div>
                <div class="shortcut" onclick="browserNavigate('dinosaurs')">🦕 Dinosaurs</div>
                <div class="shortcut" onclick="browserNavigate('minecraft')">⛏️ Minecraft</div>
                <div class="shortcut" onclick="browserNavigate('animals')">🐘 Animals</div>
                <div class="shortcut" onclick="browserNavigate('ocean')">🌊 Ocean</div>
                <div class="shortcut" onclick="browserNavigate('science')">🔬 Science</div>
                <div class="shortcut" onclick="browserNavigate('robots')">🤖 Robots</div>
                <div class="shortcut" onclick="browserNavigate('football')">⚽ Football</div>
                <div class="shortcut" onclick="browserNavigate('history')">📜 History</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.funfacts.com')">🌟 FunFacts.com</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.simplegames.com')">🎮 SimpleGames.com</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.dailynews.com')">📜 DailyNews.com</div>
            </div>
        </div>
    `;
}

function browserGoForward() {
    // Not implemented - just refresh
    browserRefresh();
}

function browserRefresh() {
    const addressInput = document.getElementById('browser-address');
    const query = addressInput.value;
    if (query && query !== 'https://www.example.com') {
        browserNavigate(query);
    } else {
        browserGoBack();
    }
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
console.log('Simple PC loaded successfully!');
