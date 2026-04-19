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
const installedApps = new Set(['playstore', 'notes', 'game2048', 'musicplayer', 'calculator', 'memory', 'books', 'football', 'calendar', 'net2', 'browser']);

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
            const isVisible = windowEl.style.display !== 'none';
            const isFocused = windowEl.classList.contains('active');
            if (isVisible && isFocused) {
                // Minimize
                windowEl.style.display = 'none';
                icon.classList.remove('active');
            } else {
                windowEl.style.display = 'flex';
                this.focusWindow(windowEl);
            }
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
                            <h1 id="net2-hero-title">Shadow Protocol</h1>
                            <p id="net2-hero-description">A rogue AI escapes a secret government lab and must decide whether to save humanity or destroy it. A thrilling sci-fi series unlike anything you've seen.</p>
                            <div class="hero-buttons">
                                <button class="net2-play-btn" onclick="playNet2Content('Shadow Protocol')">▶ Play</button>
                                <button class="net2-info-btn" onclick="showNet2Info('Shadow Protocol')">ℹ More Info</button>
                            </div>
                        </div>
                    </div>

                    <div class="net2-row">
                        <h2>Trending Now</h2>
                        <div class="net2-row-content">
                            <div class="net2-item" onclick="playNet2Content('Vortex Rising')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23162447' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🌀%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3EVortex Rising%3C/text%3E%3C/svg%3E" alt="Vortex Rising">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Neon Hollow')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%231b1423' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E💜%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3ENeon Hollow%3C/text%3E%3C/svg%3E" alt="Neon Hollow">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('The Frozen Keep')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%230a3d62' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E❄️%3C/text%3E%3Ctext x='100' y='170' font-size='14' fill='white' text-anchor='middle'%3EThe Frozen Keep%3C/text%3E%3C/svg%3E" alt="The Frozen Keep">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Dust & Thunder')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23522e20' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E⚡%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3EDust & Thunder%3C/text%3E%3C/svg%3E" alt="Dust and Thunder">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Shadow Protocol')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23111' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🤖%3C/text%3E%3Ctext x='100' y='170' font-size='14' fill='white' text-anchor='middle'%3EShadow Protocol%3C/text%3E%3C/svg%3E" alt="Shadow Protocol">
                            </div>
                        </div>
                    </div>

                    <div class="net2-row">
                        <h2>Popular on Net2</h2>
                        <div class="net2-row-content">
                            <div class="net2-item" onclick="playNet2Content('Galactic Drifters')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%231a1a2e' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🚀%3C/text%3E%3Ctext x='100' y='170' font-size='14' fill='white' text-anchor='middle'%3EGalactic Drifters%3C/text%3E%3C/svg%3E" alt="Galactic Drifters">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Crimson Pact')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%234a0000' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🗡️%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3ECrimson Pact%3C/text%3E%3C/svg%3E" alt="Crimson Pact">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Echo Valley')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23134d0f' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🌿%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3EEcho Valley%3C/text%3E%3C/svg%3E" alt="Echo Valley">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Iron Circuit')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23212121' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E⚙️%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3EIron Circuit%3C/text%3E%3C/svg%3E" alt="Iron Circuit">
                            </div>
                            <div class="net2-item" onclick="playNet2Content('Lost Meridian')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23003049' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🧭%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3ELost Meridian%3C/text%3E%3C/svg%3E" alt="Lost Meridian">
                            </div>
                        </div>
                    </div>

                    <div id="net2-info-panel" class="net2-info-panel hidden">
                        <div class="net2-info-content">
                            <button class="net2-player-close" onclick="closeNet2Info()">✕</button>
                            <div class="net2-info-poster" id="net2-info-poster"></div>
                            <div class="net2-info-details">
                                <h2 id="net2-info-title"></h2>
                                <div class="net2-info-meta" id="net2-info-meta"></div>
                                <p id="net2-info-desc"></p>
                                <div class="net2-info-episodes" id="net2-info-episodes"></div>
                                <button class="net2-play-btn" id="net2-info-playbtn" style="margin-top:12px;">▶ Play Now</button>
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
                                    <canvas id="net2-canvas" class="net2-canvas" width="480" height="180"></canvas>
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
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.crazygames.fun')">🎮 CrazyGames.fun</div>
                            <div class="shortcut" onclick="browserNavigate('space')">🚀 Space</div>
                            <div class="shortcut" onclick="browserNavigate('dinosaurs')">🦕 Dinosaurs</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.novaspark.tech')">⚡ NovaSpark.tech</div>
                            <div class="shortcut" onclick="browserNavigate('animals')">🐘 Animals</div>
                            <div class="shortcut" onclick="browserNavigate('ocean')">🌊 Ocean</div>
                            <div class="shortcut" onclick="browserNavigate('science')">🔬 Science</div>
                            <div class="shortcut" onclick="browserNavigate('robots')">🤖 Robots</div>
                            <div class="shortcut" onclick="browserNavigate('football')">⚽ Football</div>
                            <div class="shortcut" onclick="browserNavigate('history')">📜 History</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.zappycook.net')">🍳 ZappyCook.net</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.pixelvault.io')">🖼️ PixelVault.io</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.cosmicblog.org')">🌌 CosmicBlog.org</div>
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

// ===== NET2 SHOW DATA =====
const NET2_SHOWS = {
    'Shadow Protocol': {
        emoji: '🤖', genre: 'Sci-Fi', rating: '16+', year: '2024',
        desc: 'A rogue AI escapes a secret government lab and must decide whether to save humanity or destroy it.',
        episodes: ['S1 E1 - Awakening', 'S1 E2 - First Light', 'S1 E3 - The Choice', 'S1 E4 - Cascade', 'S1 E5 - Reckoning'],
        scenes: ['🤖 The AI awakens in the lab...', '💡 First contact with humans!', '⚡ Systems are overloading!', '🏃 The escape sequence begins!', '🌍 Standing on the rooftop, watching the city...', '🎉 And we call it... complete!'],
        frames: [
            ['   _____    ', '  /     \\   ', ' | () () |  ', '  \\  ^  /   ', '   |||||    ', '  |||||     ', ' BOOTING UP '],
            ['  [SERVER]  ', '  |     |   ', '  | ??? |   ', '  |_____|   ', '  SCANNING  ', ' PERIMETER  ', '  . . . .   '],
            [' +--------+ ', ' |01001001| ', ' |11010110| ', ' |00111001| ', ' +--------+ ', '  DATA LEAK ', '  DETECTED  '],
            [' >>RUNNING  ', ' if alive:  ', '   escape() ', ' else:      ', '   wait()   ', '            ', ' EXECUTING  '],
            ['   /|/|\\    ', '  / | | \\   ', ' /  | |  \\  ', '    |_|     ', '  ROOFTOP   ', '  DECISION  ', '  MOMENT    '],
            ['  ______    ', ' /      \\   ', '| CHOICE |  ', '|  SAVE  |  ', '| HUMANS |  ', ' \\______/   ', '  CHOSEN    '],
        ]
    },
    'Vortex Rising': {
        emoji: '🌀', genre: 'Action', rating: '13+', year: '2025',
        desc: 'A storm chaser discovers portals hidden inside massive tornadoes, leading to another dimension.',
        episodes: ['S1 E1 - Storm Season', 'S1 E2 - Into the Eye', 'S1 E3 - The Other Side', 'S1 E4 - Pulling Back'],
        scenes: ['🌪️ The tornado is 2 miles wide!', '🚗 Racing towards the storm!', '✨ A portal opens inside the vortex!', '🌏 Stepping through to a new world...', '⚡ Everything is different here!', '🎬 End of Episode 1'],
        frames: [
            ['    _____   ', '   / ___ \\  ', '  | /   \\ | ', '  | |   | | ', '  | \\___/ | ', '   \\_____/  ', ' STORM F5   '],
            [' \\\\  //  /  ', '  \\\\/  /    ', '   >\\ /     ', '   / X \\    ', '  / /\\ \\    ', ' / /  \\ \\   ', ' CHASING IT '],
            [' **  **  ** ', '*  \\/ \\/*   ', '  * \\/ *    ', '   *()*     ', '  * /\\ *    ', '   /    \\   ', ' PORTAL!!!  '],
            ['  ~~~~~~~   ', ' ~WORLD TWO~', '  ~~~~~~~   ', '  skyblue   ', '  two suns  ', '  no roads  ', 'OTHERWORLD  '],
            ['  ??? !!!   ', ' different  ', '  physics   ', '  rules     ', '  here      ', '  hold on   ', ' ADAPTING   '],
            ['  FADE OUT  ', '            ', '    THE     ', '    END     ', '     OF     ', '    EP.1    ', '            '],
        ]
    },
    'Neon Hollow': {
        emoji: '💜', genre: 'Mystery', rating: '15+', year: '2025',
        desc: 'In a neon-lit underground city, a detective hunts a thief who can walk through walls.',
        episodes: ['S1 E1 - The First Vanish', 'S1 E2 - Neon Trails', 'S1 E3 - Phase Shift', 'S1 E4 - Hollow Ground', 'S1 E5 - Caught'],
        scenes: ['🌃 The city glows purple at midnight...', '🔦 A break-in at the vault — nothing taken?', '👣 Footprints disappear mid-corridor!', '🕵️ The detective closes in...', '💜 The truth is revealed!', '🎬 To be continued...'],
        frames: [
            [' |  |  |  | ', ' |  |  |  | ', '  NEON CITY ', ' ___________', '/purple haze\\', '\\___________/', ' UNDERGROUND'],
            [' [=VAULT==] ', ' |        | ', ' |  EMPTY  | ', ' |        | ', ' [========] ', ' NO PRINTS  ', ' FOUND HERE '],
            [' . . . . .  ', ' . . . .    ', ' . . .      ', ' . .        ', ' .          ', '            ', ' TRAIL GONE '],
            ['  DETECTIVE ', '   []_[]    ', '   (o.o)    ', '   (| |)    ', '   / | \\    ', '  searching ', ' CLOSING IN '],
            [' PHASE SUIT ', '  _______   ', ' |       |  ', ' | ghost |  ', ' |_______|  ', ' walks thru ', '   WALLS!   '],
            [' CAUGHT!    ', '  _/\\_      ', ' (X . X)    ', '  >| |<     ', '   | |      ', '  / | \\     ', ' GAME OVER  '],
        ]
    },
    'The Frozen Keep': {
        emoji: '❄️', genre: 'Fantasy', rating: '10+', year: '2023',
        desc: 'A young knight must brave an ever-frozen castle to rescue a king trapped inside a blizzard curse.',
        episodes: ['S1 E1 - The Curse Begins', 'S1 E2 - Ice Walls', 'S1 E3 - The Guardian', 'S1 E4 - Thaw'],
        scenes: ['❄️ Snow covers every stone of the castle...', '🛡️ The knight enters the frozen gate!', '🐉 A frost dragon blocks the path!', '⚔️ The battle for the king begins!', '🔥 A single flame melts the curse!', '☀️ Spring returns to the kingdom!'],
        frames: [
            [' *  *  *  * ', '*  CASTLE  *', ' * * * * * ', '/|  FROZEN |\\', '|| []  [] ||', '||  ____  ||', '|/__________\\|'],
            [' >>> ENTER  ', '  [  GATE ] ', '  |      |  ', '  |  ICE  | ', '  | WALLS | ', '  |______|  ', ' STEP IN!   '],
            ['  /\\    /\\  ', ' /  \\  /  \\ ', '/FROST\\DRAG \\ ', '|  ()    () |', '|    /\\    |', ' \\  /  \\  / ', '  GUARDIAN  '],
            ['  *CLANG*   ', '  /|      | ', ' / |  VS  | ', '/  |  DR  | ', '   |  AG  | ', '   |  ON  | ', '  BATTLE!   '],
            ['    ~~~     ', '   ~fire~   ', '  ~~~~~~~   ', '   melting  ', '   cracking ', '   falling  ', ' ICE BREAKS '],
            ['  * * * *   ', ' SPRING SUN ', '   (  )     ', '  ------    ', ' FLOWERS!   ', ' KING SAVED ', ' THE END    '],
        ]
    },
    'Dust & Thunder': {
        emoji: '⚡', genre: 'Western', rating: '12+', year: '2024',
        desc: 'Two rival outlaws must team up to stop a steam-powered war machine rolling through the frontier.',
        episodes: ['S1 E1 - Rival Guns', 'S1 E2 - The Iron Wagon', 'S1 E3 - Desert Alliance', 'S1 E4 - Final Stand'],
        scenes: ['🌵 The desert stretches for miles...', '🤠 Two outlaws draw at the same time!', '🚂 A steam machine crushes the town!', '🤝 Old enemies shake hands!', '💥 The machine explodes in a cloud of dust!', '🎬 Ride off into the sunset...'],
        frames: [
            [' ___________', ' WILD  WEST ', '  |    |    ', '  |  /\\|    ', '  | /  |    ', ' cactus land', ' DUSTY ROAD '],
            [' o_   _o    ', ' )|___|  (  ', '  |   |  o  ', '  |___|  )  ', ' DRAW!!!    ', ' both guns  ', ' at once... '],
            [' [==STEAM==]', ' | ( ) ( )  ', ' |_MACHINE_ ', ' /  /  /  / ', '/ / / / /   ', 'CRUSHING IT ', '   TOWN!    '],
            ['   o  o     ', '   )  (     ', '  /|  |\     ', ' shake shake', '  hands     ', ' TRUCE TIME ', ' TEAM UP!   '],
            ['   K  A  B  ', ' * BOOM!  * ', '  *      *  ', '   *    *   ', '    *  *    ', '     **     ', ' EXPLOSION! '],
            ['  sunset    ', ' ___________', '/           \\', '  ride away ', '  together  ', '  THE END   ', '            '],
        ]
    },
    'Galactic Drifters': {
        emoji: '🚀', genre: 'Sci-Fi', rating: '10+', year: '2025',
        desc: 'A misfit crew of space traders accidentally discovers the coordinates of a legendary lost planet.',
        episodes: ['S1 E1 - Hired Crew', 'S1 E2 - Warp Zone', 'S1 E3 - The Map', 'S1 E4 - Lost Planet', 'S1 E5 - Home'],
        scenes: ['🚀 Launching from Dock 7...', '🌌 Jumping to hyperspace!', '👽 Strange signal detected!', '🪐 A planet that shouldn\'t exist!', '💫 The crew celebrates their discovery!', '🎬 End of season 1'],
        frames: [
            ['   [DOCK 7] ', '      |     ', '     /|\     ', '    / | \\   ', '   /  |  \\  ', ' LIFTOFF!!! ', ' 3.. 2.. 1..'],
            [' * . * . *  ', '.  HYPER  . ', ' * SPACE  * ', '.  **** .. . ', ' .  ** .  . ', '  . * .  .  ', ' WARP!!!!   '],
            [' . . ! . .  ', '. . ??? . . ', ' beep boop  ', ' SIGNAL!!!  ', ' origin:    ', ' UNKNOWN    ', ' TRACK IT!  '],
            ['    ____    ', '   /    \\   ', '  | LOST |  ', '  |WORLD |  ', '   \\____/   ', ' shouldnt   ', ' EXIST HERE '],
            ['   \\o/ \\o/  ', '    |   |   ', '  CELEBRATE ', '   * * * *  ', '  * * * * * ', '  FOUND IT  ', ' LEGENDARY! '],
            ['  SEASON 1  ', '  _________ ', ' |  FINAL  |', ' | EPISODE |', ' |_________|', '  THE END   ', '            '],
        ]
    },
    'Crimson Pact': {
        emoji: '🗡️', genre: 'Fantasy', rating: '15+', year: '2024',
        desc: 'Seven warriors from rival clans forge a blood pact to defeat an ancient shadow lord.',
        episodes: ['S1 E1 - The Seven', 'S1 E2 - Blood Oath', 'S1 E3 - Shadow Falls', 'S1 E4 - The Price'],
        scenes: ['🗡️ Seven blades rise in the moonlight...', '🩸 The pact is sealed!', '💀 The shadow lord awakens!', '⚔️ The battle is fierce and brutal!', '🌅 Dawn breaks over the battlefield!', '🎬 Victory — but at a cost...'],
        frames: [
            [' / | | | \\ ', '   | | |   ', '  7 BLADES  ', '  rise up   ', '  moonlight ', '  gleaming  ', ' CLAN MEET  '],
            ['   ~~~~     ', '  ~ BLOOD ~ ', '   ~ PACT ~ ', '  ~ SEALED~ ', '   ~~~~     ', ' 7 warriors ', ' AS ONE NOW '],
            ['  DARKNESS  ', ' /\\  /\\  /\\ ', '/  \\/  \\/  \\', '  SHADOW    ', '  LORD      ', '  AWAKENS!  ', ' !!!!!!!!!  '],
            [' *clash*    ', ' *BANG*     ', ' *CRUNCH*   ', '  BATTLE    ', '  RAGES ON  ', '  7 vs 1    ', ' FIGHTING!  '],
            ['  .......   ', '   .....    ', '    ...     ', '     .      ', '   DAWN     ', '  BREAKS!   ', ' SURVIVORS? '],
            [' VICTORY!   ', '  but...    ', '  losses    ', '  were      ', '  great     ', '  ...       ', ' THE PRICE  '],
        ]
    },
    'Echo Valley': {
        emoji: '🌿', genre: 'Drama', rating: '10+', year: '2023',
        desc: 'A family moves to an ancient valley and discovers their new home echoes voices from the past.',
        episodes: ['S1 E1 - Moving Day', 'S1 E2 - First Echo', 'S1 E3 - The Voice', 'S1 E4 - Answered'],
        scenes: ['🌿 The moving truck pulls up the winding road...', '🏡 The old house feels alive!', '👂 A voice echoes from the walls!', '📜 Old letters found beneath the floorboards!', '👻 A friendly ghost says goodbye!', '🎬 The family is home at last'],
        frames: [
            [' [  TRUCK ]>', '  /______/ ', ' |  move  | ', ' | day :) | ', '  --------  ', ' VALLEY RD  ', ' WINDING... '],
            ['  ________  ', ' /  HOME  \\ ', '|  ______  |', '| |      | |', '| | door | |', '|_|______|_|', ' OLD HOUSE! '],
            ['   ------   ', '  | ECHO |  ', '   ------   ', '  ------    ', ' | ECHO |   ', '  ------    ', ' ECHO ECHO  '],
            ['  [LETTER]  ', '  ________  ', ' |dear..  | ', ' |friends | ', ' |in 1902 | ', ' |________|  ', ' FROM PAST  '],
            ['   o O O    ', '  FRIENDLY  ', '   GHOST    ', '  (  ^  )   ', '   waves    ', '  goodbye   ', ' FAREWELL!  '],
            ['  HOME! :)  ', '  family    ', '  is safe   ', '  at last   ', '   THE END  ', '            ', '            '],
        ]
    },
    'Iron Circuit': {
        emoji: '⚙️', genre: 'Action', rating: '13+', year: '2025',
        desc: 'Underground robot fighting rings, a mechanic who builds the most advanced bot ever constructed.',
        episodes: ['S1 E1 - Scrap Yard', 'S1 E2 - First Fight', 'S1 E3 - Upgrades', 'S1 E4 - Championship'],
        scenes: ['⚙️ Sparks fly in the workshop...', '🤖 IRONJAW enters the arena!', '💥 Crashing metal echoes everywhere!', '🔧 Emergency repairs at half-time!', '🏆 The crowd goes wild!', '🎬 Champion crowned!'],
        frames: [
            [' * sparks * ', '  ~~fire~~  ', '  WORKSHOP  ', ' [  PARTS ] ', '  building  ', '  BOT #1    ', ' IRONJAW!   '],
            ['  [ARENA]   ', ' /--------\\ ', '|  IRONJAW  |', '|   ___    |', '|  [   ]   |', ' \\--------/ ', ' ENTER BOT! '],
            [' *SMASH!!!* ', ' *CRUNCH!!* ', '  *BANG!! * ', ' metal floor', ' everywhere ', '  half time ', ' REPAIR NOW '],
            [' REPAIR KIT ', '  o--[wrench]', '  FIX IT!   ', '  weld weld ', '  good good ', '  READY!    ', ' BACK IN!   '],
            ['  (CHAMP)   ', '  \\  o  /   ', '  -( | )-   ', '   / | \\    ', '  IRONJAW   ', '  WINS!!!   ', ' CROWD!!!   '],
            ['  [TROPHY]  ', '    /|\\     ', '   / | \\    ', '   |___|    ', ' CHAMPION   ', '  CROWNED   ', ' THE END!   '],
        ]
    },
    'Lost Meridian': {
        emoji: '🧭', genre: 'Adventure', rating: '10+', year: '2024',
        desc: 'An explorer following an ancient compass discovers a sea route that vanishes at midnight.',
        episodes: ['S1 E1 - The Old Compass', 'S1 E2 - Midnight Tide', 'S1 E3 - Under the Map', 'S1 E4 - Found'],
        scenes: ['🧭 The compass spins wildly at midnight...', '⛵ Setting sail into the unknown!', '🌊 A hidden sea route appears!', '🏝️ An uncharted island ahead!', '✨ Ancient treasure discovered!', '🎬 The journey continues...'],
        frames: [
            ['  COMPASS:  ', '     N      ', '  W  +  E   ', '     S      ', '  spinning  ', '  MIDNIGHT  ', ' ??? ??? ???'],
            ['  _/\\/\\_    ', ' /  SAIL \\  ', '|   BOAT   |', ' \\________/ ', '~~~waves~~~~', ' INTO THE   ', ' UNKNOWN!   '],
            ['  ~~SEA~~   ', ' ~ROUTE>>~  ', '  ~~SEA~~   ', '  appears   ', '  at        ', '  midnight  ', ' GO! GO!    '],
            ['  ISLAND!   ', '  /\\        ', ' /  \\  palm ', '/    \\  tree ', ' sand sand  ', ' uncharted  ', ' LAND HO!   '],
            ['  X MARKS   ', '  THE SPOT  ', '  [  $$  ]  ', '  [TREASURE]', '  [  $$  ]  ', ' FOUND IT!  ', ' ANCIENT!   '],
            [' TO BE CONT ', '  .......   ', '   season   ', '     2      ', '  coming    ', '   soon!    ', ' ADVENTURE! '],
        ]
    }
};

function showNet2Info(title) {
    const show = NET2_SHOWS[title];
    if (!show) return;
    const panel = document.getElementById('net2-info-panel');
    document.getElementById('net2-info-poster').innerHTML = `<div style="font-size:80px;text-align:center;padding:20px;background:#111;border-radius:8px;">${show.emoji}</div>`;
    document.getElementById('net2-info-title').textContent = title;
    document.getElementById('net2-info-meta').innerHTML = `<span>${show.year}</span> <span>${show.rating}</span> <span>${show.genre}</span>`;
    document.getElementById('net2-info-desc').textContent = show.desc;
    document.getElementById('net2-info-episodes').innerHTML = '<h3>Episodes</h3>' + show.episodes.map(ep =>
        `<div class="net2-episode-item" onclick="playNet2Content('${title}')">${ep}</div>`
    ).join('');
    document.getElementById('net2-info-playbtn').onclick = () => { closeNet2Info(); playNet2Content(title); };
    panel.classList.remove('hidden');
}

function closeNet2Info() {
    document.getElementById('net2-info-panel').classList.add('hidden');
}

function playNet2Content(title) {
    const show = NET2_SHOWS[title] || { emoji: '🎬', scenes: [], frames: [['🎬','PLAYING','...']], desc: 'Enjoy this Net2 original.' };
    const player = document.getElementById('net2-player');
    const titleEl = document.getElementById('net2-player-title');
    const descEl = document.getElementById('net2-player-description');
    if (player) player.classList.remove('hidden');
    if (titleEl) titleEl.textContent = `▶ Now Playing: ${title}`;
    if (descEl) descEl.textContent = show.desc;
    net2CurrentPalette = SHOW_PALETTE[title] || 'default';
    startNet2Video(show.scenes, show.frames, show.emoji);
}

function playNet2Info(title) {
    alert(`ℹ ${title}\n\nThis is a featured Net2 title. Press Play to start watching it.`);
}

function closeNet2Player() {
    const player = document.getElementById('net2-player');
    if (player) player.classList.add('hidden');
    if (net2Raf) { cancelAnimationFrame(net2Raf); net2Raf = null; }
    if (net2VideoInterval) { clearInterval(net2VideoInterval); net2VideoInterval = null; }
    net2IsPlaying = false;
}

// ===== NET2 VIDEO PLAYER =====
let net2VideoInterval = null;
let net2IsPlaying = false;
let net2CurrentTime = 0;
let net2Duration = 120;
let net2Raf = null;
let net2LastFrameTime = 0;
let net2ArtFrameIndex = 0;
let net2ActiveFrames = [];
let net2ShowEmoji = '🎬';

// 30 frames per minute = 1 new art frame every 2000ms
const NET2_FRAME_INTERVAL = 2000;
// Canvas tick every ~33ms (≈30fps render loop) for smooth progress bar
const NET2_TICK_MS = 33;

function startNet2Video(customScenes, frames, emoji) {
    net2IsPlaying = true;
    net2CurrentTime = 0;
    net2ArtFrameIndex = 0;
    net2LastFrameTime = performance.now();
    net2ActiveFrames = frames && frames.length ? frames : [['🎬','PLAYING','...']];
    net2ShowEmoji = emoji || '🎬';
    updateNet2Progress();

    if (net2VideoInterval) { clearInterval(net2VideoInterval); net2VideoInterval = null; }
    if (net2Raf) { cancelAnimationFrame(net2Raf); net2Raf = null; }

    let lastTick = performance.now();

    function renderFrame(now) {
        if (!net2IsPlaying) return;

        // Advance wall-clock seconds
        const delta = now - lastTick;
        lastTick = now;
        net2CurrentTime += delta / 1000;
        if (net2CurrentTime > net2Duration) net2CurrentTime = net2Duration;
        updateNet2Progress();

        // Advance art frame every 2 seconds (30 frames/min)
        if (now - net2LastFrameTime >= NET2_FRAME_INTERVAL) {
            net2LastFrameTime = now;
            net2ArtFrameIndex = (net2ArtFrameIndex + 1) % net2ActiveFrames.length;
        }

        drawNet2Canvas(net2ActiveFrames[net2ArtFrameIndex], net2CurrentTime, net2Duration);

        if (net2CurrentTime >= net2Duration) {
            net2IsPlaying = false;
            drawNet2CanvasEnd(net2ShowEmoji);
            return;
        }

        net2Raf = requestAnimationFrame(renderFrame);
    }

    drawNet2Canvas(net2ActiveFrames[0], 0, net2Duration);
    net2Raf = requestAnimationFrame(renderFrame);
}

// Colour palette per show genre (keyed by emoji for simplicity)
const NET2_PALETTES = {
    default:  { bg: '#0a0a1a', line: '#00ff88', dim: '#005533', title: '#ffffff', border: '#00ff8855' },
    orange:   { bg: '#1a0a00', line: '#ff8800', dim: '#552200', title: '#ffffff', border: '#ff880055' },
    purple:   { bg: '#0d0014', line: '#cc88ff', dim: '#440066', title: '#ffffff', border: '#cc88ff55' },
    blue:     { bg: '#000d1a', line: '#44aaff', dim: '#003366', title: '#ffffff', border: '#44aaff55' },
    red:      { bg: '#1a0000', line: '#ff4455', dim: '#550011', title: '#ffffff', border: '#ff445555' },
    green:    { bg: '#001a00', line: '#55ff77', dim: '#004411', title: '#ffffff', border: '#55ff7755' },
};

const SHOW_PALETTE = {
    'Shadow Protocol': 'default',
    'Vortex Rising':   'orange',
    'Neon Hollow':     'purple',
    'The Frozen Keep': 'blue',
    'Dust & Thunder':  'orange',
    'Galactic Drifters':'default',
    'Crimson Pact':    'red',
    'Echo Valley':     'green',
    'Iron Circuit':    'orange',
    'Lost Meridian':   'blue',
};
let net2CurrentPalette = 'default';

function drawNet2Canvas(lines, currentTime, duration) {
    const canvas = document.getElementById('net2-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pal = NET2_PALETTES[net2CurrentPalette] || NET2_PALETTES.default;

    // Background
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);

    // Scanline effect
    for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, y, W, 2);
    }

    // Border glow
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, W - 8, H - 8);

    // Corner brackets
    const b = 16;
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 2;
    [[4,4],[W-4,4],[4,H-4],[W-4,H-4]].forEach(([cx,cy]) => {
        const sx = cx < W/2 ? 1 : -1, sy = cy < H/2 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(cx, cy + sy*b); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx*b, cy); ctx.stroke();
    });

    // Frame counter badge top-left
    const frameNum = net2ArtFrameIndex + 1;
    ctx.fillStyle = pal.line;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`FR:${String(frameNum).padStart(2,'0')}  30/min`, 20, 22);

    // Time top-right
    const elapsed = Math.floor(currentTime);
    const tot = Math.floor(duration);
    ctx.textAlign = 'right';
    ctx.fillText(`${fmtTime(elapsed)} / ${fmtTime(tot)}`, W - 20, 22);
    ctx.textAlign = 'left';

    // ASCII art lines (centred)
    const lineH = 17;
    const totalH = (lines.length) * lineH;
    const startY = (H - totalH) / 2 + 8;

    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    lines.forEach((line, i) => {
        // Alternate brightness for depth
        const brightness = i % 2 === 0 ? pal.line : pal.dim;
        ctx.fillStyle = i === Math.floor(lines.length / 2) ? '#ffffff' : brightness;
        ctx.fillText(line, W / 2, startY + i * lineH);
    });
    ctx.textAlign = 'left';

    // Blinking cursor bottom
    if (Math.floor(performance.now() / 500) % 2 === 0) {
        ctx.fillStyle = pal.line;
        ctx.fillText('█', W / 2 - 4, startY + lines.length * lineH + 4);
    }
}

function drawNet2CanvasEnd(emoji) {
    const canvas = document.getElementById('net2-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pal = NET2_PALETTES[net2CurrentPalette] || NET2_PALETTES.default;

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = pal.line;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('— THE END —', W/2, H/2 - 18);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Thanks for watching on Net2', W/2, H/2 + 4);
    ctx.font = '28px sans-serif';
    ctx.fillText(emoji, W/2, H/2 + 38);
    ctx.textAlign = 'left';
}

function fmtTime(s) {
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
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
        'www.crazygames.fun': getCrazyGamesWebsite,
        'crazygames.fun': getCrazyGamesWebsite,
        'www.zappycook.net': getZappyCookWebsite,
        'zappycook.net': getZappyCookWebsite,
        'www.pixelvault.io': getPixelVaultWebsite,
        'pixelvault.io': getPixelVaultWebsite,
        'www.cosmicblog.org': getCosmicBlogWebsite,
        'cosmicblog.org': getCosmicBlogWebsite,
        'www.novaspark.tech': getNovaSparkWebsite,
        'novaspark.tech': getNovaSparkWebsite,
    };
    const siteKey = Object.keys(websites).find(k => query.toLowerCase().includes(k));

    let content;
    if (siteKey) {
        content = websites[siteKey]();
    } else if (key) {
        content = results[key];
    } else {
        content = `<div class="result-item"><h3>🔍 No results found for "${query}"</h3><p>Try searching: space, dinosaurs, animals, ocean, science, robots, football, or history.</p><p>Or visit a website: <a onclick="browserNavigate('www.zappycook.net')" style="cursor:pointer;color:#4285f4">www.zappycook.net</a> · <a onclick="browserNavigate('www.pixelvault.io')" style="cursor:pointer;color:#4285f4">www.pixelvault.io</a> · <a onclick="browserNavigate('www.cosmicblog.org')" style="cursor:pointer;color:#4285f4">www.cosmicblog.org</a> · <a onclick="browserNavigate('www.novaspark.tech')" style="cursor:pointer;color:#4285f4">www.novaspark.tech</a></p></div>`;
    }

    resultsDiv.innerHTML = `
        <div class="search-results">
            <h2>Search Results for "${query}"</h2>
            ${content}
        </div>
    `;
}

function getCrazyGamesWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#6c3483,#1a5276);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🎮 CrazyGames.fun</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Free online games — play instantly, no download needed!</p>
            </div>
            <div class="fake-site-body" style="background:#1a1a2e;padding:20px;border-radius:0 0 8px 8px;">
                <h2 style="color:#a29bfe;margin:0 0 14px;">🕹️ Featured Games</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
                    <div onclick="crazyGame('snake')" style="background:#2d2d5e;border-radius:10px;padding:14px;text-align:center;cursor:pointer;border:2px solid transparent;transition:border 0.2s;" onmouseover="this.style.borderColor='#a29bfe'" onmouseout="this.style.borderColor='transparent'">
                        <div style="font-size:40px;">🐍</div>
                        <p style="color:white;margin:8px 0 2px;font-weight:600;">Snake</p>
                        <p style="color:#aaa;font-size:11px;">Eat dots, grow longer!</p>
                        <span style="background:#27ae60;color:white;font-size:10px;padding:2px 8px;border-radius:20px;">PLAY NOW</span>
                    </div>
                    <div onclick="crazyGame('tictactoe')" style="background:#2d2d5e;border-radius:10px;padding:14px;text-align:center;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='#a29bfe'" onmouseout="this.style.borderColor='transparent'">
                        <div style="font-size:40px;">❌⭕</div>
                        <p style="color:white;margin:8px 0 2px;font-weight:600;">Tic Tac Toe</p>
                        <p style="color:#aaa;font-size:11px;">Play vs the computer!</p>
                        <span style="background:#27ae60;color:white;font-size:10px;padding:2px 8px;border-radius:20px;">PLAY NOW</span>
                    </div>
                    <div onclick="crazyGame('reaction')" style="background:#2d2d5e;border-radius:10px;padding:14px;text-align:center;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='#a29bfe'" onmouseout="this.style.borderColor='transparent'">
                        <div style="font-size:40px;">⚡</div>
                        <p style="color:white;margin:8px 0 2px;font-weight:600;">Reaction Time</p>
                        <p style="color:#aaa;font-size:11px;">How fast are you?</p>
                        <span style="background:#27ae60;color:white;font-size:10px;padding:2px 8px;border-radius:20px;">PLAY NOW</span>
                    </div>
                </div>
                <div id="crazy-game-area"></div>
            </div>
        </div>
    `;
}

function crazyGame(name) {
    const area = document.getElementById('crazy-game-area');
    if (!area) return;
    if (name === 'snake') {
        area.innerHTML = `
            <div style="background:#111827;border-radius:10px;padding:16px;text-align:center;">
                <h3 style="color:#a29bfe;margin:0 0 8px;">🐍 Snake</h3>
                <p style="color:#aaa;font-size:12px;margin:0 0 10px;">Arrow keys or WASD to move · Eat the red dot · Don't hit the wall!</p>
                <canvas id="snake-canvas" width="320" height="320" style="background:#0f172a;border-radius:8px;display:block;margin:0 auto;cursor:none;"></canvas>
                <p id="snake-score" style="color:#a29bfe;margin:8px 0 0;font-weight:bold;">Score: 0</p>
            </div>
        `;
        initSnakeGame();
    } else if (name === 'tictactoe') {
        area.innerHTML = `
            <div style="background:#111827;border-radius:10px;padding:16px;text-align:center;">
                <h3 style="color:#a29bfe;margin:0 0 8px;">❌⭕ Tic Tac Toe</h3>
                <p id="ttt-status" style="color:#aaa;font-size:13px;margin:0 0 10px;">You are X — Your turn!</p>
                <div id="ttt-board" style="display:inline-grid;grid-template-columns:repeat(3,80px);gap:6px;"></div>
                <br><button onclick="initTTT()" style="margin-top:12px;background:#6c3483;color:white;border:none;padding:6px 18px;border-radius:20px;cursor:pointer;font-size:13px;">New Game</button>
            </div>
        `;
        initTTT();
    } else if (name === 'reaction') {
        area.innerHTML = `
            <div style="background:#111827;border-radius:10px;padding:16px;text-align:center;">
                <h3 style="color:#a29bfe;margin:0 0 8px;">⚡ Reaction Time</h3>
                <p style="color:#aaa;font-size:12px;margin:0 0 10px;">Click the green box as fast as you can!</p>
                <div id="reaction-box" onclick="reactionClick()" style="width:200px;height:200px;background:#333;border-radius:12px;margin:0 auto;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:white;font-weight:bold;transition:background 0.2s;">Click to Start</div>
                <p id="reaction-result" style="color:#a29bfe;margin:10px 0 0;font-weight:bold;"></p>
            </div>
        `;
        initReaction();
    }
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function initSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const CELL = 20, COLS = 16, ROWS = 16;
    let snake = [{x:8,y:8}], dir = {x:1,y:0}, nextDir = {x:1,y:0};
    let food = spawnFood(), score = 0, running = true, raf;

    function spawnFood() {
        let f;
        do { f = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)}; }
        while (snake.some(s => s.x===f.x && s.y===f.y));
        return f;
    }

    function keyH(e) {
        const k = e.key;
        if ((k==='ArrowUp'||k==='w')&&dir.y!==1)   nextDir={x:0,y:-1};
        if ((k==='ArrowDown'||k==='s')&&dir.y!==-1) nextDir={x:0,y:1};
        if ((k==='ArrowLeft'||k==='a')&&dir.x!==1)  nextDir={x:-1,y:0};
        if ((k==='ArrowRight'||k==='d')&&dir.x!==-1)nextDir={x:1,y:0};
        e.preventDefault();
    }
    document.addEventListener('keydown', keyH);

    let last = 0;
    function loop(ts) {
        if (!running || !document.getElementById('snake-canvas')) { cancelAnimationFrame(raf); document.removeEventListener('keydown', keyH); return; }
        if (ts - last > 140) {
            last = ts;
            dir = nextDir;
            const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
            if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.some(s=>s.x===head.x&&s.y===head.y)) {
                running = false;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(0,0,canvas.width,canvas.height);
                ctx.fillStyle = '#ff6b6b'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 10);
                ctx.fillStyle = '#aaa'; ctx.font = '14px sans-serif';
                ctx.fillText('Score: '+score, canvas.width/2, canvas.height/2+18);
                document.removeEventListener('keydown', keyH);
                return;
            }
            snake.unshift(head);
            if (head.x===food.x && head.y===food.y) { food=spawnFood(); score++; const el=document.getElementById('snake-score'); if(el) el.textContent='Score: '+score; }
            else snake.pop();

            ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,canvas.width,canvas.height);
            // food
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc((food.x+0.5)*CELL,(food.y+0.5)*CELL,CELL*0.4,0,Math.PI*2); ctx.fill();
            // snake
            snake.forEach((s,i)=>{ ctx.fillStyle=i===0?'#22c55e':'#16a34a'; ctx.fillRect(s.x*CELL+1,s.y*CELL+1,CELL-2,CELL-2); });
        }
        raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
}

let tttBoard = [], tttTurn = 'X';
function initTTT() {
    tttBoard = Array(9).fill('');
    tttTurn = 'X';
    const status = document.getElementById('ttt-status');
    if (status) status.textContent = 'You are X — Your turn!';
    const board = document.getElementById('ttt-board');
    if (!board) return;
    board.innerHTML = '';
    for (let i=0; i<9; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = 'width:80px;height:80px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:36px;cursor:pointer;color:white;';
        cell.onclick = () => tttMove(i);
        board.appendChild(cell);
    }
}
function tttMove(i) {
    if (tttBoard[i] || tttTurn !== 'X') return;
    tttBoard[i] = 'X';
    tttRender();
    if (tttCheck('X')) { document.getElementById('ttt-status').textContent = '🎉 You win!'; return; }
    if (tttBoard.every(c=>c)) { document.getElementById('ttt-status').textContent = "It's a draw!"; return; }
    tttTurn = 'O';
    document.getElementById('ttt-status').textContent = 'Computer is thinking...';
    setTimeout(() => {
        const empty = tttBoard.map((v,i)=>v?null:i).filter(v=>v!==null);
        // Try to win or block
        let move = null;
        for (const m of empty) { tttBoard[m]='O'; if(tttCheck('O')){move=m;} tttBoard[m]=''; if(move!==null)break; }
        if (move===null) for (const m of empty) { tttBoard[m]='X'; if(tttCheck('X')){move=m;} tttBoard[m]=''; if(move!==null)break; }
        if (move===null) move = 4 in empty ? 4 : empty[Math.floor(Math.random()*empty.length)];
        tttBoard[move] = 'O';
        tttRender();
        if (tttCheck('O')) { document.getElementById('ttt-status').textContent = '🤖 Computer wins!'; return; }
        if (tttBoard.every(c=>c)) { document.getElementById('ttt-status').textContent = "It's a draw!"; return; }
        tttTurn = 'X';
        document.getElementById('ttt-status').textContent = 'Your turn!';
    }, 400);
}
function tttRender() {
    const cells = document.getElementById('ttt-board').children;
    tttBoard.forEach((v,i) => { cells[i].textContent = v; cells[i].style.color = v==='X'?'#60a5fa':'#f87171'; });
}
function tttCheck(p) {
    const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(w=>w.every(i=>tttBoard[i]===p));
}

let reactionState = 'idle', reactionStart = 0, reactionTimeout = null;
function initReaction() { reactionState = 'idle'; }
function reactionClick() {
    const box = document.getElementById('reaction-box');
    const result = document.getElementById('reaction-result');
    if (!box) return;
    if (reactionState === 'idle') {
        reactionState = 'waiting';
        box.style.background = '#b91c1c';
        box.textContent = 'Wait for green...';
        const delay = 1500 + Math.random() * 3000;
        reactionTimeout = setTimeout(() => {
            box.style.background = '#16a34a';
            box.textContent = 'CLICK NOW!';
            reactionStart = Date.now();
            reactionState = 'go';
        }, delay);
    } else if (reactionState === 'waiting') {
        clearTimeout(reactionTimeout);
        box.style.background = '#333';
        box.textContent = 'Too early! Click to try again.';
        result.textContent = '';
        reactionState = 'idle';
    } else if (reactionState === 'go') {
        const ms = Date.now() - reactionStart;
        box.style.background = '#1e293b';
        box.textContent = 'Click to try again';
        result.textContent = `⚡ ${ms}ms — ${ms<200?'Incredible!':ms<300?'Great!':ms<500?'Good!':'Keep practising!'}`;
        reactionState = 'idle';
    }
}

function getZappyCookWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#e17055,#fdcb6e);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🍳 ZappyCook.net</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Quick & delicious recipes for everyone</p>
            </div>
            <div class="fake-site-body" style="background:#fffdf8;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee;">
                <h2 style="color:#e17055;">Today's Recipes</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px;">
                    <div style="background:white;padding:16px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                        <div style="font-size:40px;text-align:center;">🍕</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Cheesy Pizza Pockets</h3>
                        <p style="font-size:13px;color:#888;">⏱ 20 mins &nbsp;|&nbsp; 🍽 Serves 4</p>
                        <p style="font-size:13px;">Wrap pizza dough around mozzarella, tomato sauce, and pepperoni. Bake at 200°C for 15 mins until golden!</p>
                    </div>
                    <div style="background:white;padding:16px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                        <div style="font-size:40px;text-align:center;">🥞</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Fluffy Banana Pancakes</h3>
                        <p style="font-size:13px;color:#888;">⏱ 15 mins &nbsp;|&nbsp; 🍽 Serves 2</p>
                        <p style="font-size:13px;">Mash 1 banana, mix with 1 egg and 3 tbsp flour. Fry in a pan for 2 mins each side. Top with honey!</p>
                    </div>
                    <div style="background:white;padding:16px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                        <div style="font-size:40px;text-align:center;">🍜</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Speedy Noodle Soup</h3>
                        <p style="font-size:13px;color:#888;">⏱ 10 mins &nbsp;|&nbsp; 🍽 Serves 2</p>
                        <p style="font-size:13px;">Boil noodles, add veggie broth, soy sauce, a soft-boiled egg, and spring onions. Done in a flash!</p>
                    </div>
                    <div style="background:white;padding:16px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                        <div style="font-size:40px;text-align:center;">🍫</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Mug Chocolate Cake</h3>
                        <p style="font-size:13px;color:#888;">⏱ 5 mins &nbsp;|&nbsp; 🍽 Serves 1</p>
                        <p style="font-size:13px;">Mix cocoa, flour, sugar, egg and milk in a mug. Microwave for 90 seconds. Enjoy warm!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getPixelVaultWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🖼️ PixelVault.io</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Your home for pixel art & digital creativity</p>
            </div>
            <div class="fake-site-body" style="background:#1a1a2e;padding:20px;border-radius:0 0 8px 8px;border:1px solid #333;">
                <h2 style="color:#a29bfe;">Featured Artworks</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:12px;">
                    <div style="background:#16213e;border-radius:10px;padding:12px;text-align:center;border:1px solid #302b63;">
                        <div style="font-size:48px;line-height:1.2;">🌄</div>
                        <p style="color:#dfe6e9;margin:8px 0 2px;font-weight:600;">Pixel Sunset</p>
                        <p style="color:#636e72;font-size:12px;">by artlover99</p>
                        <p style="color:#a29bfe;font-size:12px;">❤️ 482 likes</p>
                    </div>
                    <div style="background:#16213e;border-radius:10px;padding:12px;text-align:center;border:1px solid #302b63;">
                        <div style="font-size:48px;line-height:1.2;">🏯</div>
                        <p style="color:#dfe6e9;margin:8px 0 2px;font-weight:600;">Castle Night</p>
                        <p style="color:#636e72;font-size:12px;">by pixelwiz</p>
                        <p style="color:#a29bfe;font-size:12px;">❤️ 317 likes</p>
                    </div>
                    <div style="background:#16213e;border-radius:10px;padding:12px;text-align:center;border:1px solid #302b63;">
                        <div style="font-size:48px;line-height:1.2;">🌊</div>
                        <p style="color:#dfe6e9;margin:8px 0 2px;font-weight:600;">Ocean Depths</p>
                        <p style="color:#636e72;font-size:12px;">by deepblue</p>
                        <p style="color:#a29bfe;font-size:12px;">❤️ 254 likes</p>
                    </div>
                    <div style="background:#16213e;border-radius:10px;padding:12px;text-align:center;border:1px solid #302b63;">
                        <div style="font-size:48px;line-height:1.2;">🚀</div>
                        <p style="color:#dfe6e9;margin:8px 0 2px;font-weight:600;">Space Launch</p>
                        <p style="color:#636e72;font-size:12px;">by starmaker</p>
                        <p style="color:#a29bfe;font-size:12px;">❤️ 601 likes</p>
                    </div>
                    <div style="background:#16213e;border-radius:10px;padding:12px;text-align:center;border:1px solid #302b63;">
                        <div style="font-size:48px;line-height:1.2;">🦊</div>
                        <p style="color:#dfe6e9;margin:8px 0 2px;font-weight:600;">Pixel Fox</p>
                        <p style="color:#636e72;font-size:12px;">by tokyodream</p>
                        <p style="color:#a29bfe;font-size:12px;">❤️ 738 likes</p>
                    </div>
                    <div style="background:#16213e;border-radius:10px;padding:12px;text-align:center;border:1px solid #302b63;">
                        <div style="font-size:48px;line-height:1.2;">🌲</div>
                        <p style="color:#dfe6e9;margin:8px 0 2px;font-weight:600;">Forest Path</p>
                        <p style="color:#636e72;font-size:12px;">by naturedraw</p>
                        <p style="color:#a29bfe;font-size:12px;">❤️ 412 likes</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCosmicBlogWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#0984e3,#00cec9);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🌌 CosmicBlog.org</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Exploring the universe one post at a time</p>
            </div>
            <div class="fake-site-body" style="background:white;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee;">
                <h2 style="color:#0984e3;">Latest Posts</h2>
                <div style="display:flex;flex-direction:column;gap:16px;margin-top:12px;">
                    <div style="background:#f0f8ff;border-radius:10px;padding:16px;border-left:4px solid #0984e3;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <h3 style="margin:0;color:#2d3436;">🪐 Why Saturn's Rings Are Disappearing</h3>
                            <span style="font-size:12px;color:#b2bec3;">Apr 17, 2026</span>
                        </div>
                        <p style="color:#636e72;margin:8px 0 0;font-size:14px;">Scientists have discovered that Saturn's iconic rings are slowly being pulled into the planet by gravity. At the current rate, they could vanish within 100 million years...</p>
                        <span style="font-size:12px;color:#0984e3;">✍️ by CosmosWriter &nbsp;|&nbsp; 💬 23 comments</span>
                    </div>
                    <div style="background:#f0fff8;border-radius:10px;padding:16px;border-left:4px solid #00cec9;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <h3 style="margin:0;color:#2d3436;">🌙 Top 5 Things to See With a Telescope</h3>
                            <span style="font-size:12px;color:#b2bec3;">Apr 15, 2026</span>
                        </div>
                        <p style="color:#636e72;margin:8px 0 0;font-size:14px;">You don't need a fancy telescope to explore the night sky. Even a basic model can reveal the Moon's craters, Jupiter's moons, and star clusters in amazing detail...</p>
                        <span style="font-size:12px;color:#00cec9;">✍️ by StargazerX &nbsp;|&nbsp; 💬 41 comments</span>
                    </div>
                    <div style="background:#fff8f0;border-radius:10px;padding:16px;border-left:4px solid #fdcb6e;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <h3 style="margin:0;color:#2d3436;">☄️ A Comet Is Passing Earth Next Month!</h3>
                            <span style="font-size:12px;color:#b2bec3;">Apr 12, 2026</span>
                        </div>
                        <p style="color:#636e72;margin:8px 0 0;font-size:14px;">Comet ZX-7 will pass within 40 million km of Earth in May 2026 — the closest approach in 50 years. Here's how and when to spot it in the night sky...</p>
                        <span style="font-size:12px;color:#fdcb6e;">✍️ by NightSky99 &nbsp;|&nbsp; 💬 88 comments</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getNovaSparkWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#6c5ce7,#fd79a8);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">⚡ NovaSpark.tech</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Daily tech news, gadget reviews & how-tos</p>
            </div>
            <div class="fake-site-body" style="background:#fafafa;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee;">
                <h2 style="color:#6c5ce7;">Top Stories Today</h2>
                <div style="display:flex;flex-direction:column;gap:14px;margin-top:12px;">
                    <div style="background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:flex-start;">
                        <div style="font-size:36px;">🤖</div>
                        <div>
                            <h3 style="margin:0 0 4px;color:#2d3436;">New AI Chip Runs 10x Faster on a Single Battery</h3>
                            <p style="color:#636e72;font-size:13px;margin:0 0 6px;">Startup NeuralEdge unveiled a chip that processes AI tasks locally without needing the cloud — promising huge privacy and speed improvements.</p>
                            <span style="font-size:12px;color:#6c5ce7;">✍️ by TechReporter &nbsp;|&nbsp; Apr 19, 2026 &nbsp;|&nbsp; 💬 57 comments</span>
                        </div>
                    </div>
                    <div style="background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:flex-start;">
                        <div style="font-size:36px;">🕶️</div>
                        <div>
                            <h3 style="margin:0 0 4px;color:#2d3436;">Smart Glasses That Translate Signs in Real Time</h3>
                            <p style="color:#636e72;font-size:13px;margin:0 0 6px;">A new pair of AR glasses can read street signs, menus, and text in 40 languages and display a live translation right in your field of view.</p>
                            <span style="font-size:12px;color:#6c5ce7;">✍️ by GadgetGuru &nbsp;|&nbsp; Apr 18, 2026 &nbsp;|&nbsp; 💬 34 comments</span>
                        </div>
                    </div>
                    <div style="background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:flex-start;">
                        <div style="font-size:36px;">🔋</div>
                        <div>
                            <h3 style="margin:0 0 4px;color:#2d3436;">Solar Paint That Charges Your Phone Through Walls</h3>
                            <p style="color:#636e72;font-size:13px;margin:0 0 6px;">Researchers have developed a photovoltaic paint that can be applied to any surface and generate electricity from ambient light — indoors or outdoors.</p>
                            <span style="font-size:12px;color:#6c5ce7;">✍️ by GreenTechNow &nbsp;|&nbsp; Apr 17, 2026 &nbsp;|&nbsp; 💬 102 comments</span>
                        </div>
                    </div>
                </div>
            </div>
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
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.crazygames.fun')">🎮 CrazyGames.fun</div>
                <div class="shortcut" onclick="browserNavigate('space')">🚀 Space</div>
                <div class="shortcut" onclick="browserNavigate('dinosaurs')">🦕 Dinosaurs</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.novaspark.tech')">⚡ NovaSpark.tech</div>
                <div class="shortcut" onclick="browserNavigate('animals')">🐘 Animals</div>
                <div class="shortcut" onclick="browserNavigate('ocean')">🌊 Ocean</div>
                <div class="shortcut" onclick="browserNavigate('science')">🔬 Science</div>
                <div class="shortcut" onclick="browserNavigate('robots')">🤖 Robots</div>
                <div class="shortcut" onclick="browserNavigate('football')">⚽ Football</div>
                <div class="shortcut" onclick="browserNavigate('history')">📜 History</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.zappycook.net')">🍳 ZappyCook.net</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.pixelvault.io')">🖼️ PixelVault.io</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.cosmicblog.org')">🌌 CosmicBlog.org</div>
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
