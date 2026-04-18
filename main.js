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
    },
    football: {
        name: 'PlayBall',
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
    }
};

// Store app installation state
const installedApps = new Set(['playstore', 'notes', 'game2048', 'musicplayer', 'calculator', 'memory', 'dino', 'books', 'football', 'calendar', 'net2']);

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
                <div class="game-title">PlayBall</div>
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
                        <button class="net2-nav-btn active" onclick="showNet2Category('home')">Home</button>
                        <button class="net2-nav-btn" onclick="showNet2Category('movies')">Movies</button>
                        <button class="net2-nav-btn" onclick="showNet2Category('tv')">TV Shows</button>
                        <button class="net2-nav-btn" onclick="showNet2Category('my-list')">My List</button>
                    </div>
                    <div class="net2-search">
                        <input type="text" placeholder="Search movies, TV shows..." id="net2-search">
                    </div>
                </div>

                <div class="net2-main" id="net2-main">
                    <div class="net2-hero">
                        <div class="hero-content">
                            <h1>Stranger Things</h1>
                            <p>When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.</p>
                            <div class="hero-buttons">
                                <button class="net2-play-btn">▶ Play</button>
                                <button class="net2-info-btn">ℹ More Info</button>
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

function showNet2Category(category) {
    // Update navigation buttons
    document.querySelectorAll('.net2-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Could implement category switching here
    console.log(`Showing category: ${category}`);
}

function playNet2Content(title) {
    alert(`🎬 Now playing: ${title}\n\nEnjoy your movie! 🍿`);
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
