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
        color: '#a6750c',
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
        color: '#39e91e',
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
        name: 'Throwball',
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
    },
    simpleai: {
        name: 'Simple AI',
        icon: '🤖',
        color: '#6c3483',
        minWidth: 600,
        minHeight: 500
    }
};

// Store app installation state
const installedApps = new Set(['playstore', 'notes', 'game2048', 'musicplayer', 'calculator', 'memory', 'books', 'football', 'calendar', 'net2', 'browser', 'simpleai']);

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
            case 'simpleai':
                return this.getSimpleAIContent();
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
                <div class="game-title">Throwball</div>
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
                            <div class="net2-item" data-title="Vortex Rising" onclick="playNet2Content('Vortex Rising')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23162447' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🌀%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3EVortex Rising%3C/text%3E%3C/svg%3E" alt="Vortex Rising">
                            </div>
                            <div class="net2-item" data-title="Neon Hollow" onclick="playNet2Content('Neon Hollow')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%231b1423' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E💜%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3ENeon Hollow%3C/text%3E%3C/svg%3E" alt="Neon Hollow">
                            </div>
                            <div class="net2-item" data-title="The Frozen Keep" onclick="playNet2Content('The Frozen Keep')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%230a3d62' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E❄️%3C/text%3E%3Ctext x='100' y='170' font-size='14' fill='white' text-anchor='middle'%3EThe Frozen Keep%3C/text%3E%3C/svg%3E" alt="The Frozen Keep">
                            </div>
                            <div class="net2-item" data-title="Dust &amp; Thunder" onclick="playNet2Content('Dust \x26 Thunder')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23522e20' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E⚡%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3EDust & Thunder%3C/text%3E%3C/svg%3E" alt="Dust and Thunder">
                            </div>
                            <div class="net2-item" data-title="Shadow Protocol" onclick="playNet2Content('Shadow Protocol')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23111' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🤖%3C/text%3E%3Ctext x='100' y='170' font-size='14' fill='white' text-anchor='middle'%3EShadow Protocol%3C/text%3E%3C/svg%3E" alt="Shadow Protocol">
                            </div>
                        </div>
                    </div>

                    <div class="net2-row">
                        <h2>Popular on Net2</h2>
                        <div class="net2-row-content">
                            <div class="net2-item" data-title="Galactic Drifters" onclick="playNet2Content('Galactic Drifters')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%231a1a2e' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🚀%3C/text%3E%3Ctext x='100' y='170' font-size='14' fill='white' text-anchor='middle'%3EGalactic Drifters%3C/text%3E%3C/svg%3E" alt="Galactic Drifters">
                            </div>
                            <div class="net2-item" data-title="Crimson Pact" onclick="playNet2Content('Crimson Pact')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%234a0000' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🗡️%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3ECrimson Pact%3C/text%3E%3C/svg%3E" alt="Crimson Pact">
                            </div>
                            <div class="net2-item" data-title="Echo Valley" onclick="playNet2Content('Echo Valley')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23134d0f' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E🌿%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3EEcho Valley%3C/text%3E%3C/svg%3E" alt="Echo Valley">
                            </div>
                            <div class="net2-item" data-title="Iron Circuit" onclick="playNet2Content('Iron Circuit')">
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%23212121' width='200' height='300'/%3E%3Ctext x='100' y='130' font-size='50' fill='white' text-anchor='middle'%3E⚙️%3C/text%3E%3Ctext x='100' y='170' font-size='16' fill='white' text-anchor='middle'%3EIron Circuit%3C/text%3E%3C/svg%3E" alt="Iron Circuit">
                            </div>
                            <div class="net2-item" data-title="Lost Meridian" onclick="playNet2Content('Lost Meridian')">
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
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.hazygames.fun')">🎮 HazyGames.fun</div>
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
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.dailypets.fun')">🐾 DailyPets.fun</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.quizmaster.io')">🧩 QuizMaster.io</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.tinytales.org')">📖 TinyTales.org</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.buildcraft.tech')">🔧 BuildCraft.tech</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.stargazer.space')">🔭 Stargazer.space</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.munchbox.net')">🍱 MunchBox.net</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.codecubs.io')">💻 CodeCubs.io</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.sketchwild.org')">🎨 SketchWild.org</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.factblast.fun')">💥 FactBlast.fun</div>
                            <div class="shortcut website-shortcut" onclick="browserNavigate('www.quickpick.app')">📸 QuickPick.app</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSimpleAIContent() {
        return `
            <div style="display:flex;flex-direction:column;height:100%;background:#0f0f1a;border-radius:8px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#6c3483,#1a5276);padding:14px 18px;display:flex;align-items:center;gap:10px;">
                    <span style="font-size:26px;">🤖</span>
                    <div>
                        <div style="color:white;font-weight:bold;font-size:16px;">Simple AI</div>
                        <div style="color:rgba(255,255,255,0.7);font-size:11px;">Ask me anything about the web!</div>
                    </div>
                </div>
                <div id="ai-messages" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;min-height:0;">
                    <div class="ai-msg ai-msg-bot">👋 Hi! I'm Simple AI. Ask me about <b>HazyGames</b>, <b>ZappyCook</b>, <b>PixelVault</b>, <b>CosmicBlog</b>, <b>NovaSpark</b>, or topics like space, animals, science and more!</div>
                </div>
                <div style="padding:10px 14px;background:#1a1a2e;display:flex;gap:8px;">
                    <input id="ai-input" type="text" placeholder="Ask me anything..." style="flex:1;background:#2d2d5e;border:1px solid #4a4a8a;border-radius:20px;padding:8px 14px;color:white;font-size:13px;outline:none;" onkeydown="if(event.key==='Enter')simpleAISend()">
                    <button onclick="simpleAISend()" style="background:#6c3483;color:white;border:none;border-radius:20px;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:bold;">Send</button>
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
            case 'simpleai':
                initSimpleAI();
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
            const targetX = parseInt(target.style.left) || 0;
            const targetY = 100; // Target is at 100px from bottom (from CSS)

            // Check if ball is near target (hit radius of ~40px)
            const distance = Math.sqrt(Math.pow(ballX - targetX, 2) + Math.pow(ballY - targetY, 2));

            if (distance < 40) {
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
    panel.classList.add('active');
}

function closeNet2Info() {
    document.getElementById('net2-info-panel').classList.remove('active');
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
    net2Anim.genre = SHOW_GENRE_ANIM[title] || 'scifi';
    net2InitParticles(net2Anim.genre, 480, 180);
    net2Anim.sceneIdx = -1;
    net2Anim.caption = '';
    net2Anim.captionAge = 0;
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
let net2ActiveScenes = [];

// 30 frames per minute = 1 new art frame every 2000ms
const NET2_FRAME_INTERVAL = 2000;
// Canvas tick every ~33ms (≈30fps render loop) for smooth progress bar
const NET2_TICK_MS = 33;

// Animation state for real canvas engine
const net2Anim = {
    genre: 'scifi',
    particles: [],
    sceneIdx: -1,
    caption: '',
    captionAge: 0,
    lastT: 0,
};

function startNet2Video(customScenes, frames, emoji) {
    net2IsPlaying = true;
    net2CurrentTime = 0;
    net2ArtFrameIndex = 0;
    net2LastFrameTime = performance.now();
    net2ActiveFrames = frames && frames.length ? frames : [['🎬','PLAYING','...']];
    net2ActiveScenes = customScenes && customScenes.length ? customScenes : [];
    net2ShowEmoji = emoji || '🎬';
    net2Anim.lastT = performance.now() / 1000;
    updateNet2Progress();

    if (net2VideoInterval) { clearInterval(net2VideoInterval); net2VideoInterval = null; }
    if (net2Raf) { cancelAnimationFrame(net2Raf); net2Raf = null; }

    let lastTick = performance.now();

    function renderFrame(now) {
        if (!net2IsPlaying) return;

        // Advance wall-clock seconds
        const delta = now - lastTick;
        lastTick = now;
        const dt = delta / 1000;
        net2CurrentTime += dt;
        if (net2CurrentTime > net2Duration) net2CurrentTime = net2Duration;
        updateNet2Progress();

        net2DrawAnimFrame(dt, net2CurrentTime, net2Duration, net2ActiveScenes);

        if (net2CurrentTime >= net2Duration) {
            net2IsPlaying = false;
            drawNet2CanvasEnd(net2ShowEmoji);
            return;
        }

        net2Raf = requestAnimationFrame(renderFrame);
    }

    net2DrawAnimFrame(0, 0, net2Duration, net2ActiveScenes);
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

const SHOW_GENRE_ANIM = {
    'Shadow Protocol':  'scifi',
    'Galactic Drifters':'scifi',
    'Vortex Rising':    'storm',
    'Neon Hollow':      'neon',
    'The Frozen Keep':  'ice',
    'Dust & Thunder':   'western',
    'Crimson Pact':     'fantasy',
    'Echo Valley':      'nature',
    'Iron Circuit':     'sparks',
    'Lost Meridian':    'ocean',
};

function net2InitParticles(genre, W, H) {
    const p = [];
    if (genre === 'scifi') {
        for (let i = 0; i < 90; i++) p.push({ x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4, size: Math.random()*1.8+0.3, alpha: Math.random()*0.8+0.2 });
    } else if (genre === 'storm') {
        for (let i = 0; i < 60; i++) { const a = Math.random()*Math.PI*2, sp = 30+Math.random()*70; p.push({ x: W/2, y: H/2, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: Math.random(), maxLife: 0.8+Math.random()*0.6, size: 1+Math.random()*2 }); }
    } else if (genre === 'neon') {
        for (let i = 0; i < 25; i++) p.push({ x: Math.random()*W, y: Math.random()*H, vy: 0.4+Math.random()*0.5, size: 2+Math.random()*4, alpha: 0.5+Math.random()*0.5, hue: 270+Math.random()*60 });
    } else if (genre === 'ice') {
        for (let i = 0; i < 55; i++) p.push({ x: Math.random()*W, y: Math.random()*H-H, vy: 20+Math.random()*40, vx: (Math.random()-0.5)*8, size: 1.5+Math.random()*3, wobble: Math.random()*Math.PI*2, wobbleSpeed: 0.8+Math.random()*1.5 });
    } else if (genre === 'western') {
        for (let i = 0; i < 70; i++) p.push({ x: Math.random()*W, y: H*0.5+Math.random()*H*0.5, vx: (Math.random()-0.3)*18, vy: -(10+Math.random()*30), life: Math.random(), maxLife: 1, size: 1+Math.random()*3 });
    } else if (genre === 'fantasy') {
        for (let i = 0; i < 45; i++) p.push({ x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-0.5)*12, vy: -(5+Math.random()*18), life: Math.random(), maxLife: 1+Math.random(), size: 1.5+Math.random()*2.5, hue: 340+Math.random()*40 });
    } else if (genre === 'nature') {
        for (let i = 0; i < 60; i++) p.push({ x: Math.random()*W, y: Math.random()*H-H, vy: 40+Math.random()*60, vx: (Math.random()-0.5)*5, size: 0.8+Math.random()*1.5, alpha: 0.3+Math.random()*0.5 });
    } else if (genre === 'sparks') {
        for (let i = 0; i < 55; i++) { const a = Math.random()*Math.PI*2, sp = 20+Math.random()*90; p.push({ x: W*0.5+(Math.random()-0.5)*30, y: H*0.52+(Math.random()-0.5)*15, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp-25, life: Math.random(), maxLife: 0.4+Math.random()*0.5, size: 1+Math.random()*2 }); }
    } else if (genre === 'ocean') {
        for (let i = 0; i < 35; i++) p.push({ x: Math.random()*W, y: H*0.55+Math.random()*H*0.4, vx: 8+Math.random()*18, size: 1.5+Math.random()*2.5, alpha: 0.25+Math.random()*0.4, phase: Math.random()*Math.PI*2 });
    }
    net2Anim.particles = p;
}

function net2DrawAnimFrame(dt, currentTime, duration, scenes) {
    const canvas = document.getElementById('net2-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const t = performance.now() / 1000;
    const genre = net2Anim.genre;
    const p = net2Anim.particles;

    // ── BACKGROUNDS & PARTICLES ──────────────────────────────
    if (genre === 'scifi') {
        const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
        g.addColorStop(0, '#0f0d28'); g.addColorStop(1, '#040410');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // Warp grid
        ctx.strokeStyle = 'rgba(0,255,130,0.07)'; ctx.lineWidth = 1;
        const vp = H * 0.4;
        for (let lx = 0; lx <= 10; lx++) { const nx = (lx/10)*(W*1.6)-W*0.3; ctx.beginPath(); ctx.moveTo(W/2, vp); ctx.lineTo(nx, H+10); ctx.stroke(); }
        for (let ly = 0; ly <= 7; ly++) { const prog = ((t*0.6+ly/7)%1); const py = vp+(H-vp)*prog; const xs = (py-vp)/(H-vp); ctx.beginPath(); ctx.moveTo(W/2-xs*W*0.8, py); ctx.lineTo(W/2+xs*W*0.8, py); ctx.stroke(); }
        // Stars
        for (const s of p) { s.x += s.vx; s.y += s.vy; if (s.x<0||s.x>W) s.x=Math.random()*W; if (s.y<0||s.y>H) s.y=Math.random()*H; ctx.globalAlpha = s.alpha*(0.4+0.6*Math.sin(t*2+s.x*0.1)); ctx.fillStyle='#fff'; ctx.fillRect(s.x, s.y, s.size, s.size); } ctx.globalAlpha=1;
        // Ship
        const sx = W/2+Math.sin(t*0.5)*25, sy = H*0.38+Math.sin(t*0.7)*8;
        ctx.fillStyle='rgba(0,255,130,0.75)'; ctx.globalAlpha=0.8; net2DrawSpaceship(ctx,sx,sy,14); ctx.globalAlpha=1;
        // Engine glow trail
        const tg = ctx.createRadialGradient(sx,sy+16,0,sx,sy+16,18); tg.addColorStop(0,'rgba(0,255,130,0.5)'); tg.addColorStop(1,'rgba(0,255,130,0)'); ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(sx,sy+16,18,0,Math.PI*2); ctx.fill();

    } else if (genre === 'storm') {
        const g2 = ctx.createLinearGradient(0,0,0,H); g2.addColorStop(0,'#080808'); g2.addColorStop(0.5,'#1a1008'); g2.addColorStop(1,'#2a1800'); ctx.fillStyle=g2; ctx.fillRect(0,0,W,H);
        // Tornado
        ctx.strokeStyle='rgba(180,100,20,0.25)'; ctx.lineWidth=1;
        for (let i=0;i<10;i++) { const a=t*2.5+i*(Math.PI*2/10); const r=15+i*7; const cx=W/2+Math.sin(t*0.9)*12; ctx.beginPath(); ctx.ellipse(cx,H/2,r,r*0.28,a,0,Math.PI*2); ctx.stroke(); }
        // Swirl particles
        for (const s of p) { s.life-=dt; if(s.life<=0){s.life=s.maxLife;const a=Math.random()*Math.PI*2,sp=30+Math.random()*70;s.x=W/2+(Math.random()-0.5)*20;s.y=H/2+(Math.random()-0.5)*15;s.vx=Math.cos(a)*sp;s.vy=Math.sin(a)*sp;} s.x+=s.vx*dt; s.y+=s.vy*dt; const dx=s.x-W/2,dy=s.y-H/2,dist=Math.sqrt(dx*dx+dy*dy); if(dist>4){const sw=90/dist;s.vx+=-dy/dist*sw*dt;s.vy+=dx/dist*sw*dt;} ctx.globalAlpha=Math.min(1,s.life/s.maxLife)*0.85; ctx.fillStyle='#ff8822'; ctx.fillRect(s.x-s.size/2,s.y-s.size/2,s.size,s.size); } ctx.globalAlpha=1;
        // Lightning flash
        if(Math.sin(t*0.9)*Math.cos(t*1.7)>0.92){ctx.fillStyle='rgba(255,230,120,0.12)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(255,230,50,0.9)';ctx.lineWidth=1.5;let lx=W*0.25+Math.random()*W*0.5;ctx.beginPath();ctx.moveTo(lx,0);for(let i=0;i<5;i++){lx+=(Math.random()-0.5)*35;ctx.lineTo(lx,H/5*(i+1));}ctx.stroke();}

    } else if (genre === 'neon') {
        ctx.fillStyle='#05001a'; ctx.fillRect(0,0,W,H);
        // Cityscape
        ctx.fillStyle='#0d0020';
        for (let b=0;b<14;b++){const bx=b*(W/14);const bh=18+Math.abs(Math.sin(b*1.7))*55;ctx.fillRect(bx,H-bh,W/16,bh);}
        // Grid
        ctx.strokeStyle='rgba(160,40,255,0.12)'; ctx.lineWidth=1;
        for(let gx=0;gx<=W;gx+=28){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
        for(let gy=0;gy<=H;gy+=18){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
        // Neon orbs
        for (const s of p) { s.y-=s.vy*dt*60; if(s.y<-15)s.y=H+15; const hsl=`hsl(${s.hue},100%,70%)`; ctx.globalAlpha=s.alpha*(0.4+0.6*Math.sin(t*2.5+s.x*0.08)); ctx.shadowBlur=14; ctx.shadowColor=hsl; ctx.fillStyle=hsl; ctx.beginPath(); ctx.arc(s.x,s.y,s.size,0,Math.PI*2); ctx.fill(); } ctx.shadowBlur=0; ctx.globalAlpha=1;
        // Scanlines
        for(let sl=0;sl<H;sl+=3){ctx.fillStyle='rgba(0,0,0,0.14)';ctx.fillRect(0,sl,W,1);}

    } else if (genre === 'ice') {
        const g3=ctx.createLinearGradient(0,0,0,H);g3.addColorStop(0,'#000813');g3.addColorStop(1,'#001230');ctx.fillStyle=g3;ctx.fillRect(0,0,W,H);
        // Castle
        ctx.fillStyle='#00101f'; ctx.fillRect(W*0.3,H*0.28,W*0.4,H*0.72); ctx.fillRect(W*0.24,H*0.22,W*0.09,H*0.15); ctx.fillRect(W*0.67,H*0.22,W*0.09,H*0.15); ctx.fillRect(W*0.44,H*0.12,W*0.12,H*0.2);
        // Snowflakes
        for (const s of p) { s.y+=s.vy*dt; s.x+=Math.sin(t*s.wobbleSpeed+s.wobble)*0.5; if(s.y>H+10)s.y=-10; ctx.globalAlpha=0.75; ctx.strokeStyle='#99ccff'; ctx.lineWidth=0.7; ctx.fillStyle='#aadaff'; ctx.beginPath();ctx.arc(s.x,s.y,s.size*0.4,0,Math.PI*2);ctx.fill(); for(let arm=0;arm<6;arm++){const a=arm*(Math.PI/3)+t*0.25;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+Math.cos(a)*s.size*1.8,s.y+Math.sin(a)*s.size*1.8);ctx.stroke();} } ctx.globalAlpha=1;
        // Frost vignette
        const iv=ctx.createLinearGradient(0,0,0,H);iv.addColorStop(0,'rgba(140,190,255,0.18)');iv.addColorStop(0.3,'transparent');iv.addColorStop(0.7,'transparent');iv.addColorStop(1,'rgba(140,190,255,0.18)');ctx.fillStyle=iv;ctx.fillRect(0,0,W,H);

    } else if (genre === 'western') {
        const g4=ctx.createLinearGradient(0,0,0,H);g4.addColorStop(0,'#18040000');g4.addColorStop(0,'#180400');g4.addColorStop(0.45,'#3d1000');g4.addColorStop(0.72,'#6e2a00');g4.addColorStop(1,'#8a4500');ctx.fillStyle=g4;ctx.fillRect(0,0,W,H);
        // Sun glow
        const sunX=W*0.72,sunY=H*0.32,sg=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,45);sg.addColorStop(0,'rgba(255,200,50,0.9)');sg.addColorStop(0.3,'rgba(255,90,0,0.35)');sg.addColorStop(1,'rgba(255,40,0,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sunX,sunY,45,0,Math.PI*2);ctx.fill();
        // Ground
        ctx.fillStyle='#2a1200';ctx.fillRect(0,H*0.72,W,H*0.28);
        // Cacti
        ctx.fillStyle='#0a0400';net2DrawCactus(ctx,W*0.1,H*0.65,22);net2DrawCactus(ctx,W*0.86,H*0.6,18);
        // Dust particles
        for(const s of p){s.life-=dt;if(s.life<=0){s.life=s.maxLife;s.x=Math.random()*W;s.y=H*0.6+Math.random()*H*0.35;s.vy=-(10+Math.random()*28);s.vx=(Math.random()-0.3)*18;}s.x+=s.vx*dt;s.y+=s.vy*dt;ctx.globalAlpha=Math.max(0,s.life/s.maxLife)*0.35;ctx.fillStyle='#c06020';ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;

    } else if (genre === 'fantasy') {
        const g5=ctx.createLinearGradient(0,0,0,H);g5.addColorStop(0,'#0d0008');g5.addColorStop(1,'#1a0015');ctx.fillStyle=g5;ctx.fillRect(0,0,W,H);
        // Mountains
        ctx.fillStyle='#080005';ctx.beginPath();ctx.moveTo(0,H);for(let mx=0;mx<=W;mx+=2)ctx.lineTo(mx,H*0.52-Math.abs(Math.sin(mx*0.04))*55-Math.abs(Math.sin(mx*0.025))*28);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
        // Magic particles
        for(const s of p){s.life-=dt;if(s.life<=0){s.life=s.maxLife;s.x=Math.random()*W;s.y=H*0.65+Math.random()*H*0.35;s.vy=-(5+Math.random()*18);s.vx=(Math.random()-0.5)*12;}s.x+=s.vx*dt;s.y+=s.vy*dt;ctx.globalAlpha=Math.max(0,s.life/s.maxLife)*0.8;ctx.shadowBlur=7;ctx.shadowColor=`hsl(${s.hue},100%,70%)`;ctx.fillStyle=`hsl(${s.hue},100%,70%)`;ctx.beginPath();ctx.arc(s.x,s.y,s.size,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;ctx.globalAlpha=1;
        // Sword
        const swx=W*0.5+Math.sin(t*0.5)*10,swy=H*0.43;ctx.strokeStyle='rgba(255,80,80,0.65)';ctx.lineWidth=2;ctx.save();ctx.translate(swx,swy);ctx.rotate(Math.sin(t*0.3)*0.2-0.4);ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(0,30);ctx.moveTo(-9,-8);ctx.lineTo(9,-8);ctx.stroke();ctx.restore();

    } else if (genre === 'nature') {
        const g6=ctx.createLinearGradient(0,0,0,H);g6.addColorStop(0,'#010d01');g6.addColorStop(1,'#041404');ctx.fillStyle=g6;ctx.fillRect(0,0,W,H);
        // Rolling hills
        ctx.fillStyle='#020a02';ctx.beginPath();ctx.moveTo(0,H);for(let hx=0;hx<=W;hx+=2)ctx.lineTo(hx,H*0.54+Math.sin((hx/W)*Math.PI*3+t*0.18)*22+Math.sin((hx/W)*Math.PI*7)*10);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
        // House
        ctx.fillStyle='#010801';ctx.fillRect(W*0.43,H*0.4,W*0.14,H*0.14);ctx.beginPath();ctx.moveTo(W*0.41,H*0.4);ctx.lineTo(W*0.5,H*0.31);ctx.lineTo(W*0.59,H*0.4);ctx.closePath();ctx.fill();
        // Rain
        for(const s of p){s.y+=s.vy*dt;s.x+=s.vx*dt;if(s.y>H){s.y=-5;s.x=Math.random()*W;}ctx.globalAlpha=s.alpha;ctx.strokeStyle='#88ccaa';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+s.vx*0.15,s.y+7);ctx.stroke();}ctx.globalAlpha=1;

    } else if (genre === 'sparks') {
        const g7=ctx.createLinearGradient(0,0,0,H);g7.addColorStop(0,'#090400');g7.addColorStop(1,'#120900');ctx.fillStyle=g7;ctx.fillRect(0,0,W,H);
        // Arena floor line
        ctx.fillStyle='#1a0e00';ctx.fillRect(0,H*0.62,W,H*0.38);
        // Robots
        ctx.fillStyle='#0d0800';net2DrawRobot(ctx,W*0.22,H*0.56,20);net2DrawRobot(ctx,W*0.78,H*0.56,20);
        // Sparks
        for(const s of p){s.life-=dt;if(s.life<=0){s.life=s.maxLife;const a=Math.random()*Math.PI*2,sp=20+Math.random()*90;s.x=W*0.5+(Math.random()-0.5)*35;s.y=H*0.52+(Math.random()-0.5)*15;s.vx=Math.cos(a)*sp;s.vy=Math.sin(a)*sp-25;}s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=65*dt;ctx.globalAlpha=Math.max(0,s.life/s.maxLife);ctx.fillStyle=`hsl(${20+Math.random()*40},100%,70%)`;ctx.fillRect(s.x-s.size/2,s.y-s.size/2,s.size,s.size);}ctx.globalAlpha=1;

    } else if (genre === 'ocean') {
        const g8=ctx.createLinearGradient(0,0,0,H);g8.addColorStop(0,'#000a18');g8.addColorStop(0.5,'#001a38');g8.addColorStop(1,'#002450');ctx.fillStyle=g8;ctx.fillRect(0,0,W,H);
        // Moon
        ctx.fillStyle='rgba(210,225,255,0.9)';ctx.beginPath();ctx.arc(W*0.14,H*0.2,14,0,Math.PI*2);ctx.fill();
        // Waves
        for(let w=4;w>=0;w--){ctx.strokeStyle=`rgba(90,170,255,${0.1+w*0.06})`;ctx.lineWidth=2;ctx.beginPath();for(let wx=0;wx<=W;wx+=2){const wy=H*0.5+w*11+Math.sin((wx/W)*Math.PI*5+t*(0.7+w*0.2))*13;wx===0?ctx.moveTo(wx,wy):ctx.lineTo(wx,wy);}ctx.stroke();}
        // Sailing ship
        const shX=((t*12)%(W+70))-70;ctx.fillStyle='#001e40';ctx.save();ctx.translate(shX,H*0.44);ctx.beginPath();ctx.moveTo(-24,4);ctx.lineTo(24,4);ctx.lineTo(19,14);ctx.lineTo(-19,14);ctx.closePath();ctx.fill();ctx.fillRect(-2,-22,3,26);ctx.fillStyle='#001530';ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(16,-6);ctx.lineTo(0,-6);ctx.closePath();ctx.fill();ctx.restore();
        // Compass
        const cx3=W*0.86,cy3=H*0.25,cr=16;ctx.strokeStyle='rgba(100,175,255,0.6)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx3,cy3,cr,0,Math.PI*2);ctx.stroke();const na=t*0.6;ctx.save();ctx.translate(cx3,cy3);ctx.rotate(na);ctx.strokeStyle='#ff4444';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,cr-3);ctx.lineTo(0,-(cr-3));ctx.stroke();ctx.restore();
    }

    // ── CAPTION SYSTEM ───────────────────────────────────────
    if (scenes && scenes.length > 0) {
        const si = Math.min(Math.floor((currentTime/duration)*scenes.length), scenes.length-1);
        if (net2Anim.sceneIdx !== si) { net2Anim.sceneIdx=si; net2Anim.caption=scenes[si]; net2Anim.captionAge=0; }
        net2Anim.captionAge += dt;
    }
    if (net2Anim.caption) {
        const fadeIn=Math.min(1,net2Anim.captionAge*2.5);
        const fadeOut=net2Anim.captionAge>2.5?Math.max(0,1-(net2Anim.captionAge-2.5)*2.5):1;
        const alpha=fadeIn*fadeOut;
        if(alpha>0.01){
            ctx.globalAlpha=alpha;
            ctx.font='bold 11px sans-serif';
            const tw=ctx.measureText(net2Anim.caption).width;
            const px=(W-tw-22)/2,py=H-30;
            ctx.fillStyle='rgba(0,0,0,0.75)';
            net2RoundRect(ctx,px,py,tw+22,22,5);
            ctx.fillStyle='#ffffff';
            ctx.textAlign='center';
            ctx.fillText(net2Anim.caption,W/2,py+15);
            ctx.textAlign='left';
            ctx.globalAlpha=1;
        }
    }

    // ── HUD OVERLAY ──────────────────────────────────────────
    ctx.fillStyle='rgba(0,0,0,0.45)';
    ctx.fillRect(0,0,W,26);
    const elapsed=Math.floor(currentTime),tot=Math.floor(duration);
    ctx.fillStyle='rgba(255,255,255,0.8)';
    ctx.font='bold 10px monospace';
    ctx.textAlign='right';
    ctx.fillText(`${fmtTime(elapsed)} / ${fmtTime(tot)}`,W-10,17);
    ctx.textAlign='left';
    if(net2IsPlaying){
        const pulse=Math.sin(t*4)>0;
        ctx.fillStyle=pulse?'#e50914':'rgba(229,9,20,0.3)';
        ctx.beginPath();ctx.arc(10,13,4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.75)';
        ctx.font='9px monospace';
        ctx.fillText('PLAYING',18,17);
    }
}

function net2DrawSpaceship(ctx,x,y,size){
    ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*0.55,y+size*0.45);ctx.lineTo(x+size*0.18,y+size*0.18);ctx.lineTo(x-size*0.18,y+size*0.18);ctx.lineTo(x-size*0.55,y+size*0.45);ctx.closePath();ctx.fill();
}
function net2DrawCactus(ctx,x,y,size){
    ctx.fillRect(x-size*0.15,y-size,size*0.3,size);ctx.fillRect(x-size*0.55,y-size*0.6,size*0.4,size*0.15);ctx.fillRect(x+size*0.15,y-size*0.7,size*0.4,size*0.15);ctx.fillRect(x-size*0.55,y-size*0.6,size*0.15,size*0.32);ctx.fillRect(x+size*0.4,y-size*0.7,size*0.15,size*0.32);
}
function net2DrawRobot(ctx,x,y,size){
    ctx.fillRect(x-size*0.3,y-size*0.82,size*0.6,size*0.38);ctx.fillRect(x-size*0.42,y-size*0.44,size*0.84,size*0.5);ctx.fillRect(x-size*0.75,y-size*0.42,size*0.22,size*0.38);ctx.fillRect(x+size*0.52,y-size*0.42,size*0.22,size*0.38);ctx.fillRect(x-size*0.32,y+size*0.06,size*0.22,size*0.4);ctx.fillRect(x+size*0.1,y+size*0.06,size*0.22,size*0.4);
}
function net2RoundRect(ctx,x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();ctx.fill();
}

// Legacy drawNet2Canvas kept for compatibility (now unused in live player)
function drawNet2Canvas(lines, currentTime, duration) {
    net2DrawAnimFrame(0, currentTime, duration, []);
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
        'www.hazygames.fun': getHazyGamesWebsite,
        'hazygames.fun': getHazyGamesWebsite,
        'www.zappycook.net': getZappyCookWebsite,
        'zappycook.net': getZappyCookWebsite,
        'www.pixelvault.io': getPixelVaultWebsite,
        'pixelvault.io': getPixelVaultWebsite,
        'www.cosmicblog.org': getCosmicBlogWebsite,
        'cosmicblog.org': getCosmicBlogWebsite,
        'www.novaspark.tech': getNovaSparkWebsite,
        'novaspark.tech': getNovaSparkWebsite,
        'www.dailypets.fun': getDailyPetsWebsite,
        'dailypets.fun': getDailyPetsWebsite,
        'www.quizmaster.io': getQuizMasterWebsite,
        'quizmaster.io': getQuizMasterWebsite,
        'www.tinytales.org': getTinyTalesWebsite,
        'tinytales.org': getTinyTalesWebsite,
        'www.buildcraft.tech': getBuildCraftWebsite,
        'buildcraft.tech': getBuildCraftWebsite,
        'www.stargazer.space': getStargazerWebsite,
        'stargazer.space': getStargazerWebsite,
        'www.munchbox.net': getMunchBoxWebsite,
        'munchbox.net': getMunchBoxWebsite,
        'www.codecubs.io': getCodeCubsWebsite,
        'codecubs.io': getCodeCubsWebsite,
        'www.sketchwild.org': getSketchWildWebsite,
        'sketchwild.org': getSketchWildWebsite,
        'www.factblast.fun': getFactBlastWebsite,
        'factblast.fun': getFactBlastWebsite,
        'www.quickpick.app': getQuickPickWebsite,
        'quickpick.app': getQuickPickWebsite,
    };
    const siteKey = Object.keys(websites).find(k => query.toLowerCase().includes(k));

    let content;
    if (siteKey) {
        content = websites[siteKey]();
    } else if (key) {
        content = results[key];
    } else {
        content = `<div class="result-item"><h3>🔍 No results found for "${query}"</h3><p>Try searching: space, dinosaurs, animals, ocean, science, robots, football, or history.</p><p>Or visit a website: <a onclick="browserNavigate('www.zappycook.net')" style="cursor:pointer;color:#4285f4">www.zappycook.net</a> · <a onclick="browserNavigate('www.pixelvault.io')" style="cursor:pointer;color:#4285f4">www.pixelvault.io</a> · <a onclick="browserNavigate('www.cosmicblog.org')" style="cursor:pointer;color:#4285f4">www.cosmicblog.org</a> · <a onclick="browserNavigate('www.novaspark.tech')" style="cursor:pointer;color:#4285f4">www.novaspark.tech</a> · <a onclick="browserNavigate('www.dailypets.fun')" style="cursor:pointer;color:#4285f4">www.dailypets.fun</a> · <a onclick="browserNavigate('www.quizmaster.io')" style="cursor:pointer;color:#4285f4">www.quizmaster.io</a> · <a onclick="browserNavigate('www.tinytales.org')" style="cursor:pointer;color:#4285f4">www.tinytales.org</a> · <a onclick="browserNavigate('www.buildcraft.tech')" style="cursor:pointer;color:#4285f4">www.buildcraft.tech</a> · <a onclick="browserNavigate('www.stargazer.space')" style="cursor:pointer;color:#4285f4">www.stargazer.space</a> · <a onclick="browserNavigate('www.munchbox.net')" style="cursor:pointer;color:#4285f4">www.munchbox.net</a> · <a onclick="browserNavigate('www.codecubs.io')" style="cursor:pointer;color:#4285f4">www.codecubs.io</a> · <a onclick="browserNavigate('www.sketchwild.org')" style="cursor:pointer;color:#4285f4">www.sketchwild.org</a> · <a onclick="browserNavigate('www.factblast.fun')" style="cursor:pointer;color:#4285f4">www.factblast.fun</a></p></div>`;
    }

    resultsDiv.innerHTML = `
        <div class="search-results">
            <h2>Search Results for "${query}"</h2>
            ${content}
        </div>
    `;
    if (siteKey && (siteKey.includes('quickpick'))) { initQuickPick(); }
}

function getHazyGamesWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#6c3483,#1a5276);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🎮 HazyGames.fun</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Free online games — play instantly, no download needed!</p>
            </div>
            <div class="fake-site-body" style="background:#1a1a2e;padding:20px;border-radius:0 0 8px 8px;">
                <h2 style="color:#a29bfe;margin:0 0 14px;">🕹️ Featured Games</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
                    <div onclick="hazyGame('battleship')" style="background:#2d2d5e;border-radius:10px;padding:14px;text-align:center;cursor:pointer;border:2px solid transparent;transition:border 0.2s;" onmouseover="this.style.borderColor='#a29bfe'" onmouseout="this.style.borderColor='transparent'">
                        <div style="font-size:40px;">🚢</div>
                        <p style="color:white;margin:8px 0 2px;font-weight:600;">Battleship</p>
                        <p style="color:#aaa;font-size:11px;">Sink the hidden ship!</p>
                        <span style="background:#27ae60;color:white;font-size:10px;padding:2px 8px;border-radius:20px;">PLAY NOW</span>
                    </div>
                    <div onclick="hazyGame('tictactoe')" style="background:#2d2d5e;border-radius:10px;padding:14px;text-align:center;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='#a29bfe'" onmouseout="this.style.borderColor='transparent'">
                        <div style="font-size:40px;">❌⭕</div>
                        <p style="color:white;margin:8px 0 2px;font-weight:600;">Tic Tac Toe</p>
                        <p style="color:#aaa;font-size:11px;">Play vs the computer!</p>
                        <span style="background:#27ae60;color:white;font-size:10px;padding:2px 8px;border-radius:20px;">PLAY NOW</span>
                    </div>
                    <div onclick="hazyGame('reaction')" style="background:#2d2d5e;border-radius:10px;padding:14px;text-align:center;cursor:pointer;border:2px solid transparent;" onmouseover="this.style.borderColor='#a29bfe'" onmouseout="this.style.borderColor='transparent'">
                        <div style="font-size:40px;">⚡</div>
                        <p style="color:white;margin:8px 0 2px;font-weight:600;">Reaction Time</p>
                        <p style="color:#aaa;font-size:11px;">How fast are you?</p>
                        <span style="background:#27ae60;color:white;font-size:10px;padding:2px 8px;border-radius:20px;">PLAY NOW</span>
                    </div>
                </div>
                <div id="hazy-game-area"></div>
            </div>
        </div>
    `;
}

function hazyGame(name) {
    const area = document.getElementById('hazy-game-area');
    if (!area) return;
    if (name === 'battleship') {
        area.innerHTML = `
            <div style="background:#111827;border-radius:10px;padding:16px;text-align:center;">
                <h3 style="color:#a29bfe;margin:0 0 6px;">🚢 Battleship</h3>
                <p style="color:#aaa;font-size:12px;margin:0 0 4px;">Find and sink the hidden 1×2 ship on the 5×5 grid!</p>
                <p id="bs-status" style="color:#60a5fa;font-size:13px;font-weight:bold;margin:0 0 10px;">Click a cell to fire!</p>
                <div id="bs-board" style="display:inline-grid;grid-template-columns:repeat(5,52px);gap:4px;"></div>
                <p id="bs-shots" style="color:#aaa;font-size:12px;margin:8px 0 0;">Shots: 0</p>
                <br><button onclick="initBattleship()" style="margin-top:10px;background:#1a5276;color:white;border:none;padding:6px 18px;border-radius:20px;cursor:pointer;font-size:13px;">New Game</button>
            </div>
        `;
        initBattleship();
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

function initBattleship() {
    const board = document.getElementById('bs-board');
    const statusEl = document.getElementById('bs-status');
    const shotsEl = document.getElementById('bs-shots');
    if (!board) return;

    // Place 1x2 ship randomly on a 5x5 grid
    const horiz = Math.random() < 0.5;
    const shipR = horiz ? Math.floor(Math.random()*5) : Math.floor(Math.random()*4);
    const shipC = horiz ? Math.floor(Math.random()*4) : Math.floor(Math.random()*5);
    const shipCells = horiz
        ? [{r:shipR,c:shipC},{r:shipR,c:shipC+1}]
        : [{r:shipR,c:shipC},{r:shipR+1,c:shipC}];

    let shots = 0, hits = 0, gameOver = false;
    const grid = Array.from({length:5},()=>Array(5).fill(''));

    board.innerHTML = '';
    for (let r=0; r<5; r++) {
        for (let c=0; c<5; c++) {
            const cell = document.createElement('div');
            cell.style.cssText = 'width:52px;height:52px;background:#1e3a5f;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;border:2px solid #2d5986;transition:background 0.15s;';
            cell.dataset.r = r; cell.dataset.c = c;
            cell.onmouseover = () => { if (!cell.dataset.fired) cell.style.background='#2563ab'; };
            cell.onmouseout  = () => { if (!cell.dataset.fired) cell.style.background='#1e3a5f'; };
            cell.onclick = () => {
                if (gameOver || cell.dataset.fired) return;
                cell.dataset.fired = '1';
                shots++;
                if (shotsEl) shotsEl.textContent = 'Shots: ' + shots;
                const isHit = shipCells.some(s=>s.r===r && s.c===c);
                if (isHit) {
                    hits++;
                    cell.textContent = '💥';
                    cell.style.background = '#7f1d1d';
                    cell.style.cursor = 'default';
                    if (hits === 2) {
                        gameOver = true;
                        if (statusEl) statusEl.textContent = `🎉 You sunk it in ${shots} shot${shots===1?'':'s'}!`;
                        // Reveal ship
                        document.querySelectorAll('#bs-board div').forEach(d=>{
                            const dr=parseInt(d.dataset.r), dc=parseInt(d.dataset.c);
                            if (shipCells.some(s=>s.r===dr&&s.c===dc) && !d.dataset.fired) {
                                d.textContent='🚢'; d.style.background='#166534';
                            }
                        });
                    } else {
                        if (statusEl) statusEl.textContent = '💥 Hit! Keep going!';
                    }
                } else {
                    cell.textContent = '🌊';
                    cell.style.background = '#0c4a6e';
                    cell.style.cursor = 'default';
                    if (statusEl) statusEl.textContent = '🌊 Miss! Try again.';
                }
            };
            board.appendChild(cell);
        }
    }
    if (statusEl) statusEl.textContent = 'Click a cell to fire!';
    if (shotsEl) shotsEl.textContent = 'Shots: 0';
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

function getDailyPetsWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#f9a825,#ef6c00);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🐾 DailyPets.fun</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Cute animals, pet tips & fun facts every day!</p>
            </div>
            <div class="fake-site-body" style="background:#fffdf4;padding:20px;border-radius:0 0 8px 8px;border:1px solid #eee;">
                <h2 style="color:#ef6c00;">Today's Featured Pets 🌟</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:12px;">
                    <div style="background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:48px;">🐶</div>
                        <p style="font-weight:bold;margin:8px 0 2px;">Golden Retriever</p>
                        <p style="font-size:12px;color:#888;">Friendly, loyal, and always happy to see you!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:48px;">🐱</div>
                        <p style="font-weight:bold;margin:8px 0 2px;">Persian Cat</p>
                        <p style="font-size:12px;color:#888;">Calm, fluffy, and loves a cosy nap in the sun.</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:48px;">🐰</div>
                        <p style="font-weight:bold;margin:8px 0 2px;">Holland Lop Rabbit</p>
                        <p style="font-size:12px;color:#888;">Floppy ears and a love of fresh vegetables.</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:48px;">🦜</div>
                        <p style="font-weight:bold;margin:8px 0 2px;">African Grey Parrot</p>
                        <p style="font-size:12px;color:#888;">One of the smartest birds — can learn 1000+ words!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:48px;">🐹</div>
                        <p style="font-weight:bold;margin:8px 0 2px;">Syrian Hamster</p>
                        <p style="font-size:12px;color:#888;">Tiny and nocturnal — loves running on a wheel at night!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:48px;">🐠</div>
                        <p style="font-weight:bold;margin:8px 0 2px;">Clownfish</p>
                        <p style="font-size:12px;color:#888;">Colourful, low-maintenance, and great for beginners.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getQuizMasterWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#00b894,#00cec9);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🧩 QuizMaster.io</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Test your knowledge with fun quizzes!</p>
            </div>
            <div class="fake-site-body" style="background:#f0fdf9;padding:20px;border-radius:0 0 8px 8px;border:1px solid #cce;">
                <h2 style="color:#00b894;">Today's Quick Quiz 🌍</h2>
                <div id="qm-quiz" style="margin-top:12px;"></div>
                <script>
                (function(){
                    var qs=[{q:'What is the capital of Australia?',a:['Sydney','Canberra','Melbourne','Brisbane'],c:1},{q:'How many sides does a hexagon have?',a:['5','6','7','8'],c:1},{q:'Which planet is the largest in our Solar System?',a:['Saturn','Neptune','Jupiter','Uranus'],c:2}];
                    var qi=0,score=0;
                    function show(){
                        var el=document.getElementById('qm-quiz');if(!el)return;
                        if(qi>=qs.length){el.innerHTML='<div style="text-align:center;padding:20px;"><div style="font-size:48px;">🏅</div><h3 style="color:#00b894;">You scored '+score+' / '+qs.length+'!</h3><button onclick="(function(){qi=0;score=0;show();})()" style="background:#00b894;color:white;border:none;padding:8px 24px;border-radius:20px;cursor:pointer;font-size:14px;">Play Again</button></div>';return;}
                        var q=qs[qi];el.innerHTML='<div style="background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);"><p style="font-weight:bold;margin:0 0 12px;font-size:15px;">Q'+(qi+1)+': '+q.q+'</p>'+q.a.map(function(ans,i){return'<button onclick="(function(){if('+i+'==='+q.c+'){score++;}qi++;show();})()" style="display:block;width:100%;margin-bottom:8px;background:#e8fdf5;border:1px solid #00b894;border-radius:8px;padding:10px;cursor:pointer;text-align:left;font-size:14px;">'+ans+'</button>';}).join('')+'</div>';
                    }
                    show();
                })()
                <\/script>
            </div>
        </div>
    `;
}

function getTinyTalesWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#f06292,#ba68c8);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">📖 TinyTales.org</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Short stories for curious young readers</p>
            </div>
            <div class="fake-site-body" style="background:#fff8fd;padding:20px;border-radius:0 0 8px 8px;border:1px solid #f3d5f5;">
                <h2 style="color:#ba68c8;">Stories This Week</h2>
                <div style="display:flex;flex-direction:column;gap:14px;margin-top:12px;">
                    <div style="background:white;border-radius:10px;padding:16px;border-left:4px solid #f06292;box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                        <h3 style="margin:0 0 6px;color:#880e4f;">🌟 The Star That Lost Its Glow</h3>
                        <p style="font-size:13px;color:#555;margin:0 0 6px;">Far above the clouds lived a little star named Pip. One night Pip's light went out — and she had to travel across the whole sky to find it again...</p>
                        <span style="font-size:12px;color:#ba68c8;">📚 Ages 6–9 &nbsp;|&nbsp; ⏱ 3 min read</span>
                    </div>
                    <div style="background:white;border-radius:10px;padding:16px;border-left:4px solid #ba68c8;box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                        <h3 style="margin:0 0 6px;color:#4a148c;">🐢 The Tortoise Who Climbed a Cloud</h3>
                        <p style="font-size:13px;color:#555;margin:0 0 6px;">Everyone said tortoises were too slow to reach the clouds. Herman the tortoise decided to prove them wrong, one tiny step at a time...</p>
                        <span style="font-size:12px;color:#ba68c8;">📚 Ages 5–8 &nbsp;|&nbsp; ⏱ 4 min read</span>
                    </div>
                    <div style="background:white;border-radius:10px;padding:16px;border-left:4px solid #f06292;box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                        <h3 style="margin:0 0 6px;color:#880e4f;">🧁 The Baker Who Baked a Dragon</h3>
                        <p style="font-size:13px;color:#555;margin:0 0 6px;">Marta's enchanted oven could bake anything to life. One Tuesday she accidentally made a very small, very hungry dragon out of gingerbread...</p>
                        <span style="font-size:12px;color:#ba68c8;">📚 Ages 7–10 &nbsp;|&nbsp; ⏱ 5 min read</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getBuildCraftWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#37474f,#546e7a);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🔧 BuildCraft.tech</h1>
                <p style="margin:4px 0 0;opacity:0.9;">DIY projects, how-to guides & maker tutorials</p>
            </div>
            <div class="fake-site-body" style="background:#fafafa;padding:20px;border-radius:0 0 8px 8px;border:1px solid #ddd;">
                <h2 style="color:#37474f;">Popular Projects</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px;">
                    <div style="background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;text-align:center;">💡</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">LED Night Light</h3>
                        <p style="font-size:13px;color:#888;">⭐ Beginner &nbsp;|&nbsp; ⏱ 45 mins</p>
                        <p style="font-size:13px;">Wire up an LED with a resistor and battery pack to make a soft custom night light. No soldering needed!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;text-align:center;">🪁</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Cardboard Kite</h3>
                        <p style="font-size:13px;color:#888;">⭐ Beginner &nbsp;|&nbsp; ⏱ 30 mins</p>
                        <p style="font-size:13px;">Build and fly your own diamond kite using cardboard, string, and a strip of fabric. Perfect for a windy day!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;text-align:center;">🤖</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Mini Robot Arm</h3>
                        <p style="font-size:13px;color:#888;">⭐⭐ Intermediate &nbsp;|&nbsp; ⏱ 2 hrs</p>
                        <p style="font-size:13px;">Use popsicle sticks and a single servo motor to build a simple robotic arm controlled by a micro:bit.</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;text-align:center;">🌱</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Auto Plant Waterer</h3>
                        <p style="font-size:13px;color:#888;">⭐⭐ Intermediate &nbsp;|&nbsp; ⏱ 1.5 hrs</p>
                        <p style="font-size:13px;">Hook up a soil moisture sensor to a small pump so your plant waters itself when the soil gets too dry!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getStargazerWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#0d0d2b,#1a1a4e);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🔭 Stargazer.space</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Your guide to the night sky & astronomy</p>
            </div>
            <div class="fake-site-body" style="background:#0a0a1a;padding:20px;border-radius:0 0 8px 8px;border:1px solid #222;">
                <h2 style="color:#7ec8e3;">Tonight's Sky 🌙</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:12px;">
                    <div style="background:#111133;border-radius:10px;padding:14px;text-align:center;border:1px solid #2a2a5a;">
                        <div style="font-size:40px;">🪐</div>
                        <p style="color:white;font-weight:bold;margin:8px 0 2px;">Saturn</p>
                        <p style="color:#aaa;font-size:12px;">Visible at 9 PM in the south-east. Rings clearly visible with binoculars!</p>
                    </div>
                    <div style="background:#111133;border-radius:10px;padding:14px;text-align:center;border:1px solid #2a2a5a;">
                        <div style="font-size:40px;">☄️</div>
                        <p style="color:white;font-weight:bold;margin:8px 0 2px;">Meteor Shower</p>
                        <p style="color:#aaa;font-size:12px;">Lyrid meteor shower peaks tonight — up to 20 shooting stars per hour!</p>
                    </div>
                    <div style="background:#111133;border-radius:10px;padding:14px;text-align:center;border:1px solid #2a2a5a;">
                        <div style="font-size:40px;">🌕</div>
                        <p style="color:white;font-weight:bold;margin:8px 0 2px;">Full Moon</p>
                        <p style="color:#aaa;font-size:12px;">April's Pink Moon rises at 8:42 PM. Best viewed from dark locations.</p>
                    </div>
                </div>
                <h2 style="color:#7ec8e3;margin-top:20px;">Fun Space Facts ✨</h2>
                <ul style="color:#ccc;font-size:13px;line-height:1.8;padding-left:20px;">
                    <li>Light from the Sun takes 8 minutes to reach Earth.</li>
                    <li>There are more galaxies in the universe than grains of sand on Earth.</li>
                    <li>Neutron stars can spin 700 times per second.</li>
                    <li>The Great Red Spot on Jupiter is a storm that has raged for 350+ years.</li>
                </ul>
            </div>
        </div>
    `;
}

function getMunchBoxWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#e65100,#ff8f00);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🍱 MunchBox.net</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Tasty snack ideas & lunchbox inspiration</p>
            </div>
            <div class="fake-site-body" style="background:#fffaf0;padding:20px;border-radius:0 0 8px 8px;border:1px solid #ffe0b2;">
                <h2 style="color:#e65100;">Today's Lunchbox Ideas 🥗</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px;">
                    <div style="background:white;border-radius:10px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;text-align:center;">🌯</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Rainbow Veggie Wrap</h3>
                        <p style="font-size:13px;color:#888;">⏱ 10 mins | 🌱 Vegetarian</p>
                        <p style="font-size:13px;">Spread hummus on a tortilla, add sliced peppers, cucumber, grated carrot and spinach. Roll it up tight and slice in half!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;text-align:center;">🍱</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Mini Bento Box</h3>
                        <p style="font-size:13px;color:#888;">⏱ 8 mins | 🍽 Serves 1</p>
                        <p style="font-size:13px;">Pack rice balls, cherry tomatoes, cheese cubes, grapes and a small chocolate square. Fun and balanced!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;text-align:center;">🥪</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Dinosaur Sandwich</h3>
                        <p style="font-size:13px;color:#888;">⏱ 5 mins | 🍽 Serves 1</p>
                        <p style="font-size:13px;">Cut a cheese and ham sandwich into dinosaur shapes with cookie cutters. Pack with apple slices and a juice box!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;text-align:center;">🍓</div>
                        <h3 style="margin:8px 0 4px;text-align:center;">Fruit Kebab Snack</h3>
                        <p style="font-size:13px;color:#888;">⏱ 5 mins | 🌱 Vegan</p>
                        <p style="font-size:13px;">Thread strawberries, blueberries, melon chunks and grapes onto skewers. Serve with a small pot of yoghurt for dipping!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCodeCubsWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#1b5e20,#2e7d32);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">💻 CodeCubs.io</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Learn to code — fun lessons for young coders!</p>
            </div>
            <div class="fake-site-body" style="background:#f1f8e9;padding:20px;border-radius:0 0 8px 8px;border:1px solid #c8e6c9;">
                <h2 style="color:#1b5e20;">Beginner Lessons 🐻</h2>
                <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
                    <div style="background:white;border-radius:10px;padding:14px;display:flex;gap:14px;align-items:center;box-shadow:0 1px 6px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;">🐍</div>
                        <div>
                            <h3 style="margin:0 0 4px;color:#1b5e20;">Python for Beginners</h3>
                            <p style="color:#555;font-size:13px;margin:0;">Learn variables, loops and functions through fun mini-projects like number guessing games and simple calculators.</p>
                            <span style="font-size:12px;color:#43a047;">⭐ Beginner &nbsp;|&nbsp; 12 lessons</span>
                        </div>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;display:flex;gap:14px;align-items:center;box-shadow:0 1px 6px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;">🌐</div>
                        <div>
                            <h3 style="margin:0 0 4px;color:#1b5e20;">Build Your First Website</h3>
                            <p style="color:#555;font-size:13px;margin:0;">Use HTML and CSS to create a personal homepage with your favourite colours, fonts and pictures.</p>
                            <span style="font-size:12px;color:#43a047;">⭐ Beginner &nbsp;|&nbsp; 8 lessons</span>
                        </div>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;display:flex;gap:14px;align-items:center;box-shadow:0 1px 6px rgba(0,0,0,0.07);">
                        <div style="font-size:36px;">🎮</div>
                        <div>
                            <h3 style="margin:0 0 4px;color:#1b5e20;">Make a Simple Game</h3>
                            <p style="color:#555;font-size:13px;margin:0;">Code a catch-the-falling-stars game using JavaScript — covers events, animation and score tracking.</p>
                            <span style="font-size:12px;color:#388e3c;">⭐⭐ Intermediate &nbsp;|&nbsp; 10 lessons</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getSketchWildWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#ad1457,#e91e63);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">🎨 SketchWild.org</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Drawing tutorials, art challenges & inspiration</p>
            </div>
            <div class="fake-site-body" style="background:#fff9fb;padding:20px;border-radius:0 0 8px 8px;border:1px solid #f8bbd0;">
                <h2 style="color:#ad1457;">This Week's Challenges 🖌️</h2>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:12px;">
                    <div style="background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:44px;">🐉</div>
                        <p style="font-weight:bold;margin:8px 0 4px;">Draw a Dragon</p>
                        <p style="font-size:12px;color:#888;">Step-by-step guide from basic shapes to a full fire-breathing dragon!</p>
                        <span style="background:#f06292;color:white;font-size:11px;padding:2px 10px;border-radius:20px;">START</span>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:44px;">🌆</div>
                        <p style="font-weight:bold;margin:8px 0 4px;">City at Sunset</p>
                        <p style="font-size:12px;color:#888;">Learn perspective drawing to sketch a glowing city skyline.</p>
                        <span style="background:#f06292;color:white;font-size:11px;padding:2px 10px;border-radius:20px;">START</span>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
                        <div style="font-size:44px;">🌊</div>
                        <p style="font-weight:bold;margin:8px 0 4px;">Ocean Waves</p>
                        <p style="font-size:12px;color:#888;">Master flowing lines and shading to draw crashing waves.</p>
                        <span style="background:#f06292;color:white;font-size:11px;padding:2px 10px;border-radius:20px;">START</span>
                    </div>
                </div>
                <h2 style="color:#ad1457;margin-top:18px;">🏆 Community Picks</h2>
                <div style="display:flex;gap:12px;margin-top:10px;">
                    <div style="background:white;border-radius:10px;padding:12px;flex:1;text-align:center;box-shadow:0 1px 6px rgba(0,0,0,0.06);"><div style="font-size:36px;">🦋</div><p style="font-size:12px;margin:4px 0;">by maya_draws</p><p style="font-size:11px;color:#e91e63;">❤️ 312</p></div>
                    <div style="background:white;border-radius:10px;padding:12px;flex:1;text-align:center;box-shadow:0 1px 6px rgba(0,0,0,0.06);"><div style="font-size:36px;">🌋</div><p style="font-size:12px;margin:4px 0;">by artkid99</p><p style="font-size:11px;color:#e91e63;">❤️ 278</p></div>
                    <div style="background:white;border-radius:10px;padding:12px;flex:1;text-align:center;box-shadow:0 1px 6px rgba(0,0,0,0.06);"><div style="font-size:36px;">🐺</div><p style="font-size:12px;margin:4px 0;">by wildpen</p><p style="font-size:11px;color:#e91e63;">❤️ 441</p></div>
                </div>
            </div>
        </div>
    `;
}

function getFactBlastWebsite() {
    return `
        <div class="fake-website">
            <div class="fake-site-header" style="background:linear-gradient(135deg,#f57f17,#f9a825);padding:20px;border-radius:8px 8px 0 0;color:white;">
                <h1 style="margin:0;font-size:28px;">💥 FactBlast.fun</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Mind-blowing facts delivered daily!</p>
            </div>
            <div class="fake-site-body" style="background:#fffde7;padding:20px;border-radius:0 0 8px 8px;border:1px solid #fff9c4;">
                <h2 style="color:#f57f17;">Today's Fact Blasts 🤯</h2>
                <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
                    <div style="background:white;border-radius:10px;padding:14px;border-left:4px solid #f9a825;box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                        <p style="margin:0;font-size:14px;">🐙 <strong>Octopuses have three hearts</strong> — two pump blood to the gills, and one pumps it to the rest of the body. When they swim, the main heart stops, which is why they prefer to crawl!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;border-left:4px solid #f9a825;box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                        <p style="margin:0;font-size:14px;">🍯 <strong>Honey never expires.</strong> Archaeologists have found 3,000-year-old honey in Egyptian tombs — and it was still perfectly edible!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;border-left:4px solid #f9a825;box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                        <p style="margin:0;font-size:14px;">🌪️ <strong>A day on Venus lasts longer than a year on Venus.</strong> It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;border-left:4px solid #f9a825;box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                        <p style="margin:0;font-size:14px;">🧠 <strong>Your brain uses about 20% of your body's energy</strong> — despite being only 2% of your body weight. Thinking is hard work!</p>
                    </div>
                    <div style="background:white;border-radius:10px;padding:14px;border-left:4px solid #f9a825;box-shadow:0 1px 6px rgba(0,0,0,0.06);">
                        <p style="margin:0;font-size:14px;">🦈 <strong>Sharks are older than trees.</strong> Sharks have existed for around 450 million years, while trees only appeared about 350 million years ago!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getQuickPickWebsite() {
    return `
        <div class="fake-website qp-app">
            <!-- Top Nav -->
            <div class="qp-nav">
                <div class="qp-logo">QuickPick</div>
                <div class="qp-nav-icons">
                    <span class="qp-icon" onclick="qpShowTab('home',this)" title="Home">🏠</span>
                    <span class="qp-icon" onclick="qpShowTab('explore',this)" title="Explore">🔍</span>
                    <span class="qp-icon" onclick="qpShowTab('reels',this)" title="Reels">▶️</span>
                    <span class="qp-icon qp-notif" onclick="qpShowTab('notifs',this)" title="Notifications">🔔<span class="qp-badge">3</span></span>
                    <span class="qp-icon" onclick="qpShowTab('profile',this)" title="Profile">👤</span>
                </div>
            </div>

            <!-- Stories Bar -->
            <div class="qp-stories" id="qp-stories">
                <div class="qp-story qp-story-add" onclick="qpToast('Story uploaded!')">
                    <div class="qp-story-ring qp-story-ring-add">
                        <div class="qp-story-avatar">➕</div>
                    </div>
                    <p>Your Story</p>
                </div>
                <div class="qp-story" onclick="qpViewStory('nova_skies')">
                    <div class="qp-story-ring"><div class="qp-story-avatar" style="background:linear-gradient(135deg,#f8b500,#e84393)">🌅</div></div>
                    <p>nova_skies</p>
                </div>
                <div class="qp-story" onclick="qpViewStory('codewizard')">
                    <div class="qp-story-ring"><div class="qp-story-avatar" style="background:linear-gradient(135deg,#00c6ff,#0072ff)">💻</div></div>
                    <p>codewizard</p>
                </div>
                <div class="qp-story" onclick="qpViewStory('paw_life')">
                    <div class="qp-story-ring"><div class="qp-story-avatar" style="background:linear-gradient(135deg,#fcb045,#fd1d1d)">🐾</div></div>
                    <p>paw_life</p>
                </div>
                <div class="qp-story" onclick="qpViewStory('techbyte')">
                    <div class="qp-story-ring"><div class="qp-story-avatar" style="background:linear-gradient(135deg,#a18cd1,#fbc2eb)">⚡</div></div>
                    <p>techbyte</p>
                </div>
                <div class="qp-story" onclick="qpViewStory('oceanview')">
                    <div class="qp-story-ring"><div class="qp-story-avatar" style="background:linear-gradient(135deg,#43e97b,#38f9d7)">🌊</div></div>
                    <p>oceanview</p>
                </div>
            </div>

            <!-- Main feed area -->
            <div id="qp-main"></div>

            <!-- Story viewer overlay -->
            <div id="qp-story-viewer" class="qp-story-viewer hidden">
                <div class="qp-story-progress"><div class="qp-story-progress-fill" id="qp-story-bar"></div></div>
                <button class="qp-story-close" onclick="qpCloseStory()">✕</button>
                <div class="qp-story-screen" id="qp-story-screen"></div>
            </div>

            <!-- Toast notification -->
            <div id="qp-toast" class="qp-toast hidden"></div>
        </div>
    `;
}

const QP_POSTS = [
    { id:1, user:'nova_skies', avatar:'🌅', avatarBg:'linear-gradient(135deg,#f8b500,#e84393)', emoji:'🌄', bg:'linear-gradient(135deg,#f8b500 0%,#fc5c7d 100%)', caption:'Golden hour hits different 🌅✨ #sunset #nature #vibes', likes:2841, comments:['Amazing shot! 🔥','Stunning colours wow','I wish I was there 😍'], time:'2h' },
    { id:2, user:'codewizard', avatar:'💻', avatarBg:'linear-gradient(135deg,#00c6ff,#0072ff)', emoji:'💻', bg:'linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)', caption:'Late night coding session 🔥 New project dropping soon 👀 #dev #code #tech', likes:1204, comments:['What are you building??','Need more sleep bestie 😂','Followed for more!'], time:'4h' },
    { id:3, user:'paw_life', avatar:'🐾', avatarBg:'linear-gradient(135deg,#fcb045,#fd1d1d)', emoji:'🐶', bg:'linear-gradient(135deg,#fcb045 0%,#fd1d1d 100%)', caption:'Monday mornings made better 🐶❤️ #dogs #weekday #cute #petlover', likes:5673, comments:['Omg the cutest!!','I want to adopt 🥲','Made my day 🐾'], time:'6h' },
    { id:4, user:'techbyte', avatar:'⚡', avatarBg:'linear-gradient(135deg,#a18cd1,#fbc2eb)', emoji:'🚀', bg:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', caption:'Just launched 🚀 QuickPick version 3.0 is live — go check it out! #tech #launch #startup', likes:3320, comments:['Congrats!! 🎉','This is epic ngl','Using this every day'], time:'8h' },
    { id:5, user:'oceanview', avatar:'🌊', avatarBg:'linear-gradient(135deg,#43e97b,#38f9d7)', emoji:'🌊', bg:'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)', caption:'The sea is calling 🌊🐚 Weekend escape ✌️ #ocean #beach #summer #travel', likes:7810, comments:['SO BEAUTIFUL 😭','I need a holiday NOW','The colour of that water 💙'], time:'12h' },
];

const qpLiked = new Set();
const qpSaved = new Set();
let qpStoryTimer = null;

function qpRenderFeed() {
    const main = document.getElementById('qp-main');
    if (!main) return;
    main.innerHTML = QP_POSTS.map(p => `
        <div class="qp-post" id="qp-post-${p.id}">
            <div class="qp-post-header">
                <div class="qp-post-avatar" style="background:${p.avatarBg}">${p.avatar}</div>
                <div class="qp-post-user">
                    <strong>${p.user}</strong>
                    <span class="qp-post-time">${p.time} ago</span>
                </div>
                <span class="qp-post-more" onclick="qpToast('Options coming soon!')">•••</span>
            </div>
            <div class="qp-post-image" style="background:${p.bg}" ondblclick="qpDoubleTapLike(${p.id})">
                <span class="qp-post-emoji">${p.emoji}</span>
                <div class="qp-heart-pop hidden" id="qp-heart-${p.id}">❤️</div>
            </div>
            <div class="qp-post-actions">
                <div class="qp-action-left">
                    <button class="qp-btn" id="qp-like-${p.id}" onclick="qpToggleLike(${p.id},${p.likes})">${qpLiked.has(p.id)?'❤️':'🤍'}</button>
                    <button class="qp-btn" onclick="qpOpenComments(${p.id})">💬</button>
                    <button class="qp-btn" onclick="qpToast('Link copied!')">📤</button>
                </div>
                <button class="qp-btn" id="qp-save-${p.id}" onclick="qpToggleSave(${p.id})">${qpSaved.has(p.id)?'🔖':'🏷️'}</button>
            </div>
            <div class="qp-likes" id="qp-likes-${p.id}"><strong>${(qpLiked.has(p.id)?p.likes+1:p.likes).toLocaleString()} likes</strong></div>
            <div class="qp-caption"><strong>${p.user}</strong> ${p.caption}</div>
            <div class="qp-comments-preview" onclick="qpOpenComments(${p.id})" style="cursor:pointer">
                <span style="color:#8e8e8e;font-size:12px;">View all ${p.comments.length} comments</span>
                <div style="color:#262626;font-size:13px;margin-top:3px"><strong>${p.user}</strong> ${p.comments[0]}</div>
            </div>
            <div id="qp-comment-box-${p.id}" class="qp-comment-box hidden">
                ${p.comments.map(c=>`<div class="qp-comment-item">💬 ${c}</div>`).join('')}
                <div class="qp-add-comment">
                    <input class="qp-comment-input" placeholder="Add a comment…" id="qp-cin-${p.id}" onkeydown="if(event.key==='Enter')qpPostComment(${p.id})">
                    <button class="qp-post-btn" onclick="qpPostComment(${p.id})">Post</button>
                </div>
            </div>
        </div>
    `).join('');
}

function qpRenderExplore() {
    const main = document.getElementById('qp-main');
    if (!main) return;
    const tiles = [
        {e:'🏔️',bg:'linear-gradient(135deg,#74b9ff,#0984e3)',u:'hikerpro'},
        {e:'🎨',bg:'linear-gradient(135deg,#fd79a8,#e84393)',u:'artsy_val'},
        {e:'🍕',bg:'linear-gradient(135deg,#fdcb6e,#e17055)',u:'foodfanatic'},
        {e:'🌺',bg:'linear-gradient(135deg,#55efc4,#00b894)',u:'bloom_co'},
        {e:'🎸',bg:'linear-gradient(135deg,#a29bfe,#6c5ce7)',u:'rockstrings'},
        {e:'🏄',bg:'linear-gradient(135deg,#00cec9,#0984e3)',u:'wavechaser'},
        {e:'📸',bg:'linear-gradient(135deg,#fab1a0,#e17055)',u:'shutter_k'},
        {e:'🌙',bg:'linear-gradient(135deg,#2d3436,#636e72)',u:'night_owl'},
        {e:'🦋',bg:'linear-gradient(135deg,#fd79a8,#fdcb6e)',u:'butterfly_g'},
    ];
    main.innerHTML = `
        <div class="qp-explore-header">
            <input class="qp-explore-search" placeholder="🔍  Search QuickPick…" oninput="qpToast('Search coming soon!')">
        </div>
        <div class="qp-explore-grid">
            ${tiles.map((t,i) => `
                <div class="qp-explore-tile ${i===0||i===3||i===6?'qp-tile-big':''}" style="background:${t.bg}" onclick="qpToast('@${t.u} — tap to view!')">
                    <span class="qp-tile-emoji">${t.e}</span>
                    <div class="qp-tile-user">@${t.u}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function qpRenderReels() {
    const main = document.getElementById('qp-main');
    if (!main) return;
    const reels = [
        {e:'🎵',bg:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',u:'dance_moves',v:'2.1M views',s:'Trending 🔥'},
        {e:'🤸',bg:'linear-gradient(135deg,#11998e,#38ef7d)',u:'flex_daily',v:'890K views',s:'Health & Fitness'},
        {e:'🍳',bg:'linear-gradient(135deg,#f7971e,#ffd200)',u:'chef_marco',v:'1.4M views',s:'Food & Cooking'},
        {e:'🐬',bg:'linear-gradient(135deg,#1a6cf6,#38f9d7)',u:'oceanview',v:'3.2M views',s:'Nature'},
    ];
    main.innerHTML = `
        <div class="qp-reels-grid">
            ${reels.map(r => `
                <div class="qp-reel" style="background:${r.bg}" onclick="qpToast('▶ Playing reel by @${r.u}')">
                    <span class="qp-reel-emoji">${r.e}</span>
                    <div class="qp-reel-info">
                        <div class="qp-reel-tag">${r.s}</div>
                        <div style="font-size:12px;color:rgba(255,255,255,0.9)">@${r.u} · ${r.v}</div>
                    </div>
                    <div class="qp-reel-play">▶</div>
                </div>
            `).join('')}
        </div>
    `;
}

function qpRenderNotifs() {
    const main = document.getElementById('qp-main');
    if (!main) return;
    main.innerHTML = `
        <div class="qp-notifs-list">
            <h3 style="padding:14px 16px;margin:0;font-size:15px;border-bottom:1px solid #efefef;">Notifications</h3>
            ${[
                {a:'🌅',bg:'linear-gradient(135deg,#f8b500,#e84393)',u:'nova_skies',msg:'liked your photo.',t:'2m'},
                {a:'💻',bg:'linear-gradient(135deg,#00c6ff,#0072ff)',u:'codewizard',msg:'started following you.',t:'10m'},
                {a:'🐾',bg:'linear-gradient(135deg,#fcb045,#fd1d1d)',u:'paw_life',msg:'commented: "So cool 🔥"',t:'1h'},
                {a:'⚡',bg:'linear-gradient(135deg,#a18cd1,#fbc2eb)',u:'techbyte',msg:'liked your reel.',t:'3h'},
                {a:'🌊',bg:'linear-gradient(135deg,#43e97b,#38f9d7)',u:'oceanview',msg:'saved your post.',t:'5h'},
            ].map(n => `
                <div class="qp-notif-item" onclick="qpToast('@${n.u} — tap to view profile')">
                    <div class="qp-post-avatar" style="background:${n.bg};flex-shrink:0">${n.a}</div>
                    <div style="flex:1;font-size:13px"><strong>@${n.u}</strong> ${n.msg} <span style="color:#8e8e8e">${n.t} ago</span></div>
                    <div class="qp-notif-thumb" style="background:${n.bg}"></div>
                </div>
            `).join('')}
        </div>
    `;
}

function qpRenderProfile() {
    const main = document.getElementById('qp-main');
    if (!main) return;
    main.innerHTML = `
        <div class="qp-profile">
            <div class="qp-profile-header">
                <div class="qp-profile-pic">📸</div>
                <div class="qp-profile-stats">
                    <div class="qp-stat"><strong>12</strong><span>Posts</span></div>
                    <div class="qp-stat"><strong>1.4K</strong><span>Followers</span></div>
                    <div class="qp-stat"><strong>318</strong><span>Following</span></div>
                </div>
            </div>
            <div class="qp-profile-bio">
                <strong>you</strong><br>
                📍 Somewhere online<br>
                ✨ Living my best life · Photos & Vibes<br>
                <span style="color:#003569">🔗 quickpick.app/you</span>
            </div>
            <div style="display:flex;gap:8px;padding:0 14px 14px;">
                <button class="qp-profile-btn" onclick="qpToast('Profile edited!')">Edit Profile</button>
                <button class="qp-profile-btn" onclick="qpToast('Shared!')">Share Profile</button>
            </div>
            <div class="qp-profile-grid">
                ${['🌅','💻','🌊','🐶','🚀','⚡','🎵','🏔️','🎨','🍕','🌺','🎸'].map((e,i) => `
                    <div class="qp-profile-tile" style="background:linear-gradient(135deg,hsl(${i*30},70%,40%),hsl(${i*30+60},80%,55%))" onclick="qpToast('Post #${i+1}')">
                        <span>${e}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function qpShowTab(tab, el) {
    document.querySelectorAll('.qp-icon').forEach(i => i.classList.remove('qp-icon-active'));
    if (el) el.classList.add('qp-icon-active');
    const stories = document.getElementById('qp-stories');
    if (stories) stories.style.display = tab === 'home' ? 'flex' : 'none';
    if (tab === 'home')    qpRenderFeed();
    if (tab === 'explore') qpRenderExplore();
    if (tab === 'reels')   qpRenderReels();
    if (tab === 'notifs')  qpRenderNotifs();
    if (tab === 'profile') qpRenderProfile();
}

function qpToggleLike(id, baseLikes) {
    const btn = document.getElementById('qp-like-'+id);
    const counter = document.getElementById('qp-likes-'+id);
    if (qpLiked.has(id)) {
        qpLiked.delete(id);
        btn.textContent = '🤍';
        counter.innerHTML = '<strong>' + baseLikes.toLocaleString() + ' likes</strong>';
    } else {
        qpLiked.add(id);
        btn.textContent = '❤️';
        counter.innerHTML = '<strong>' + (baseLikes + 1).toLocaleString() + ' likes</strong>';
    }
}

function qpDoubleTapLike(id) {
    const pop = document.getElementById('qp-heart-'+id);
    if (!pop) return;
    pop.classList.remove('hidden');
    pop.style.animation = 'none';
    void pop.offsetWidth;
    pop.style.animation = 'qpHeartPop 0.7s ease forwards';
    if (!qpLiked.has(id)) {
        const post = QP_POSTS.find(p => p.id === id);
        if (post) qpToggleLike(id, post.likes);
    }
    setTimeout(() => pop.classList.add('hidden'), 750);
}

function qpToggleSave(id) {
    const btn = document.getElementById('qp-save-'+id);
    if (qpSaved.has(id)) { qpSaved.delete(id); btn.textContent = '🏷️'; qpToast('Removed from saved'); }
    else { qpSaved.add(id); btn.textContent = '🔖'; qpToast('Saved to collection'); }
}

function qpOpenComments(id) {
    const box = document.getElementById('qp-comment-box-'+id);
    if (box) box.classList.toggle('hidden');
}

function qpPostComment(id) {
    const inp = document.getElementById('qp-cin-'+id);
    if (!inp || !inp.value.trim()) return;
    const box = document.getElementById('qp-comment-box-'+id);
    const item = document.createElement('div');
    item.className = 'qp-comment-item';
    item.textContent = '💬 ' + inp.value.trim();
    box.insertBefore(item, box.querySelector('.qp-add-comment'));
    inp.value = '';
    qpToast('Comment posted!');
}

function qpViewStory(user) {
    const stories = {
        nova_skies: {bg:'linear-gradient(135deg,#f8b500,#fc5c7d)',emoji:'🌅',text:'Golden hour 🌄✨'},
        codewizard: {bg:'linear-gradient(135deg,#1a1a2e,#0072ff)',emoji:'💻',text:'Still coding at midnight 😅'},
        paw_life:   {bg:'linear-gradient(135deg,#fcb045,#fd1d1d)',emoji:'🐶',text:'Good doggo Friday 🐾'},
        techbyte:   {bg:'linear-gradient(135deg,#a18cd1,#6c5ce7)',emoji:'⚡',text:'New project loading… 🚀'},
        oceanview:  {bg:'linear-gradient(135deg,#43e97b,#38f9d7)',emoji:'🌊',text:'Weekend beach escape 🌴'},
    };
    const s = stories[user] || {bg:'#333',emoji:'📸',text:user};
    const viewer = document.getElementById('qp-story-viewer');
    const screen = document.getElementById('qp-story-screen');
    const bar = document.getElementById('qp-story-bar');
    viewer.classList.remove('hidden');
    screen.innerHTML = `<div style="width:100%;height:100%;background:${s.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;"><span style="font-size:64px">${s.emoji}</span><p style="color:white;font-weight:bold;font-size:16px;margin-top:12px">@${user}</p><p style="color:rgba(255,255,255,0.85);font-size:13px">${s.text}</p></div>`;
    bar.style.transition = 'none'; bar.style.width = '0%';
    setTimeout(() => { bar.style.transition = 'width 4s linear'; bar.style.width = '100%'; }, 30);
    if (qpStoryTimer) clearTimeout(qpStoryTimer);
    qpStoryTimer = setTimeout(qpCloseStory, 4100);
}

function qpCloseStory() {
    const viewer = document.getElementById('qp-story-viewer');
    if (viewer) viewer.classList.add('hidden');
    if (qpStoryTimer) { clearTimeout(qpStoryTimer); qpStoryTimer = null; }
}

function qpToast(msg) {
    const t = document.getElementById('qp-toast');
    if (!t) return;
    t.textContent = msg; t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 2200);
}

// Init Quick Pick feed on first load
function initQuickPick() { qpRenderFeed(); }

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
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.hazygames.fun')">🎮 HazyGames.fun</div>
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
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.dailypets.fun')">🐾 DailyPets.fun</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.quizmaster.io')">🧩 QuizMaster.io</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.tinytales.org')">📖 TinyTales.org</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.buildcraft.tech')">🔧 BuildCraft.tech</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.stargazer.space')">🔭 Stargazer.space</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.munchbox.net')">🍱 MunchBox.net</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.codecubs.io')">💻 CodeCubs.io</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.sketchwild.org')">🎨 SketchWild.org</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.factblast.fun')">💥 FactBlast.fun</div>
                <div class="shortcut website-shortcut" onclick="browserNavigate('www.quickpick.app')">📸 QuickPick.app</div>
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

// ===== SIMPLE AI =====
function initSimpleAI() {
    const input = document.getElementById('ai-input');
    if (input) input.focus();
}

const AI_KNOWLEDGE = [
    // HazyGames
    { keys: ['hazygames','hazy games','hazy game','games on hazygames'], answer: '🎮 <b>HazyGames.fun</b> is a free online games site! It has three games you can play right now:<br>• 🚢 <b>Battleship</b> — find and sink the hidden 1×2 ship on a 5×5 grid<br>• ❌⭕ <b>Tic Tac Toe</b> — play against the AI, it tries to block and win<br>• ⚡ <b>Reaction Time</b> — click the green box as fast as you can and see your milliseconds!' },
    { keys: ['battleship','battle ship'], answer: '🚢 <b>Battleship</b> on HazyGames.fun: There\'s a hidden 1×2 ship somewhere on the 5×5 blue grid. Click cells to fire — 💥 means a hit, 🌊 means a miss. Sink both cells to win! Hit "New Game" to play again.' },
    { keys: ['tic tac toe','tictactoe','noughts and crosses'], answer: '❌⭕ <b>Tic Tac Toe</b> on HazyGames.fun: You play as X against the computer (O). The AI tries to win and will block your winning moves. First to get three in a row wins! Hit "New Game" to reset.' },
    { keys: ['reaction time','reaction'], answer: '⚡ <b>Reaction Time</b> on HazyGames.fun: Click "Start", wait for the box to turn <b>green</b>, then click as fast as you can. Under 200ms is incredible, under 300ms is great! Don\'t click too early or it resets.' },
    // ZappyCook
    { keys: ['zappycook','zappy cook'], answer: '🍳 <b>ZappyCook.net</b> is a recipe website with quick and delicious meals! Featured recipes include:<br>• 🍕 Cheesy Pizza Pockets (20 mins)<br>• 🥞 Fluffy Banana Pancakes (15 mins)<br>• 🍜 Speedy Noodle Soup (10 mins)<br>• 🍫 Mug Chocolate Cake (5 mins in a microwave!)' },
    { keys: ['recipe','recipes','cooking','how to cook','how do i cook','cook','bake','baking'], answer: '🍳 Need cooking help? On <b>ZappyCook.net</b> you\'ll find quick recipes! Some tips:<br>• Always wash your hands before cooking 🧼<br>• Read the whole recipe before you start<br>• Ask a grown-up before using the oven or hob<br>• Measuring ingredients carefully makes better food!' },
    { keys: ['pizza','pizza pockets'], answer: '🍕 <b>Cheesy Pizza Pockets</b> (ZappyCook.net): Wrap pizza dough around mozzarella, tomato sauce and pepperoni. Bake at 200°C for 15 mins until golden! Serves 4, takes 20 minutes.' },
    { keys: ['pancake','pancakes','banana pancake'], answer: '🥞 <b>Fluffy Banana Pancakes</b> (ZappyCook.net): Mash 1 banana, mix with 1 egg and 3 tbsp flour. Fry in a pan for 2 minutes each side. Top with honey! Serves 2, takes 15 minutes.' },
    { keys: ['chocolate cake','mug cake','microwave cake'], answer: '🍫 <b>Mug Chocolate Cake</b> (ZappyCook.net): Mix cocoa, flour, sugar, egg and milk in a mug. Microwave for 90 seconds. Enjoy warm! Only 5 minutes and serves 1.' },
    { keys: ['noodle','soup','noodle soup'], answer: '🍜 <b>Speedy Noodle Soup</b> (ZappyCook.net): Boil noodles, add veggie broth, soy sauce, a soft-boiled egg and spring onions. Done in 10 minutes!' },
    // PixelVault
    { keys: ['pixelvault','pixel vault','pixel art','digital art','art gallery'], answer: '🖼️ <b>PixelVault.io</b> is a pixel art gallery where artists share their digital artwork. Featured pieces include Pixel Sunset by artlover99, Castle Night by pixelwiz, Ocean Depths by deepblue, and Space Launch by starmaker.' },
    { keys: ['how to make pixel art','how do i make pixel art'], answer: '🖼️ To make pixel art: use a grid-based drawing tool and fill squares with colour — like a mosaic! Keep it small (16×16 or 32×32 pixels) when starting out. You can share your art on <b>PixelVault.io</b>!' },
    // CosmicBlog
    { keys: ['cosmicblog','cosmic blog','blog'], answer: '🌌 <b>CosmicBlog.org</b> is a space and science blog with posts about the universe, galaxies, black holes, and more.' },
    // NovaSpark
    { keys: ['novaspark','nova spark'], answer: '⚡ <b>NovaSpark.tech</b> is a technology website covering the latest in innovation, gadgets, and science breakthroughs.' },
    // Space
    { keys: ['space','universe','stars','planets','solar system','nasa'], answer: '🚀 <b>Space</b> is an almost perfect vacuum! Fun facts:<br>• The Sun makes up 99.86% of our Solar System\'s mass<br>• A day on Venus is longer than a year on Venus<br>• There are more stars in the universe than grains of sand on Earth<br>• Footprints on the Moon will last 100 million years!' },
    { keys: ['sun','the sun','solar'], answer: '☀️ <b>The Sun</b> is a huge ball of gas 93 million miles from Earth! It\'s so big that 1.3 million Earths could fit inside it. It\'s about 4.6 billion years old and will keep shining for another 5 billion years. Its surface is about 5,500°C!' },
    { keys: ['moon','the moon','lunar'], answer: '🌕 <b>The Moon</b> is Earth\'s only natural satellite, about 238,855 miles away. It takes 27 days to orbit Earth. The Moon\'s gravity causes our ocean tides. The first humans landed on the Moon on July 20, 1969 — Neil Armstrong and Buzz Aldrin!' },
    { keys: ['mars','red planet'], answer: '🔴 <b>Mars</b> is the 4th planet from the Sun and is known as the Red Planet because of iron oxide (rust) on its surface. It has the tallest volcano in the solar system — Olympus Mons, 3 times taller than Everest! NASA\'s rovers Curiosity and Perseverance are exploring it right now.' },
    { keys: ['black hole','black holes'], answer: '🌑 <b>Black holes</b> are regions of space where gravity is so strong that nothing — not even light — can escape! They form when massive stars collapse. The one at the centre of our galaxy (Sagittarius A*) is 4 million times the mass of our Sun.' },
    { keys: ['galaxy','galaxies','milky way'], answer: '🌌 <b>The Milky Way</b> is our home galaxy — it contains 200–400 billion stars and is about 100,000 light-years across. There are an estimated 2 trillion galaxies in the observable universe!' },
    // Dinosaurs
    { keys: ['dinosaur','dinosaurs','dino','t-rex','triceratops'], answer: '🦕 <b>Dinosaurs</b> ruled Earth for over 165 million years! Cool dinos:<br>• 🦖 T-Rex — 40 feet long, king of the dinosaurs<br>• Triceratops — 3 horns and a giant frill<br>• Velociraptor — fast and intelligent hunter<br>• Brachiosaurus — giraffe-like neck, 85 feet tall!' },
    { keys: ['why did dinosaurs go extinct','dinosaur extinction','asteroid'], answer: '☄️ Dinosaurs went extinct about 66 million years ago! Most scientists believe a huge <b>asteroid</b> about 6 miles wide crashed into Earth near Mexico. It caused massive fires, ash clouds that blocked the sun, and freezing temperatures. Only small animals (including early birds) survived.' },
    // Animals
    { keys: ['animal','animals','cheetah','whale','elephant'], answer: '🐘 Earth has over 8.7 million animal species! Record holders:<br>• Cheetah — fastest land animal at 70 mph<br>• Blue Whale — largest animal ever at 100 feet long<br>• Peregrine Falcon — fastest bird at 240 mph diving<br>• Elephant — largest land animal with an incredible memory' },
    { keys: ['dog','dogs','puppy','puppies'], answer: '🐶 <b>Dogs</b> were the first animals domesticated by humans — about 15,000 years ago! There are over 340 different dog breeds. Dogs can smell 10,000–100,000 times better than humans. The oldest dog ever lived to 29 years old. Dogs dream just like humans do!' },
    { keys: ['cat','cats','kitten','kittens'], answer: '🐱 <b>Cats</b> have been kept as pets for about 10,000 years! They can make over 100 different sounds. A cat\'s purr vibrates at 25–150 Hz which can actually help heal bones. Cats sleep 12–16 hours a day. A group of cats is called a clowder!' },
    { keys: ['shark','sharks'], answer: '🦈 <b>Sharks</b> have been swimming in Earth\'s oceans for over 450 million years — longer than trees have existed! The Great White can grow to 20 feet. Sharks don\'t have bones — their skeleton is made of cartilage. Most sharks must keep swimming to breathe.' },
    { keys: ['penguin','penguins'], answer: '🐧 <b>Penguins</b> are flightless birds that live mostly in the Southern Hemisphere. Emperor Penguins are the tallest at 4 feet high. They can swim at 25 mph and hold their breath for 20 minutes. Male Emperor Penguins keep eggs warm on their feet through the Antarctic winter!' },
    { keys: ['lion','lions','tiger','tigers','big cat','big cats'], answer: '🦁 <b>Big cats</b> are amazing! Lions are the only truly social big cats and live in groups called prides. Tigers are the largest wild cats — Siberian tigers can weigh 660 lbs. Cheetahs are the fastest at 70 mph but can only sprint for 30 seconds. Snow leopards can jump 50 feet!' },
    // Ocean
    { keys: ['ocean','sea','marine'], answer: '🌊 Oceans cover 70% of Earth! Amazing facts:<br>• Over 80% of the ocean is still unexplored<br>• The ocean holds 94% of all life on Earth<br>• Coral reefs support 25% of all marine species<br>• The Mariana Trench is nearly 36,000 feet deep!' },
    { keys: ['coral reef','reef','coral'], answer: '🪸 <b>Coral reefs</b> are often called the rainforests of the sea — they cover less than 1% of the ocean floor but support 25% of all marine life! Coral is actually a living animal. The Great Barrier Reef in Australia is the world\'s largest coral reef, visible from space.' },
    { keys: ['dolphin','dolphins'], answer: '🐬 <b>Dolphins</b> are incredibly intelligent! They have names for each other — unique whistles they recognise. They sleep with one eye open. Dolphins can swim at 37 mph. They\'re one of the few animals that play for fun. A group of dolphins is called a pod.' },
    // Science
    { keys: ['science','biology','chemistry','physics','astronomy'], answer: '🔬 <b>Science</b> covers everything from atoms to galaxies!<br>• Biology — study of living organisms<br>• Chemistry — study of matter and reactions<br>• Physics — study of energy and forces<br>• Astronomy — study of stars and planets' },
    { keys: ['atom','atoms','element','elements','periodic table'], answer: '⚛️ <b>Atoms</b> are the building blocks of everything! An atom has a nucleus (protons and neutrons) with electrons orbiting around it. They\'re incredibly tiny — a single hair is about 1 million atoms wide. There are 118 known elements on the periodic table, from Hydrogen to Oganesson.' },
    { keys: ['gravity','gravitation','weight'], answer: '🍎 <b>Gravity</b> is the force that pulls objects toward each other. Isaac Newton discovered it when he saw an apple fall from a tree in 1666. On the Moon, you\'d weigh 6 times less than on Earth. Black holes have the strongest gravity in the universe. Without gravity, we\'d float off into space!' },
    { keys: ['electricity','electric','lightning','thunder'], answer: '⚡ <b>Electricity</b> is the flow of electrons through a material. Benjamin Franklin proved lightning is electricity with his famous kite experiment in 1752. Lightning can reach 30,000°C — 5 times hotter than the Sun\'s surface! The human body also uses electricity to send signals through nerves.' },
    { keys: ['volcano','volcanoes','eruption'], answer: '🌋 <b>Volcanoes</b> are openings in Earth\'s crust where molten rock (magma) erupts. There are about 1,500 active volcanoes on Earth. The largest volcano in the solar system is Olympus Mons on Mars — 3 times taller than Everest! Hawaii\'s islands were formed by volcanic activity.' },
    { keys: ['earthquake','earthquakes','seismic'], answer: '🌍 <b>Earthquakes</b> happen when tectonic plates shift. About 500,000 earthquakes occur every year but most are too small to feel. They\'re measured on the Richter scale. The 1960 Valdivia earthquake in Chile was the most powerful ever recorded at magnitude 9.5. Japan has about 1,500 earthquakes per year.' },
    { keys: ['water','h2o','liquid'], answer: '💧 <b>Water</b> is the only natural substance that exists as solid, liquid and gas on Earth. It covers 71% of Earth\'s surface but only 3% is fresh water. A person can survive 3 weeks without food but only 3 days without water. Water expands when it freezes — that\'s why ice floats!' },
    { keys: ['cloud','clouds','rain','weather','rainbow'], answer: '🌈 <b>Weather</b> is driven by the water cycle! Clouds form when water evaporates and cools. A fluffy cumulus cloud can weigh 500,000 kg. Rainbows form when sunlight refracts through water droplets — you need the Sun behind you to see one. No two snowflakes are identical!' },
    // Robots / AI
    { keys: ['robot','robots','ai','artificial intelligence'], answer: '🤖 <b>Robots & AI</b> are amazing! Did you know:<br>• The word "robot" comes from Czech meaning "forced labour"<br>• There are over 3 million industrial robots in use today<br>• NASA\'s Mars rovers are robots exploring another planet<br>• AI can beat humans at chess, Go, and video games!' },
    { keys: ['computer','computers','how does a computer work'], answer: '💻 <b>Computers</b> work using binary code — just 1s and 0s! A modern CPU can perform billions of calculations per second. The first computer (ENIAC, 1945) weighed 30 tonnes and filled a room. Today your phone is millions of times more powerful. Computers use RAM for short-term memory and storage for long-term.' },
    { keys: ['internet','web','world wide web','website'], answer: '🌐 The <b>Internet</b> is a global network of billions of connected computers. Tim Berners-Lee invented the World Wide Web in 1989. There are over 5 billion internet users in the world today. About 328 million terabytes of data are used every day. The first website is still online at info.cern.ch!' },
    // Football
    { keys: ['football','soccer','messi','ronaldo','fifa'], answer: '⚽ <b>Football</b> is the world\'s most popular sport with 4 billion fans!<br>• FIFA World Cup is watched by 3.5 billion people<br>• The sport dates back 2,000 years to ancient China<br>• Lionel Messi and Cristiano Ronaldo are the greatest of all time<br>• A match is 90 minutes — two 45-minute halves' },
    { keys: ['basketball','nba','lebron'], answer: '🏀 <b>Basketball</b> was invented by Dr James Naismith in 1891 using a peach basket! The NBA has 30 teams. A basketball court is 94 feet long. LeBron James is one of the greatest players ever. The highest score in an NBA game was 186 points (Detroit vs Denver, 1983).' },
    { keys: ['tennis','wimbledon','serve'], answer: '🎾 <b>Tennis</b> originated in France in the 12th century! Wimbledon is the oldest tennis tournament, first held in 1877. The fastest tennis serve ever was 263.4 km/h by Sam Groth in 2012. A standard tennis court is 78 feet long. Roger Federer, Rafael Nadal and Novak Djokovic have dominated modern tennis.' },
    { keys: ['minecraft','gaming','video game','video games'], answer: '🎮 <b>Video games</b> are played by over 3 billion people worldwide! Minecraft is the best-selling game ever with over 238 million copies sold. The first video game was Pong (1972). Professional gamers (esports players) can earn millions. Games help improve problem-solving, coordination and creativity!' },
    { keys: ['olympic','olympics'], answer: '🏅 The <b>Olympics</b> began in ancient Greece in 776 BC! The modern Olympics restarted in Athens in 1896. Summer and Winter Olympics alternate every 2 years. The Olympics motto is "Faster, Higher, Stronger — Together". The most decorated Olympian ever is swimmer Michael Phelps with 23 gold medals.' },
    // History
    { keys: ['history','past','ancient'], answer: '📜 <b>World History</b> spans 300,000 years!<br>• Ancient Egypt built the pyramids around 2560 BC<br>• The Roman Empire lasted over 1,000 years<br>• The Moon landing happened on July 20, 1969<br>• The Internet was invented in the 1980s' },
    { keys: ['egypt','egyptian','pyramid','pharaoh'], answer: '🏛️ <b>Ancient Egypt</b> is one of history\'s greatest civilisations! The Great Pyramid of Giza was the tallest man-made structure for 3,800 years. Egyptians invented paper (papyrus), ink, the calendar, and toothpaste! Cleopatra was the last active ruler of the Ptolemaic Kingdom of Egypt.' },
    { keys: ['rome','roman','roman empire','julius caesar'], answer: '🏛️ The <b>Roman Empire</b> lasted from 27 BC to 476 AD — over 500 years! At its peak, it covered most of Europe, North Africa and the Middle East. Romans built roads, aqueducts and the Colosseum. Latin, the Roman language, is the root of Spanish, French, Italian and Portuguese.' },
    { keys: ['world war','ww2','ww1','world war 2','second world war'], answer: '⚔️ <b>World War 2</b> (1939–1945) was the deadliest war in history, involving over 30 countries. It ended with the Allied victory and the establishment of the United Nations. <b>World War 1</b> (1914–1918) was known as "The Great War" and introduced new weapons like tanks and aircraft.' },
    { keys: ['viking','vikings','norse'], answer: '⚔️ <b>Vikings</b> were Norse seafarers from Scandinavia (Norway, Sweden, Denmark) who lived from 793–1066 AD. They were expert shipbuilders and explorers — reaching North America 500 years before Columbus! Viking longships could travel in shallow rivers and open seas. They also settled Iceland and Greenland.' },
    // Music
    { keys: ['music','song','songs','singing','instrument'], answer: '🎵 <b>Music</b> is one of the oldest human activities — drums were used 30,000 years ago! The violin has 4 strings and over 70 parts. Beethoven composed some of his greatest music while completely deaf. Music can reduce stress, improve memory and even help plants grow faster!' },
    { keys: ['guitar','guitars'], answer: '🎸 The <b>guitar</b> is the most popular instrument in the world with over 50 million players! It evolved from ancient lutes. Classical guitars have nylon strings; electric guitars use steel strings and magnetic pickups. Jimi Hendrix, Kurt Cobain and Eddie Van Halen are guitar legends.' },
    { keys: ['piano','keyboard'], answer: '🎹 The <b>piano</b> was invented in 1700 by Bartolomeo Cristofori in Italy. It has 88 keys — 52 white and 36 black. The strings inside are hit by small felt hammers. Mozart could play the piano at age 3! Beethoven, Chopin and Elton John are iconic pianists.' },
    // Nature
    { keys: ['tree','trees','forest','rainforest'], answer: '🌳 <b>Trees</b> are incredible! The Amazon rainforest produces 20% of Earth\'s oxygen and is home to 10% of all species. The oldest living tree (Methuselah) is nearly 5,000 years old. A single tree can absorb 48 lbs of CO₂ per year. There are about 3 trillion trees on Earth.' },
    { keys: ['flower','flowers','plant','plants'], answer: '🌸 <b>Plants</b> produce oxygen through photosynthesis — they turn sunlight, water and CO₂ into sugar and oxygen. The largest flower in the world is the Rafflesia, which can be 3 feet wide and smells like rotting meat! The fastest-growing plant is bamboo — it can grow 35 inches in a single day.' },
    { keys: ['insect','insects','bee','bees','butterfly'], answer: '🦋 <b>Insects</b> are the most successful animals on Earth — there are 10 quintillion of them! Bees do a "waggle dance" to tell other bees where flowers are. Butterflies taste with their feet! Ants can carry 50 times their own body weight. Without bees pollinating plants, most of our food wouldn\'t grow.' },
    // Countries / Geography
    { keys: ['country','countries','world','continent','continents'], answer: '🌍 There are <b>195 countries</b> in the world and 7 continents! The largest country is Russia (11% of Earth\'s land). The smallest is Vatican City at 0.17 square miles. Asia is the biggest continent with 4.7 billion people. Antarctica is the coldest and least populated continent.' },
    { keys: ['uk','united kingdom','england','britain','london'], answer: '🇬🇧 The <b>United Kingdom</b> is made up of England, Scotland, Wales and Northern Ireland. London is the capital with 9 million people. Big Ben, Buckingham Palace and Tower Bridge are famous landmarks. The UK invented the World Wide Web, the telephone, and the steam engine!' },
    { keys: ['usa','united states','america','washington'], answer: '🇺🇸 The <b>United States of America</b> has 50 states and was founded in 1776. Washington D.C. is the capital. The Statue of Liberty was a gift from France in 1886. The USA is the world\'s largest economy. It covers 3.8 million square miles — about 40 times the size of the UK!' },
    { keys: ['australia','aussie','sydney','kangaroo'], answer: '🇦🇺 <b>Australia</b> is a country and a continent! It\'s the 6th largest country in the world. Sydney is the largest city, Canberra is the capital. Australia has unique animals — kangaroos, koalas, platypuses and wombats. The Great Barrier Reef is off its northeast coast. It has more sheep than people!' },
    { keys: ['japan','japanese','tokyo'], answer: '🇯🇵 <b>Japan</b> is an island nation in East Asia with 125 million people. Tokyo is the world\'s most populated city with 37 million people! Japan is known for its technology, anime, sushi and cherry blossoms. Mount Fuji is Japan\'s highest mountain. Japan has the world\'s most Michelin-starred restaurants.' },
    // Maths
    { keys: ['maths','math','mathematics','number','numbers'], answer: '🔢 <b>Maths</b> is the language of the universe! Fun number facts:<br>• Zero was invented in India around 500 AD<br>• Pi (π) goes on forever without repeating<br>• There are more possible games of chess than atoms in the observable universe<br>• A "googol" is 1 followed by 100 zeros!' },
    { keys: ['pi','3.14','circle circumference'], answer: '🥧 <b>Pi (π)</b> is the ratio of a circle\'s circumference to its diameter — approximately 3.14159... It goes on forever and never repeats! Pi has been calculated to over 100 trillion decimal places. Pi Day is celebrated on March 14 (3/14). Ancient Babylonians approximated π as 3.125 over 4,000 years ago.' },
    // Health / Body
    { keys: ['body','human body','organs','health'], answer: '🫀 The <b>human body</b> is incredible! Your heart beats about 100,000 times a day. You have 206 bones. The small intestine is about 6 metres long! Your brain uses 20% of your body\'s energy. You have about 37 trillion cells. Bones are 5 times stronger than steel by weight.' },
    { keys: ['brain','the brain','nervous system'], answer: '🧠 The <b>brain</b> is the most complex organ in the universe! It has about 86 billion neurons. It processes 70,000 thoughts per day and generates about 23 watts of electricity. The brain is 73% water. You use all parts of your brain every day — the "we only use 10%" myth is false!' },
    { keys: ['eye','eyes','sight','vision'], answer: '👁️ Human <b>eyes</b> can distinguish about 10 million colours! The eye can process 36,000 pieces of information per hour. Your eyes focus by changing the shape of the lens. The cornea is the only part of the body with no blood supply — it gets oxygen directly from the air. Eagles can see 4–5 times farther than humans.' },
    { keys: ['sleep','sleeping','dream','dreams'], answer: '💤 <b>Sleep</b> is essential for health! Adults need 7–9 hours; kids need 9–12 hours. Your brain is very active during sleep — it processes memories and repairs itself. You spend about 2 hours dreaming every night. The record for staying awake is 11 days (but that\'s very dangerous!). Dolphins sleep with one half of their brain at a time.' },
    // Simple PC apps
    { keys: ['simple pc','this computer','this app','this program'], answer: '💻 <b>Simple PC</b> is your virtual computer! You can open apps from the desktop or the Start menu. Available apps include: Web Browser, Notes, Calculator, 2048, Memory Game, Music Player, Books, Throaball, Calendar, Net2, and Simple AI (that\'s me!)' },
    { keys: ['notes','notepad'], answer: '📝 The <b>Notes</b> app on Simple PC lets you write and save text notes. Click the Notes icon on the desktop or find it in the Start menu to open it!' },
    { keys: ['calculator'], answer: '🧮 The <b>Calculator</b> app can do basic maths — addition, subtraction, multiplication and division. Find it on the desktop or Start menu!' },
    { keys: ['2048'], answer: '🔢 <b>2048</b> is a sliding tile puzzle game! You combine matching numbers by swiping tiles. The goal is to reach the 2048 tile. Use arrow keys to play. Can you get to 4096?!' },
    { keys: ['memory game','memory match'], answer: '🃏 The <b>Memory Game</b> has a grid of face-down cards. Flip two at a time — if they match, they stay face-up. Try to match all pairs in as few moves as possible! Find it on the Start menu.' },
    { keys: ['music','music player','songs'], answer: '🎵 The <b>Music Player</b> app on Simple PC has a collection of songs you can listen to. Find it in the Start menu and hit play!' },
    { keys: ['net2','streaming','show','shows','watch'], answer: '🎬 <b>Net2</b> is Simple PC\'s streaming app — like a mini Netflix! It shows ASCII art animations of TV shows. Find it on the desktop.' },
    { keys: ['throaball','football game'], answer: '⚽ <b>Throaball</b> is a football throwing game on Simple PC! Press SPACEBAR to charge and throw the ball at the targets. Hit the targets for points and beat your high score!' },
    { keys: ['calendar'], answer: '📅 The <b>Calendar</b> app shows the current date and lets you browse months. Find it on the desktop!' },
    // Fun / Random
    { keys: ['joke','tell me a joke','funny'], answer: '😄 Here\'s a joke: Why don\'t scientists trust atoms?<br><br>Because they make up everything! 😂' },
    { keys: ['joke2','another joke','tell another','more jokes'], answer: '🤣 Here\'s another one: What do you call a fish without eyes?<br><br>A <b>fsh!</b> 🐟😂' },
    { keys: ['riddle','give me a riddle'], answer: '🤔 Here\'s a riddle: I have cities but no houses, forests but no trees, rivers but no water. What am I?<br><br><details><summary>See answer 👀</summary>A <b>map!</b> 🗺️</details>' },
    { keys: ['favourite colour','favorite color','what colour'], answer: '🎨 I\'m an AI so I don\'t see colours — but if I could pick, I\'d choose <b>deep space purple</b> 🟣! What\'s your favourite colour?' },
    { keys: ['how old are you','your age'], answer: '🤖 I\'m Simple AI — I was created in 2026, so I\'m brand new! I don\'t age like humans do though. I just keep learning.' },
    { keys: ['can you help me','help','what can i ask'], answer: '🤖 Of course! You can ask me about:<br>• 🎮 <b>Apps on Simple PC</b> (games, browser, notes, etc.)<br>• 🌐 <b>Websites</b> (HazyGames, ZappyCook, PixelVault, CosmicBlog, NovaSpark)<br>• 🚀 <b>Space</b>, 🦕 <b>Dinosaurs</b>, 🐘 <b>Animals</b>, 🌊 <b>Ocean</b><br>• 🔬 <b>Science</b>, ⚙️ <b>Technology</b>, 📜 <b>History</b><br>• ⚽ <b>Sports</b>, 🎵 <b>Music</b>, 🍳 <b>Cooking</b>, 🌍 <b>Countries</b><br>• 🔢 <b>Maths</b>, 🫀 <b>Human body</b>, 😄 <b>Jokes</b> and more!' },
    // Greetings
    { keys: ['hello','hi','hey','hiya','howdy','good morning','good afternoon','good evening'], answer: '👋 Hello! I\'m Simple AI. Ask me about the apps on Simple PC, the websites in the browser, space, animals, history, science, sports, cooking, maths and loads more!' },
    { keys: ['who are you','what are you','what can you do','tell me about yourself'], answer: '🤖 I\'m <b>Simple AI</b>, your built-in assistant on Simple PC! I can answer questions about everything on this computer — websites, games, science, animals, space, history, sports, music, cooking, countries, maths and more. Just ask anything!' },
    { keys: ['thanks','thank you','cheers','ty','thx'], answer: '😊 You\'re welcome! Ask me anything else anytime.' },
    { keys: ['bye','goodbye','see you','cya'], answer: '👋 Goodbye! Come back anytime you have a question!' },
    { keys: ['good','great','awesome','cool','nice','amazing'], answer: '😄 Glad you think so! Is there anything else you\'d like to know?' },
    // More countries
    { keys: ['france','french','paris','eiffel'], answer: '🇫🇷 <b>France</b> is in Western Europe with a population of 68 million. Paris is the capital and most visited city in the world — over 100 million tourists per year! France is famous for the Eiffel Tower, croissants, baguettes, and the Louvre museum. French is spoken by 300 million people worldwide.' },
    { keys: ['china','chinese','beijing','shanghai'], answer: '🇨🇳 <b>China</b> is the world\'s most populous country with 1.4 billion people. Beijing is the capital; Shanghai is the largest city. China built the Great Wall — over 13,000 miles long! It invented paper, printing, gunpowder and the compass. China has the world\'s second-largest economy.' },
    { keys: ['brazil','brazilian','rio','amazon'], answer: '🇧🇷 <b>Brazil</b> is the largest country in South America and the fifth largest in the world! Brasília is the capital, but Rio de Janeiro and São Paulo are the most famous cities. Brazil is home to the Amazon rainforest — the world\'s largest. They\'ve won the FIFA World Cup 5 times — more than any other country!' },
    { keys: ['india','indian','delhi','mumbai','hinduism'], answer: '🇮🇳 <b>India</b> has a population of over 1.4 billion — the most of any country in the world! New Delhi is the capital. India is the birthplace of chess, yoga, and the number zero concept. It has 22 official languages! The Taj Mahal in Agra is one of the Seven Wonders of the World.' },
    { keys: ['canada','canadian','toronto','ottawa'], answer: '🇨🇦 <b>Canada</b> is the second largest country in the world! Ottawa is the capital, but Toronto is the largest city. Canada has the longest coastline in the world — over 200,000 km. It\'s home to 10% of the world\'s forests. Canada invented basketball, the telephone (Alexander Graham Bell lived there), and hockey is its national sport!' },
    { keys: ['germany','german','berlin'], answer: '🇩🇪 <b>Germany</b> is in central Europe with 84 million people. Berlin is the capital and largest city. Germany is famous for the Berlin Wall, Oktoberfest, and inventing the car (Karl Benz, 1885) and the printing press (Johannes Gutenberg, 1440). Germany has the largest economy in Europe.' },
    // More animals
    { keys: ['horse','horses','pony','ponies'], answer: '🐴 <b>Horses</b> have been used by humans for over 5,000 years! They can run up to 55 mph. Horses sleep standing up — they can lock their legs to rest without falling over. A baby horse (foal) can walk within hours of being born. Horses have nearly 360-degree vision and can see two different things at once!' },
    { keys: ['crocodile','crocodiles','alligator','alligators'], answer: '🐊 <b>Crocodiles</b> are the closest living relatives of dinosaurs! They\'ve barely changed in 200 million years. They can hold their breath for up to an hour. Crocodiles have the strongest bite of any animal — about 3,700 psi. Despite their fierce reputation, they\'re caring parents and carry babies in their mouths gently.' },
    { keys: ['gorilla','gorillas','monkey','monkeys','chimpanzee','chimpanzees','ape'], answer: '🦍 <b>Gorillas</b> share 98.3% of DNA with humans! They\'re the largest primates. Gorillas can learn sign language — Koko the gorilla learned over 1,000 signs. Chimpanzees are our closest relatives at 98.7% DNA match. Monkeys and apes are different — apes have no tails! Orangutans are excellent tool users.' },
    { keys: ['bear','bears','polar bear','grizzly'], answer: '🐻 <b>Bears</b> are incredible! A polar bear\'s fur is actually transparent, not white — it looks white because it reflects light. They can smell prey 20 miles away. Grizzly bears can run at 35 mph and are powerful swimmers. Brown bears in some areas eat 20,000 calories a day before hibernating in winter.' },
    { keys: ['eagle','eagles','hawk','hawks','falcon'], answer: '🦅 <b>Eagles</b> have the sharpest eyes of any animal — they can spot a rabbit 2 miles away! The Bald Eagle is the national bird of the USA. Eagles can fly at 100 mph while diving. The Harpy Eagle, found in the Amazon, has talons as large as a grizzly bear\'s claws. Eagles mate for life!' },
    { keys: ['fox','foxes'], answer: '🦊 <b>Foxes</b> are clever, adaptable animals found on every continent except Antarctica! They are the only member of the dog family that can climb trees. Foxes use Earth\'s magnetic field like a compass to hunt — they prefer to pounce facing north. A group of foxes is called a skulk or earth.' },
    { keys: ['rabbit','rabbits','bunny','bunnies'], answer: '🐰 <b>Rabbits</b> are social animals that live in groups called colonies. They have nearly 360-degree vision to spot predators. A rabbit\'s teeth never stop growing! They can jump up to 3 feet high and 9 feet long. Rabbits are crepuscular — most active at dawn and dusk. A happy rabbit does a jump-and-twist called a "binky"!' },
    // More space
    { keys: ['saturn','saturn rings'], answer: '🪐 <b>Saturn</b> is the 6th planet from the Sun and the most recognisable in the solar system! Its rings are made of billions of ice chunks and rock fragments. Saturn is so light it could float in water! It has 146 known moons — the most of any planet. Titan, its largest moon, has lakes of liquid methane.' },
    { keys: ['jupiter'], answer: '🪐 <b>Jupiter</b> is the largest planet in our solar system — 1,300 Earths could fit inside it! It\'s a gas giant with no solid surface. The Great Red Spot is a storm that\'s been raging for over 350 years. Jupiter has 95 known moons including Europa which may have liquid water beneath its icy surface.' },
    { keys: ['comet','comets','meteor','meteors','asteroid','shooting star'], answer: '☄️ <b>Comets</b> are balls of ice, rock and dust that orbit the Sun. As they get closer to the Sun, they develop glowing tails of gas and dust millions of miles long. <b>Meteors</b> are space rocks that burn up in Earth\'s atmosphere — the streaks of light we call shooting stars. If they land on Earth, they\'re called meteorites!' },
    { keys: ['space station','iss','international space station','astronaut'], answer: '🛸 The <b>International Space Station (ISS)</b> orbits Earth at 250 miles up, travelling at 17,500 mph — it circles Earth every 90 minutes! It\'s been continuously inhabited since November 2000. Astronauts live there for 6 months at a time. It\'s the size of a football pitch and is visible from Earth with the naked eye!' },
    // More science
    { keys: ['dna','genes','genetics','chromosome'], answer: '🧬 <b>DNA</b> is the blueprint of life! It stands for deoxyribonucleic acid. Every cell in your body contains about 2 metres of DNA — if you uncoiled all the DNA in your body, it would stretch to Pluto and back many times. Humans share 60% of DNA with bananas! DNA carries genetic information passed from parents to children.' },
    { keys: ['magnet','magnets','magnetic','compass'], answer: '🧲 <b>Magnets</b> are fascinating! Every magnet has a north and south pole — opposite poles attract, like poles repel. Earth itself is a giant magnet — that\'s why compasses work! Electromagnets can be turned on and off by controlling electricity. MRI machines in hospitals use powerful magnets to see inside the human body.' },
    { keys: ['light','prism','colour spectrum','optics'], answer: '🌈 <b>Light</b> travels at 299,792 km per second — the fastest speed in the universe! White light is actually all colours mixed together. A prism splits light into the full spectrum — red, orange, yellow, green, blue, indigo and violet. That\'s also how rainbows form. Sunlight takes 8 minutes and 20 seconds to reach Earth from the Sun.' },
    { keys: ['germ','germs','virus','viruses','bacteria','infection'], answer: '🦠 <b>Germs</b> are microscopic organisms — bacteria, viruses, fungi and parasites. Not all bacteria are bad — your gut has about 38 trillion helpful bacteria! Viruses are even smaller than bacteria and need a host cell to reproduce. Antibiotics kill bacteria but don\'t work on viruses. Washing your hands is the single best way to stop germs spreading.' },
    // More sports
    { keys: ['swimming','swimmer','swim'], answer: '🏊 <b>Swimming</b> is one of the oldest sports and works every muscle in your body! Michael Phelps won 28 Olympic medals — the most of any Olympian in history. The four main strokes are freestyle, backstroke, breaststroke and butterfly. Water is about 800 times denser than air, so swimming takes enormous effort!' },
    { keys: ['cycling','bicycle','bike','tour de france'], answer: '🚴 <b>Cycling</b> is one of the most efficient forms of transport ever invented. The Tour de France is cycling\'s biggest race — 21 stages over 3 weeks covering about 3,500 km across France! A professional cyclist can burn 8,000 calories in a single race day. The bicycle became popular in the 1800s and transformed transportation.' },
    { keys: ['cricket','batting','bowling','wicket'], answer: '🏏 <b>Cricket</b> is one of the world\'s oldest ball sports, played since the 16th century! It\'s the second most popular sport globally with 2.5 billion fans. A cricket bat is flat on one side and ridged on the other. A Test match can last up to 5 days! England is where cricket was invented.' },
    { keys: ['rugby','rugby union','rugby league'], answer: '🏉 <b>Rugby</b> was invented in 1823 when William Webb Ellis reportedly picked up a football and ran with it at Rugby School in England! There are two main forms: Rugby Union (15 players per side) and Rugby League (13 players). The Rugby World Cup is held every 4 years — New Zealand\'s All Blacks are the most successful team.' },
    { keys: ['gymnastics','gymnast','tumbling','vault'], answer: '🤸 <b>Gymnastics</b> dates back to ancient Greece! It features events like floor, vault, bars and beam. Gymnasts train for hours every day and begin competing as children. Simone Biles is widely considered the greatest gymnast of all time. Gymnastics is one of the most watched events at the Summer Olympics.' },
    // More history
    { keys: ['ancient greece','greek','greece','athens','sparta'], answer: '🏛️ <b>Ancient Greece</b> gave us democracy, the Olympic Games, philosophy and much of modern science! Athens was the world\'s first democracy around 500 BC. Greek philosophers like Socrates, Plato and Aristotle shaped Western thought. Greece is also famous for its myths — Zeus, Hercules, Medusa. The Parthenon in Athens still stands today!' },
    { keys: ['aztec','aztecs','mayan','maya','mexico ancient'], answer: '🏛️ The <b>Aztecs</b> built one of history\'s most powerful empires in modern-day Mexico from 1300–1521 AD. Their capital, Tenochtitlan (now Mexico City), was larger than most European cities of the time. They built giant pyramids and had advanced astronomy, agriculture and medicine. The Spanish conquered them under Hernán Cortés in 1521.' },
    { keys: ['columbus','christopher columbus','explorer','explorers','vasco da gama','magellan'], answer: '🧭 <b>Christopher Columbus</b> sailed from Spain in 1492 and reached the Americas — though he thought it was Asia! He made 4 voyages to the Caribbean. <b>Ferdinand Magellan</b> led the first expedition to circumnavigate the globe (1519–1522). <b>Vasco da Gama</b> found the sea route from Europe to India in 1498.' },
    // More maths
    { keys: ['multiplication','times table','times tables','multiply'], answer: '✖️ <b>Multiplication</b> is just repeated addition! The times tables go from 1×1 to 12×12 in school. A quick trick: anything times 9 — multiply by 10 then subtract the original number (e.g., 9×7 = 70−7 = 63). Anything times 11 up to 9: just double the digit (11×6 = 66).' },
    { keys: ['fraction','fractions','half','quarter','decimal'], answer: '½ <b>Fractions</b> represent parts of a whole. The top number is the numerator; the bottom is the denominator. Fun examples: ½ + ½ = 1, ¼ = 0.25, ¾ = 0.75. To add fractions, they need the same denominator first. Fractions, decimals and percentages are all different ways to show the same thing!' },
    { keys: ['shape','shapes','triangle','square','hexagon','geometry'], answer: '📐 <b>Geometry</b> is the study of shapes! A triangle has 3 sides and its angles always add to 180°. A square has 4 equal sides and 4 right angles. A hexagon has 6 sides — honeybees build hexagonal cells because they\'re the most efficient shape. A circle has infinite sides! 3D shapes include cubes, spheres, pyramids and cylinders.' },
    // More food
    { keys: ['pasta','spaghetti','noodles'], answer: '🍝 <b>Pasta</b> is made from durum wheat and water — it originated in Italy (though noodles in China appeared even earlier!). There are over 350 types of pasta! Pasta names describe their shape — penne means "quills", farfalle means "butterflies", vermicelli means "little worms"! Italians eat an average of 23 kg of pasta per person per year.' },
    { keys: ['sandwich','sandwiches','bread'], answer: '🥪 The <b>sandwich</b> is named after John Montagu, the 4th Earl of Sandwich, who in 1762 asked for meat between slices of bread so he could eat while playing cards! Bread has been a food staple for over 14,000 years. The most popular sandwich in the UK is cheese; in the USA it\'s peanut butter and jelly!' },
    { keys: ['fruit','fruits','apple','banana','strawberry'], answer: '🍎 <b>Fruit</b> facts: A strawberry is not actually a berry by botanical definition — but a banana is! Apples float in water because they\'re 25% air. Bananas are curved because they grow towards the sun. There are over 7,500 variety of apples worldwide. Avocados are fruits, not vegetables! Pineapples grow one at a time on a small plant.' },
    // Seasons
    { keys: ['season','seasons','spring','summer','autumn','fall','winter'], answer: '🌸❄️ Earth has <b>4 seasons</b> caused by its tilt (23.5°) as it orbits the Sun!<br>• 🌸 <b>Spring</b> — trees bud, animals wake from hibernation<br>• ☀️ <b>Summer</b> — longest days, hottest temperatures<br>• 🍂 <b>Autumn/Fall</b> — leaves change colour, days shorten<br>• ❄️ <b>Winter</b> — shortest days, coldest temperatures<br>Seasons are reversed in the Southern Hemisphere — Australia has Christmas in summer!' },
    // Net2 shows
    { keys: ['shadow protocol','galactic drifters','vortex rising','cyber wolves','stellar patrol'], answer: '🎬 Net2 shows include:<br>• <b>Shadow Protocol</b> — a spy thriller about elite agents<br>• <b>Galactic Drifters</b> — sci-fi adventure across the galaxy<br>• <b>Vortex Rising</b> — action drama with mysterious vortexes<br>• <b>Cyber Wolves</b> — a cyberpunk thriller<br>• <b>Stellar Patrol</b> — space law enforcement adventures<br>Open Net2 on the desktop to watch them!' },
    // Books on Simple PC
    { keys: ['crystal kingdom','space explorer','dragon', 'magic forest','ocean secret'], answer: '📚 Simple PC\'s <b>Books</b> app has great stories to read!<br>• 📖 <b>The Crystal Kingdom</b> — a fantasy adventure<br>• 🚀 <b>Space Explorer\'s Quest</b> — sci-fi journey through the stars<br>• 🐉 <b>Dragon\'s Den</b> — a tale of brave heroes and dragons<br>• 🌲 <b>The Magic Forest</b> — enchanted woodland mystery<br>• 🌊 <b>Ocean\'s Secret</b> — underwater adventure<br>Open the Books app to start reading!' },
    // Colours
    { keys: ['colour','color','colours','colors','mixing','red blue yellow'], answer: '🎨 <b>Colour mixing</b>: The primary colours are Red, Blue and Yellow. Mix them to get:<br>• Red + Blue = Purple 🟣<br>• Red + Yellow = Orange 🟠<br>• Blue + Yellow = Green 🟢<br>• All three = Brown<br>Light works differently — red, green and blue light mixed makes white light! Computer screens use red, green and blue (RGB) pixels.' },
    // Music extras
    { keys: ['drum','drums','percussion','beat'], answer: '🥁 <b>Drums</b> are the oldest instruments in the world — drums made from animal skins date back 8,000 years! They are the heartbeat of music, keeping the rhythm. A standard drum kit includes a bass drum, snare, hi-hats and cymbals. Famous drummers include Ringo Starr (The Beatles), John Bonham (Led Zeppelin) and Dave Grohl (Nirvana).' },
    { keys: ['violin','fiddle','orchestra','orchestra'], answer: '🎻 The <b>violin</b> is one of the most expressive instruments ever made! It has 4 strings and is played with a bow made of horsehair. A violin has over 70 individual wooden parts. The orchestra is a large ensemble led by a conductor — it has 4 sections: strings, woodwind, brass and percussion. Beethoven and Mozart wrote famous violin concertos.' },
    // Emotions
    { keys: ['emotion','emotions','feeling','feelings','happy','sad','angry'], answer: '❤️ <b>Emotions</b> are signals from your brain about the world around you!<br>• 😊 <b>Happiness</b> releases dopamine and serotonin — "feel good" chemicals<br>• 😢 <b>Sadness</b> is normal and helps us process loss<br>• 😠 <b>Anger</b> can motivate change or signal unfairness<br>• 😨 <b>Fear</b> protects us from danger via the fight-or-flight response<br>• 😮 <b>Surprise</b> focuses our attention on something new<br>Talking about feelings helps process them!' },
    // Environment
    { keys: ['environment','climate change','global warming','recycling','recycle','pollution'], answer: '♻️ <b>Climate Change</b>: Earth\'s average temperature has risen 1.1°C since the 1800s due to greenhouse gases from burning fossil fuels. This causes more extreme weather, rising sea levels and habitat loss. <b>What helps:</b><br>• ♻️ Recycle paper, plastic, metal and glass<br>• 🚶 Walk or cycle instead of driving<br>• 🌱 Plant trees — they absorb CO₂<br>• 💡 Turn off lights and electronics you\'re not using' },
    // More body
    { keys: ['bone','bones','skeleton'], answer: '🦴 You have <b>206 bones</b> in your body as an adult — but babies are born with about 270 bones that fuse together as you grow! The femur (thigh bone) is the longest and strongest. Bones are living tissue — they repair themselves when broken. Bone marrow produces 500 billion blood cells every day. Bones are 5 times stronger than steel by weight!' },
    { keys: ['heart','heartbeat','blood','blood cells'], answer: '❤️ Your <b>heart</b> beats about 100,000 times every day — over 2.5 billion times in a lifetime! It pumps about 2,000 gallons of blood every day. Red blood cells carry oxygen and live for about 120 days. White blood cells fight infections. Your blood vessels, if stretched out, would wrap around Earth about 2.5 times!' },
    { keys: ['lung','lungs','breathing','oxygen','breath'], answer: '🫁 You have two <b>lungs</b> — the right is slightly larger. Every day you take about 22,000 breaths! Your lungs have 600 million tiny air sacs called alveoli. If you flattened all the alveoli out, they\'d cover a tennis court. The lungs are the only organs that float in water. Deep breathing reduces stress and increases focus.' },
    { keys: ['muscle','muscles','exercise'], answer: '💪 You have over <b>600 muscles</b> in your body! The biggest is the gluteus maximus (your bottom). The smallest is the stapedius muscle in your ear — just 1mm long. The hardest-working muscle is the heart. Muscles work in pairs — when one contracts, the other relaxes. Exercise makes muscles stronger by causing tiny tears that heal bigger!' },
];

function simpleAISend() {
    const input = document.getElementById('ai-input');
    const messages = document.getElementById('ai-messages');
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    // User bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'ai-msg ai-msg-user';
    userBubble.textContent = text;
    messages.appendChild(userBubble);

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'ai-msg ai-msg-bot';
    typing.innerHTML = '<i style="color:#888">Simple AI is thinking...</i>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
        const lower = text.toLowerCase();
        let answer = null;
        for (const entry of AI_KNOWLEDGE) {
            if (entry.keys.some(k => lower.includes(k))) { answer = entry.answer; break; }
        }
        if (!answer) {
            answer = `🤔 I'm not sure about "<b>${text}</b>" yet. Try asking me about HazyGames, ZappyCook, space, animals, science, robots, football, or history!`;
        }
        typing.innerHTML = answer;
        messages.scrollTop = messages.scrollHeight;
    }, 600);
}

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
