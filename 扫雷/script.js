class Minesweeper {
    constructor() {
        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.lives = 1; // One resurrection chance
        this.hints = 3; // Three hints per game
        this.flags = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.elapsedTime = 0;

        // DOM elements
        this.boardElement = document.getElementById('game-board');
        this.flagsElement = document.getElementById('flags');
        this.totalMinesElement = document.getElementById('total-mines');
        this.livesElement = document.getElementById('lives');
        this.hintsElement = document.getElementById('hints');
        this.hintCountElement = document.getElementById('hint-count');
        this.timerElement = document.getElementById('timer');
        this.statusMessage = document.getElementById('status-message');
        this.statusIcon = document.querySelector('.status-icon i');

        // Mobile control elements
        this.revealModeBtn = document.getElementById('reveal-mode-btn');
        this.flagModeBtn = document.getElementById('flag-mode-btn');
        this.quickFlagBtn = document.getElementById('quick-flag-btn');
        this.revealActionBtn = document.getElementById('reveal-action-btn');
        this.flagActionBtn = document.getElementById('flag-action-btn');
        this.mobileModeText = document.getElementById('mobile-mode-text');

        // Keyboard control buttons
        this.keyboardRevealBtn = document.getElementById('keyboard-reveal');
        this.keyboardFlagBtn = document.getElementById('keyboard-flag');

        // Game mode
        this.currentMode = 'reveal'; // 'reveal' or 'flag'

        // Keyboard navigation
        this.currentRow = 0;
        this.currentCol = 0;
        this.keyboardEnabled = true;

        // Initialize
        this.init();
        this.bindEvents();
        this.updateDisplay();

        // Initialize mode and focus
        this.setMode(this.currentMode);
        setTimeout(() => {
            this.updateFocus();
        }, 100);
    }

    init() {
        this.createBoard();
        this.renderBoard();
    }

    createBoard() {
        // Initialize arrays
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.revealed = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
    }

    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;

        // Don't place mines in the first clicked cell or adjacent cells
        const safeCells = new Set();
        for (let r = Math.max(0, firstRow - 1); r <= Math.min(this.rows - 1, firstRow + 1); r++) {
            for (let c = Math.max(0, firstCol - 1); c <= Math.min(this.cols - 1, firstCol + 1); c++) {
                safeCells.add(`${r},${c}`);
            }
        }

        while (minesPlaced < this.mines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);

            // Skip if it's a safe cell or already has a mine
            if (safeCells.has(`${r},${c}`) || this.board[r][c] === -1) {
                continue;
            }

            this.board[r][c] = -1; // -1 represents a mine
            minesPlaced++;
        }

        // Calculate numbers for non-mine cells
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] !== -1) {
                    this.board[r][c] = this.countAdjacentMines(r, c);
                }
            }
        }
    }

    countAdjacentMines(row, col) {
        let count = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                if (this.board[r][c] === -1) count++;
            }
        }
        return count;
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.cols}, var(--cell-size, 37px))`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.rows}, var(--cell-size, 37px))`;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.setAttribute('tabindex', '0');
                cell.setAttribute('role', 'button');
                cell.setAttribute('aria-label', `第${r + 1}行第${c + 1}列`);

                if (this.revealed[r][c]) {
                    cell.classList.add('revealed');
                    if (this.board[r][c] === -1) {
                        cell.classList.add('mine');
                    } else if (this.board[r][c] > 0) {
                        cell.classList.add(`number-${this.board[r][c]}`);
                        cell.textContent = this.board[r][c];
                    }
                } else if (this.flagged[r][c]) {
                    cell.classList.add('flagged');
                }

                cell.addEventListener('click', (e) => this.handleLeftClick(r, c, e));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(r, c);
                });

                // Touch events for mobile devices
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.touchStartTime = Date.now();
                    this.touchCell = { r, c };
                });

                cell.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    const touchDuration = Date.now() - this.touchStartTime;

                    if (touchDuration > 500) {
                        // Long press for right click (flag)
                        this.handleRightClick(r, c);
                    } else {
                        // Short press for left click
                        this.handleLeftClick(r, c, e);
                    }
                });

                this.boardElement.appendChild(cell);
            }
        }
    }

    handleLeftClick(row, col, event) {
        if (this.gameOver || this.gameWon || this.flagged[row][col]) {
            return;
        }

        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
            this.startTimer();
            this.statusMessage.textContent = '游戏开始！祝你好运！';
            this.statusIcon.className = 'fas fa-gamepad';
        }

        if (this.revealed[row][col]) {
            // Implement chord clicking (clicking on revealed number with correct flags around)
            return this.chordClick(row, col);
        }

        this.revealCell(row, col);

        if (this.board[row][col] === -1) {
            // Hit a mine
            if (this.lives > 0) {
                this.lives--;
                this.livesElement.textContent = this.lives;
                this.statusMessage.textContent = '你踩到雷了！已使用复活机会。请小心！';
                this.statusIcon.className = 'fas fa-heartbeat';

                // Just reveal this mine, don't end game
                this.updateDisplay();
                return;
            } else {
                this.gameOver = true;
                this.statusMessage.textContent = '游戏结束！你踩到雷了。';
                this.statusIcon.className = 'fas fa-skull-crossbones';
                this.revealAllMines();
                this.stopTimer();
                this.boardElement.classList.add('game-over');
                return;
            }
        }

        if (this.board[row][col] === 0) {
            // Reveal adjacent cells if it's a zero
            this.revealAdjacentCells(row, col);
        }

        this.checkWin();
        this.updateDisplay();
    }

    handleRightClick(row, col) {
        if (this.gameOver || this.gameWon || this.revealed[row][col]) {
            return;
        }

        if (this.flagged[row][col]) {
            this.flagged[row][col] = false;
            this.flags--;
        } else {
            if (this.flags >= this.mines) {
                this.statusMessage.textContent = '标记数量不能超过地雷数量！';
                return;
            }
            this.flagged[row][col] = true;
            this.flags++;
        }

        this.renderBoard();
        this.updateDisplay();

        // Check win after flagging
        this.checkWin();
    }

    chordClick(row, col) {
        // Only chord click on revealed numbers
        if (!this.revealed[row][col] || this.board[row][col] <= 0) return;

        let flagCount = 0;
        let hiddenCells = [];

        // Count flags around and collect hidden cells
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;

                if (this.flagged[r][c]) {
                    flagCount++;
                } else if (!this.revealed[r][c]) {
                    hiddenCells.push({ r, c });
                }
            }
        }

        // If flag count matches the number, reveal hidden cells
        if (flagCount === this.board[row][col]) {
            let hitMine = false;

            for (const cell of hiddenCells) {
                this.revealCell(cell.r, cell.c);

                if (this.board[cell.r][cell.c] === -1) {
                    hitMine = true;
                } else if (this.board[cell.r][cell.c] === 0) {
                    this.revealAdjacentCells(cell.r, cell.c);
                }
            }

            if (hitMine) {
                if (this.lives > 0) {
                    this.lives--;
                    this.livesElement.textContent = this.lives;
                    this.statusMessage.textContent = '连锁点击踩到雷！已使用复活机会。';
                    this.statusIcon.className = 'fas fa-heartbeat';
                } else {
                    this.gameOver = true;
                    this.statusMessage.textContent = '游戏结束！连锁点击揭示了地雷。';
                    this.statusIcon.className = 'fas fa-skull-crossbones';
                    this.revealAllMines();
                    this.stopTimer();
                    this.boardElement.classList.add('game-over');
                }
            }

            this.checkWin();
            this.updateDisplay();
        }
    }

    revealCell(row, col) {
        if (this.revealed[row][col] || this.flagged[row][col]) return;

        this.revealed[row][col] = true;

        // Update the specific cell in DOM
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('revealed');
            if (this.board[row][col] === -1) {
                cell.classList.add('mine');
            } else if (this.board[row][col] > 0) {
                cell.classList.add(`number-${this.board[row][col]}`);
                cell.textContent = this.board[row][col];
            }
        }
    }

    revealAdjacentCells(row, col) {
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                if (!this.revealed[r][c] && !this.flagged[r][c]) {
                    this.revealCell(r, c);
                    if (this.board[r][c] === 0) {
                        this.revealAdjacentCells(r, c);
                    }
                }
            }
        }
    }

    revealAllMines() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === -1 && !this.flagged[r][c]) {
                    this.revealCell(r, c);
                }
            }
        }
    }

    checkWin() {
        // Win condition: all non-mine cells are revealed
        let allRevealed = true;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] !== -1 && !this.revealed[r][c]) {
                    allRevealed = false;
                    break;
                }
            }
            if (!allRevealed) break;
        }

        // Alternative win condition: all mines are correctly flagged
        let allMinesFlagged = true;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === -1 && !this.flagged[r][c]) {
                    allMinesFlagged = false;
                    break;
                }
            }
            if (!allMinesFlagged) break;
        }

        if (allRevealed || allMinesFlagged) {
            this.gameWon = true;
            this.statusMessage.textContent = '恭喜！你赢得了游戏！';
            this.statusIcon.className = 'fas fa-trophy';
            this.stopTimer();
            this.revealAllMines(); // Show all mines for confirmation
        }
    }

    useHint() {
        if (this.hints <= 0 || this.gameOver || this.gameWon || this.firstClick) {
            this.statusMessage.textContent = '现在无法使用提示！';
            return;
        }

        // Find a safe cell to reveal (not a mine, not revealed, not flagged)
        const safeCells = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] !== -1 && !this.revealed[r][c] && !this.flagged[r][c]) {
                    safeCells.push({ r, c });
                }
            }
        }

        if (safeCells.length === 0) {
            this.statusMessage.textContent = '没有安全格子可揭示！';
            return;
        }

        this.hints--;
        this.hintsElement.textContent = this.hints;
        this.hintCountElement.textContent = this.hints;

        // Pick a random safe cell
        const randomCell = safeCells[Math.floor(Math.random() * safeCells.length)];

        // Highlight the hinted cell
        const cell = document.querySelector(`.cell[data-row="${randomCell.r}"][data-col="${randomCell.c}"]`);
        cell.style.boxShadow = '0 0 20px #8a9b7b';
        setTimeout(() => {
            cell.style.boxShadow = '';
        }, 2000);

        this.statusMessage.textContent = `提示：格子 (${randomCell.r + 1}, ${randomCell.c + 1}) 是安全的！`;
        this.statusIcon.className = 'fas fa-lightbulb';

        // Auto-reveal the hinted cell after a delay
        setTimeout(() => {
            if (!this.gameOver && !this.gameWon) {
                this.revealCell(randomCell.r, randomCell.c);
                if (this.board[randomCell.r][randomCell.c] === 0) {
                    this.revealAdjacentCells(randomCell.r, randomCell.c);
                }
                this.checkWin();
                this.updateDisplay();
            }
        }, 1500);
    }

    revealSafeArea() {
        if (this.gameOver || this.gameWon || this.firstClick) return;

        // Find a cluster of safe cells to reveal
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === 0 && !this.revealed[r][c] && !this.flagged[r][c]) {
                    this.revealAdjacentCells(r, c);
                    this.statusMessage.textContent = '已揭示安全区域！';
                    this.statusIcon.className = 'fas fa-eye';
                    this.checkWin();
                    this.updateDisplay();
                    return;
                }
            }
        }

        // If no zero cells, just use a hint
        this.useHint();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.timerElement.textContent = this.elapsedTime.toString().padStart(3, '0');
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateDisplay() {
        this.flagsElement.textContent = this.flags;
        this.totalMinesElement.textContent = this.mines;
        this.livesElement.textContent = this.lives;
        this.hintsElement.textContent = this.hints;
        this.hintCountElement.textContent = this.hints;
    }

    resetGame() {
        this.stopTimer();

        this.firstClick = true;
        this.gameOver = false;
        this.gameWon = false;
        this.lives = 1;
        this.hints = 3;
        this.flags = 0;
        this.elapsedTime = 0;
        this.timerElement.textContent = '000';

        // Reset focus position
        this.currentRow = 0;
        this.currentCol = 0;

        this.createBoard();
        this.renderBoard();
        this.updateDisplay();

        this.statusMessage.textContent = '点击格子开始游戏！使用方向键移动，空格键翻开，回车键标记。';
        this.statusIcon.className = 'fas fa-smile';
        this.boardElement.classList.remove('game-over');

        // Update focus after rendering
        setTimeout(() => {
            this.updateFocus();
        }, 100);
    }

    changeDifficulty(rows, cols, mines) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.resetGame();
    }

    bindEvents() {
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            if (btn.classList.contains('custom-mode')) return;

            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const rows = parseInt(btn.dataset.rows);
                const cols = parseInt(btn.dataset.cols);
                const mines = parseInt(btn.dataset.mines);

                this.changeDifficulty(rows, cols, mines);
            });
        });

        // Custom mode toggle
        document.querySelector('.custom-mode').addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.custom-mode').classList.add('active');
            document.querySelector('.custom-settings').classList.remove('hidden');
        });

        // Apply custom settings
        document.getElementById('apply-custom').addEventListener('click', () => {
            const rows = parseInt(document.getElementById('rows').value);
            const cols = parseInt(document.getElementById('cols').value);
            let mines = parseInt(document.getElementById('mines').value);

            // Validate inputs
            if (rows < 5 || rows > 30) {
                alert('Rows must be between 5 and 30');
                return;
            }
            if (cols < 5 || cols > 40) {
                alert('Columns must be between 5 and 40');
                return;
            }
            if (mines < 1) {
                alert('Must have at least 1 mine');
                return;
            }

            const maxMines = Math.floor(rows * cols * 0.8);
            if (mines > maxMines) {
                mines = maxMines;
                document.getElementById('mines').value = maxMines;
                alert(`Too many mines! Reduced to ${maxMines} (80% of cells)`);
            }

            this.changeDifficulty(rows, cols, mines);
        });

        // New game button
        document.getElementById('new-game').addEventListener('click', () => {
            this.resetGame();
        });

        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.useHint();
        });

        // Reveal safe area button
        document.getElementById('reveal-btn').addEventListener('click', () => {
            this.revealSafeArea();
        });

        // Prevent context menu on board
        this.boardElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Mobile control buttons
        if (this.revealModeBtn) {
            this.revealModeBtn.addEventListener('click', () => {
                this.setMode('reveal');
            });
        }

        if (this.flagModeBtn) {
            this.flagModeBtn.addEventListener('click', () => {
                this.setMode('flag');
            });
        }

        if (this.quickFlagBtn) {
            this.quickFlagBtn.addEventListener('click', () => {
                this.useQuickFlag();
            });
        }

        // Mobile action buttons
        if (this.revealActionBtn) {
            this.revealActionBtn.addEventListener('click', () => {
                this.handleLeftClick(this.currentRow, this.currentCol);
            });
        }

        if (this.flagActionBtn) {
            this.flagActionBtn.addEventListener('click', () => {
                this.handleRightClick(this.currentRow, this.currentCol);
            });
        }

        // Keyboard control buttons
        if (this.keyboardRevealBtn) {
            this.keyboardRevealBtn.addEventListener('click', () => {
                this.handleLeftClick(this.currentRow, this.currentCol);
            });
        }

        if (this.keyboardFlagBtn) {
            this.keyboardFlagBtn.addEventListener('click', () => {
                this.handleRightClick(this.currentRow, this.currentCol);
            });
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // Focus the board for keyboard navigation
        this.boardElement.setAttribute('tabindex', '0');
        this.boardElement.addEventListener('focus', () => {
            this.keyboardEnabled = true;
            this.updateFocus();
        });

        this.boardElement.addEventListener('blur', () => {
            this.keyboardEnabled = false;
            this.clearFocus();
        });
    }

    handleKeyDown(e) {
        if (!this.keyboardEnabled || this.gameOver || this.gameWon) {
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.moveFocus(-1, 0);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.moveFocus(1, 0);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.moveFocus(0, -1);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.moveFocus(0, 1);
                break;
            case ' ':
            case 'Spacebar':
                e.preventDefault();
                this.handleLeftClick(this.currentRow, this.currentCol);
                break;
            case 'Enter':
                e.preventDefault();
                this.handleRightClick(this.currentRow, this.currentCol);
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                this.handleRightClick(this.currentRow, this.currentCol);
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                this.setMode('reveal');
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                this.setMode('flag');
                break;
            case 'Escape':
                e.preventDefault();
                this.resetGame();
                break;
        }
    }

    moveFocus(deltaRow, deltaCol) {
        const newRow = Math.max(0, Math.min(this.rows - 1, this.currentRow + deltaRow));
        const newCol = Math.max(0, Math.min(this.cols - 1, this.currentCol + deltaCol));

        if (newRow !== this.currentRow || newCol !== this.currentCol) {
            this.currentRow = newRow;
            this.currentCol = newCol;
            this.updateFocus();
        }
    }

    updateFocus() {
        this.clearFocus();

        const cell = this.boardElement.querySelector(`[data-row="${this.currentRow}"][data-col="${this.currentCol}"]`);
        if (cell) {
            cell.classList.add('focused');
            cell.focus();
        }
    }

    clearFocus() {
        const focusedCell = this.boardElement.querySelector('.cell.focused');
        if (focusedCell) {
            focusedCell.classList.remove('focused');
        }
    }

    setMode(mode) {
        this.currentMode = mode;

        // Update mobile control buttons
        if (this.revealModeBtn && this.flagModeBtn) {
            this.revealModeBtn.classList.toggle('active', mode === 'reveal');
            this.flagModeBtn.classList.toggle('active', mode === 'flag');
        }

        // Update mobile action buttons visibility
        if (this.revealActionBtn && this.flagActionBtn) {
            if (mode === 'reveal') {
                this.revealActionBtn.style.display = 'flex';
                this.flagActionBtn.style.display = 'none';
            } else {
                this.revealActionBtn.style.display = 'none';
                this.flagActionBtn.style.display = 'flex';
            }
        }

        // Update mobile mode text
        if (this.mobileModeText) {
            const modeText = mode === 'reveal' ? '翻开' : '标记';
            this.mobileModeText.innerHTML = `当前模式：<span>${modeText}</span> - 点击格子执行对应操作`;
        }

        // Update status message
        const modeName = mode === 'reveal' ? '翻开模式' : '标记模式';
        this.statusMessage.textContent = `已切换到${modeName}。使用方向键移动，空格键翻开，回车键标记。`;
    }

    useQuickFlag() {
        if (this.gameOver || this.gameWon || this.revealed[this.currentRow][this.currentCol]) {
            return;
        }

        this.handleRightClick(this.currentRow, this.currentCol);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Minesweeper();

    // 初始化游戏攻略弹窗
    initStrategyModal();
});

// 游戏攻略弹窗功能
function initStrategyModal() {
    const modal = document.getElementById('strategy-modal');
    const strategyBtn = document.getElementById('strategy-btn');
    const closeBtns = document.querySelectorAll('.modal-close, .modal-close-btn');

    if (!modal || !strategyBtn) return;

    // 打开弹窗
    strategyBtn.addEventListener('click', () => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    });

    // 关闭弹窗
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
    });

    // 点击弹窗外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
}