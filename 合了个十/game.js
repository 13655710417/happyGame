class MergeTenGame {
    constructor() {
        this.rows = 10;
        this.cols = 15;
        this.grid = Array(this.rows * this.cols).fill(null);
        this.score = 0;
        this.timeLeft = 120; // 2分钟游戏时间
        this.combo = 0;
        this.maxCombo = 0;
        this.tensCreated = 0;
        this.gameActive = false;
        this.timer = null;
        this.lastEliminationTime = null;
        this.comboResetTimer = null;

        // 矩形选择相关
        this.isSelecting = false;
        this.selectionStart = null;
        this.selectionEnd = null;
        this.selectionRect = null;

        this.init();
    }

    init() {
        this.cacheElements();
        this.renderGrid();
        this.setupEventListeners();
        this.updateDisplay();
    }

    cacheElements() {
        this.gameGrid = document.getElementById('game-grid');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.comboElement = document.getElementById('combo');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalComboElement = document.getElementById('final-combo');
        this.finalTensElement = document.getElementById('final-tens');
        this.gameOverReasonElement = document.getElementById('game-over-reason');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.comboPopup = document.getElementById('combo-popup');
    }

    renderGrid() {
        this.gameGrid.innerHTML = '';
        this.gameGrid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        this.gameGrid.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

        for (let i = 0; i < this.rows * this.cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            cell.dataset.row = Math.floor(i / this.cols);
            cell.dataset.col = i % this.cols;

            if (this.grid[i] !== null) {
                cell.textContent = this.grid[i];
                cell.dataset.value = this.grid[i];
            }

            this.gameGrid.appendChild(cell);
        }

        // 创建选择矩形元素
        if (!this.selectionRect) {
            this.selectionRect = document.createElement('div');
            this.selectionRect.className = 'selection-rect';
            this.selectionRect.style.display = 'none';
            this.gameGrid.appendChild(this.selectionRect);
        }
    }

    generateRandomNumber() {
        return Math.floor(Math.random() * 9) + 1; // 生成1-9的数字
    }

    fillGrid() {
        // 填充所有格子为1-9随机数字
        const totalCells = this.rows * this.cols;
        for (let i = 0; i < totalCells; i++) {
            this.grid[i] = this.generateRandomNumber();
        }
    }

    hasValidSelection() {
        // 检查是否存在和为10的矩形区域
        for (let startRow = 0; startRow < this.rows; startRow++) {
            for (let startCol = 0; startCol < this.cols; startCol++) {
                for (let endRow = startRow; endRow < this.rows; endRow++) {
                    for (let endCol = startCol; endCol < this.cols; endCol++) {
                        const sum = this.calculateRectSum(startRow, startCol, endRow, endCol);
                        if (sum === 10) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    calculateRectSum(startRow, startCol, endRow, endCol) {
        let sum = 0;
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const index = row * this.cols + col;
                if (this.grid[index] !== null) {
                    sum += this.grid[index];
                }
            }
        }
        return sum;
    }

    getSelectedCells(startRow, startCol, endRow, endCol) {
        const cells = [];
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const index = row * this.cols + col;
                if (this.grid[index] !== null) {
                    cells.push({
                        index: index,
                        value: this.grid[index],
                        row: row,
                        col: col
                    });
                }
            }
        }
        return cells;
    }

    removeSelectedCells(startRow, startCol, endRow, endCol) {
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const index = row * this.cols + col;
                this.grid[index] = null;
            }
        }
    }


    checkSelection(startRow, startCol, endRow, endCol) {
        const sum = this.calculateRectSum(startRow, startCol, endRow, endCol);

        if (sum === 10) {
            // 成功消除
            const selectedCells = this.getSelectedCells(startRow, startCol, endRow, endCol);
            const cellCount = selectedCells.length;

            // 计算分数
            let points = cellCount * 2;
            if (this.combo > 0) {
                points += this.combo;
            }
            this.score += points;

            // 更新连击（5秒内成功消除都算连击）
            const now = Date.now();
            if (this.lastEliminationTime && (now - this.lastEliminationTime) <= 5000) {
                // 5秒内，增加连击
                this.combo++;
            } else {
                // 超过5秒或第一次消除，重置连击
                this.combo = 1;
            }
            this.lastEliminationTime = now;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            this.tensCreated++;

            // 清除之前的连击重置定时器
            if (this.comboResetTimer) {
                clearTimeout(this.comboResetTimer);
            }
            // 设置5秒后重置连击的定时器
            this.comboResetTimer = setTimeout(() => {
                this.combo = 0;
                this.updateDisplay();
            }, 5000);

            // 显示连击特效
            if (this.combo >= 2) {
                this.showComboPopup(`${this.combo}连击！+${points}分`);
            } else {
                this.showComboPopup(`消除成功！+${points}分`);
            }

            // 检查完美消除成就（一次消除5个或更多数字）
            if (cellCount >= 5) {
                this.checkAchievement('perfectElimination');
            }

            // 移除选中的数字
            this.removeSelectedCells(startRow, startCol, endRow, endCol);

            // 检查成就
            this.checkAchievements();

            return true;
        } else if (sum > 10) {
            this.showComboPopup('数字和大于10！');
            this.combo = 0;
        } else {
            this.showComboPopup('数字和小于10！');
            this.combo = 0;
        }

        return false;
    }

    showComboPopup(text) {
        this.comboPopup.textContent = text;
        this.comboPopup.style.animation = 'none';
        setTimeout(() => {
            this.comboPopup.style.animation = 'comboAnimation 1s ease-out';
        }, 10);
    }

    checkAchievements() {
        if (this.score >= 100) {
            this.checkAchievement('hundredPoints');
        }

        if (this.score >= 200) {
            this.checkAchievement('twoHundredPoints');
        }

        if (this.score >= 500) {
            this.checkAchievement('fiveHundredPoints');
        }

        if (this.combo >= 5) {
            this.checkAchievement('fiveCombo');
        }

        if (this.tensCreated >= 10) {
            this.checkAchievement('tenTens');
        }

        // 快速消除者：游戏开始30秒内完成5次消除
        if (this.tensCreated >= 5 && this.timeLeft >= 90) { // 120秒总时间，30秒内就是剩余90秒以上
            this.checkAchievement('fastEliminator');
        }

        // 神速消除：游戏开始30秒内完成8次消除
        if (this.tensCreated >= 8 && this.timeLeft >= 90) { // 120秒总时间，30秒内就是剩余90秒以上
            this.checkAchievement('lightningEliminator');
        }

        // 完美消除：一次消除包含5个或更多数字（这个需要在消除时检查）
    }

    checkAchievement(achievement) {
        const achievements = {
            fiveCombo: 0,
            hundredPoints: 1,
            twoHundredPoints: 2,
            fiveHundredPoints: 3,
            tenTens: 4,
            fastEliminator: 5,
            perfectElimination: 6,
            lightningEliminator: 7
        };

        const index = achievements[achievement];
        if (index !== undefined) {
            const achievementElement = document.querySelectorAll('.achievement')[index];
            if (achievementElement && achievementElement.dataset.achieved === 'false') {
                achievementElement.dataset.achieved = 'true';

                // 显示成就解锁提示
                const notification = document.createElement('div');
                notification.className = 'achievement-notification';
                notification.innerHTML = `
                    <i class="fas fa-trophy"></i>
                    <span>成就解锁: ${achievementElement.textContent.trim()}</span>
                `;
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }
        }
    }

    startGame() {
        if (this.gameActive) return;

        this.gameActive = true;
        this.timeLeft = 120;
        this.score = 0;
        this.combo = 0;
        this.tensCreated = 0;
        this.grid = Array(this.rows * this.cols).fill(null);
        this.lastEliminationTime = null;

        // 清除连击重置定时器
        if (this.comboResetTimer) {
            clearTimeout(this.comboResetTimer);
            this.comboResetTimer = null;
        }

        // 初始填充网格
        this.fillGrid();

        this.startTimer();
        this.updateDisplay();
        this.renderGrid();

        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        // 重置成就显示
        document.querySelectorAll('.achievement').forEach(ach => {
            ach.dataset.achieved = 'false';
        });
    }

    pauseGame() {
        if (!this.gameActive) return;

        this.gameActive = false;
        clearInterval(this.timer);

        // 清除连击重置定时器
        if (this.comboResetTimer) {
            clearTimeout(this.comboResetTimer);
            this.comboResetTimer = null;
        }

        this.pauseBtn.innerHTML = '<i class="fas fa-play"></i> 继续';
    }

    resumeGame() {
        if (this.gameActive) return;

        this.gameActive = true;
        this.startTimer();
        this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
    }

    restartGame() {
        this.gameActive = false;
        clearInterval(this.timer);

        // 清除连击重置定时器
        if (this.comboResetTimer) {
            clearTimeout(this.comboResetTimer);
            this.comboResetTimer = null;
        }

        this.startGame();
    }

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.gameOver('时间到！');
                return;
            }

            // 检查是否还有可消除的组合，如果没有则游戏结束
            if (!this.hasValidSelection()) {
                this.gameOver('没有更多可消除的组合！');
                return;
            }
        }, 1000);
    }

    gameOver(reason = '时间到！') {
        this.gameActive = false;
        clearInterval(this.timer);

        // 清除连击重置定时器
        if (this.comboResetTimer) {
            clearTimeout(this.comboResetTimer);
            this.comboResetTimer = null;
        }

        this.finalScoreElement.textContent = this.score;
        this.finalComboElement.textContent = this.maxCombo;
        this.finalTensElement.textContent = this.tensCreated;
        this.gameOverReasonElement.textContent = reason;

        this.gameOverModal.style.display = 'flex';

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.scoreElement.textContent = this.score;
        this.comboElement.textContent = this.combo;
    }

    updateSelectionRect(startRow, startCol, endRow, endCol) {
        if (!this.selectionRect) return;

        const startX = Math.min(startCol, endCol);
        const endX = Math.max(startCol, endCol);
        const startY = Math.min(startRow, endRow);
        const endY = Math.max(startRow, endRow);

        const width = endX - startX + 1;
        const height = endY - startY + 1;

        this.selectionRect.style.gridColumn = `${startX + 1} / span ${width}`;
        this.selectionRect.style.gridRow = `${startY + 1} / span ${height}`;
        this.selectionRect.style.display = 'block';
    }

    clearSelection() {
        if (this.selectionRect) {
            this.selectionRect.style.display = 'none';
        }
        this.isSelecting = false;
        this.selectionStart = null;
        this.selectionEnd = null;
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());

        this.pauseBtn.addEventListener('click', () => {
            if (this.gameActive) {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        });

        this.restartBtn.addEventListener('click', () => this.restartGame());

        this.playAgainBtn.addEventListener('click', () => {
            this.gameOverModal.style.display = 'none';
            this.restartGame();
        });

        // 鼠标事件 - 矩形选择
        this.gameGrid.addEventListener('mousedown', (e) => {
            if (!this.gameActive || e.button !== 0) return;

            const cell = e.target.closest('.grid-cell');
            if (!cell) return;

            this.isSelecting = true;
            this.selectionStart = {
                row: parseInt(cell.dataset.row),
                col: parseInt(cell.dataset.col)
            };
            this.selectionEnd = { ...this.selectionStart };

            this.updateSelectionRect(
                this.selectionStart.row,
                this.selectionStart.col,
                this.selectionEnd.row,
                this.selectionEnd.col
            );

            e.preventDefault();
        });

        this.gameGrid.addEventListener('mousemove', (e) => {
            if (!this.gameActive || !this.isSelecting) return;

            const cell = e.target.closest('.grid-cell');
            if (!cell) return;

            this.selectionEnd = {
                row: parseInt(cell.dataset.row),
                col: parseInt(cell.dataset.col)
            };

            this.updateSelectionRect(
                this.selectionStart.row,
                this.selectionStart.col,
                this.selectionEnd.row,
                this.selectionEnd.col
            );
        });

        this.gameGrid.addEventListener('mouseup', (e) => {
            if (!this.gameActive || !this.isSelecting) return;

            const cell = e.target.closest('.grid-cell');
            if (cell) {
                this.selectionEnd = {
                    row: parseInt(cell.dataset.row),
                    col: parseInt(cell.dataset.col)
                };
            }

            if (this.selectionStart && this.selectionEnd) {
                const startRow = Math.min(this.selectionStart.row, this.selectionEnd.row);
                const endRow = Math.max(this.selectionStart.row, this.selectionEnd.row);
                const startCol = Math.min(this.selectionStart.col, this.selectionEnd.col);
                const endCol = Math.max(this.selectionStart.col, this.selectionEnd.col);

                const success = this.checkSelection(startRow, startCol, endRow, endCol);
                if (success) {
                    this.renderGrid();
                    this.updateDisplay();
                }
            }

            this.clearSelection();
        });

        this.gameGrid.addEventListener('mouseleave', () => {
            if (this.isSelecting) {
                this.clearSelection();
            }
        });

        // 触摸设备支持
        let touchStartCell = null;

        this.gameGrid.addEventListener('touchstart', (e) => {
            if (!this.gameActive) return;

            const touch = e.touches[0];
            const cell = document.elementFromPoint(touch.clientX, touch.clientY);
            const gridCell = cell?.closest('.grid-cell');

            if (gridCell) {
                this.isSelecting = true;
                touchStartCell = gridCell;
                this.selectionStart = {
                    row: parseInt(gridCell.dataset.row),
                    col: parseInt(gridCell.dataset.col)
                };
                this.selectionEnd = { ...this.selectionStart };

                this.updateSelectionRect(
                    this.selectionStart.row,
                    this.selectionStart.col,
                    this.selectionEnd.row,
                    this.selectionEnd.col
                );

                e.preventDefault();
            }
        }, { passive: false });

        this.gameGrid.addEventListener('touchmove', (e) => {
            if (!this.gameActive || !this.isSelecting) return;

            const touch = e.touches[0];
            const cell = document.elementFromPoint(touch.clientX, touch.clientY);
            const gridCell = cell?.closest('.grid-cell');

            if (gridCell) {
                this.selectionEnd = {
                    row: parseInt(gridCell.dataset.row),
                    col: parseInt(gridCell.dataset.col)
                };

                this.updateSelectionRect(
                    this.selectionStart.row,
                    this.selectionStart.col,
                    this.selectionEnd.row,
                    this.selectionEnd.col
                );

                e.preventDefault();
            }
        }, { passive: false });

        this.gameGrid.addEventListener('touchend', (e) => {
            if (!this.gameActive || !this.isSelecting) return;

            const touch = e.changedTouches[0];
            const cell = document.elementFromPoint(touch.clientX, touch.clientY);
            const gridCell = cell?.closest('.grid-cell');

            if (gridCell) {
                this.selectionEnd = {
                    row: parseInt(gridCell.dataset.row),
                    col: parseInt(gridCell.dataset.col)
                };
            } else if (touchStartCell) {
                this.selectionEnd = {
                    row: parseInt(touchStartCell.dataset.row),
                    col: parseInt(touchStartCell.dataset.col)
                };
            }

            if (this.selectionStart && this.selectionEnd) {
                const startRow = Math.min(this.selectionStart.row, this.selectionEnd.row);
                const endRow = Math.max(this.selectionStart.row, this.selectionEnd.row);
                const startCol = Math.min(this.selectionStart.col, this.selectionEnd.col);
                const endCol = Math.max(this.selectionStart.col, this.selectionEnd.col);

                const success = this.checkSelection(startRow, startCol, endRow, endCol);
                if (success) {
                    this.renderGrid();
                    this.updateDisplay();
                }
            }

            this.clearSelection();
            touchStartCell = null;
        });

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;

            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    if (this.gameActive) {
                        this.pauseGame();
                    } else {
                        this.resumeGame();
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey) {
                        this.restartGame();
                    }
                    break;
                case 'Escape':
                    this.clearSelection();
                    break;
            }
        });
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new MergeTenGame();

    // 添加CSS样式用于成就通知
    const style = document.createElement('style');
    style.textContent = `
        .achievement-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--soft-green) 0%, var(--muted-teal) 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1002;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .achievement-notification i {
            font-size: 1.2rem;
        }

        .achievement-notification span {
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
});