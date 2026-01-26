// 游戏配置
const CARD_COLORS = ['🍎', '🍊', '🍇', '🥝', '🍓', '🫐', '🍑', '🍒', '🍋', '🥭', '🍉', '🥥'];
const SLOT_LIMIT = 7;
const DEFAULT_LAYERS = 11;
const REVIVE_CHANCES = 2;

class SheepGame {
    constructor() {
        this.slots = [];
        this.revives = REVIVE_CHANCES;
        this.gameOver = false;
        this.victory = false;
        this.cells = []; // 网格单元格数组

        this.initializeGame();
        this.bindEvents();
    }

    // 初始化游戏
    initializeGame() {
        this.slots = [];
        this.resetGameState();
        this.cells = this.generateCells();
        this.renderCells();
        this.renderSlots();
        this.updateStats();
    }

    // 重置游戏状态
    resetGameState() {
        this.revives = REVIVE_CHANCES;
        this.gameOver = false;
        this.victory = false;
        document.getElementById('game-over-modal').classList.remove('show');
        document.getElementById('victory-modal').classList.remove('show');
        document.getElementById('revive-btn').disabled = false;
    }

    // 生成网格单元格（真正的叠放）
    generateCells() {
        const GRID_COLS = 10;  // 10列
        const GRID_ROWS = 6;   // 6行
        const CELL_COUNT = GRID_COLS * GRID_ROWS;

        // 生成所有卡片 - 确保每个单元格有足够的层数
        const totalCards = 11 * CELL_COUNT; // 每个单元格平均11层
        const cardTypes = [];

        // 确保数量是3的倍数
        const countPerType = Math.floor(totalCards / CARD_COLORS.length / 3) * 3;
        CARD_COLORS.forEach(color => {
            for (let i = 0; i < countPerType; i++) {
                cardTypes.push(color);
            }
        });

        // 补充剩余
        while (cardTypes.length < totalCards) {
            cardTypes.push(CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)]);
        }
        cardTypes.splice(totalCards);
        this.shuffleArray(cardTypes);

        // 创建网格单元格
        const cells = [];
        for (let cell = 0; cell < CELL_COUNT; cell++) {
            const row = Math.floor(cell / GRID_COLS);
            const col = cell % GRID_COLS;

            // 这个单元格的卡片栈（确保2-6层，创造重叠效果）
            const stack = [];

            // 确保每个单元格至少有2层，最多6层
            const minLayers = 2;
            const maxLayers = Math.min(DEFAULT_LAYERS, minLayers + Math.floor(Math.random() * 4));

            for (let layer = 0; layer < maxLayers; layer++) {
                if (cardTypes.length > 0) {
                    stack.push({
                        type: cardTypes.pop(),
                        layer: layer
                    });
                }
            }

            cells.push({
                id: `cell-${row}-${col}`,
                row: row,
                col: col,
                x: 20 + col * 50,
                y: 20 + row * 50,
                stack: stack, // 卡片栈，从上到下
                visibleLayer: 0 // 当前可见的层
            });
        }

        // 更新所有单元格的状态
        this.updateAllCells(cells);

        return cells;
    }

    // 更新所有单元格状态
    updateAllCells(cells) {
        cells.forEach(cell => {
            if (cell.stack.length === 0) {
                cell.type = null;
                cell.displayType = null;
                cell.hasUnderlying = false;
                cell.blocked = true;
                return;
            }

            // 获取可见的卡片（最上层）
            const visibleCard = cell.stack[cell.stack.length - 1];
            cell.type = visibleCard.type;

            // 标记是否有下层卡片（用于视觉提示）
            cell.hasUnderlying = cell.stack.length > 1;

            // 检查是否被阻挡（被4个方向相邻单元格的上层卡片遮挡）
            let upperBlockingCount = 0;

            // 只检查上下左右4个方向（不检查对角线）
            const directions = [
                {row: -1, col: 0}, // 上
                {row: 1, col: 0},  // 下
                {row: 0, col: -1}, // 左
                {row: 0, col: 1}   // 右
            ];

            directions.forEach(dir => {
                const neighborRow = cell.row + dir.row;
                const neighborCol = cell.col + dir.col;

                // 找到相邻单元格
                const neighborCell = cells.find(c => c.row === neighborRow && c.col === neighborCol);

                if (neighborCell && neighborCell.stack.length > cell.stack.length) {
                    upperBlockingCount++;
                }
            });

            // 如果被2个或更多相邻单元格遮挡，才显示问号（这样会有更多明牌）
            if (upperBlockingCount >= 2) {
                cell.displayType = '❓';
                cell.blocked = true; // 被遮挡，不可点击
            } else {
                // 如果没有被遮挡，显示明牌且可点击
                cell.displayType = cell.type;
                cell.blocked = false; // 没有被遮挡，可以点击
            }
        });
    }

    // 更新单元格（当卡片被移除后）
    updateCell(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (!cell) return;

        // 移除最上层卡片
        if (cell.stack.length > 0) {
            cell.stack.pop();
        }

        // 重新计算状态
        this.updateAllCells(this.cells);
        this.renderCells();
    }

    // 渲染网格
    renderCells() {
        const layersContainer = document.getElementById('card-layers');
        layersContainer.innerHTML = '';

        this.cells.forEach(cell => {
            if (cell.stack.length === 0) return;

            const cardElement = document.createElement('div');
            cardElement.className = 'card ' + (cell.displayType === '❓' ? 'card-unknown' : `fruit-${cell.type}`);
            cardElement.textContent = cell.displayType === '❓' ? '❓' : cell.type;
            cardElement.dataset.cellId = cell.id;
            cardElement.style.left = `${cell.x}px`;
            cardElement.style.top = `${cell.y}px`;
            cardElement.style.zIndex = 100 + cell.row * 10 + cell.col;

            // 样式处理
            if (cell.blocked) {
                // 被相邻单元格遮挡，不可点击
                cardElement.classList.add('blocked');
            } else if (cell.hasUnderlying) {
                // 有下层卡片，但可以点击，添加特殊样式提示
                cardElement.style.border = '3px solid gold';
                cardElement.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)';
            }

            layersContainer.appendChild(cardElement);
        });
    }

    // 渲染槽位
    renderSlots() {
        const slotsContainer = document.getElementById('slots');
        slotsContainer.innerHTML = '';

        for (let i = 0; i < SLOT_LIMIT; i++) {
            const slotElement = document.createElement('div');
            slotElement.className = 'slot-card';

            if (this.slots[i]) {
                slotElement.textContent = this.slots[i].type;
                slotElement.className += ` fruit-${this.slots[i].type}`;
            }

            slotsContainer.appendChild(slotElement);
        }
    }

    // 更新统计
    updateStats() {
        const remainingCards = this.cells.reduce((total, cell) =>
            total + cell.stack.length, 0
        );

        document.getElementById('remaining-cards').textContent = remainingCards;
        document.getElementById('revive-count').textContent = this.revives;
    }

    // 检查胜利
    checkVictory() {
        return this.cells.every(cell => cell.stack.length === 0);
    }

    // 检查游戏结束
    checkGameOver() {
        return this.slots.length >= SLOT_LIMIT;
    }

    // 处理点击
    handleCardClick(cardElement) {
        if (this.gameOver || this.checkGameOver()) {
            this.triggerGameOver();
            return;
        }

        const cellId = cardElement.dataset.cellId;
        const cell = this.cells.find(c => c.id === cellId);

        if (!cell || cell.blocked || cell.stack.length === 0) {
            return;
        }

        // 选择卡片
        const card = cell.stack[cell.stack.length - 1];
        this.selectCard(card, cell);
    }

    // 选择卡片
    selectCard(card, cell) {
        this.slots.push({ type: card.type });
        this.updateCell(cell.id);

        // 检查匹配
        this.checkAndRemoveMatches();
        this.renderSlots();
        this.updateStats();

        // 检查游戏状态
        if (this.checkVictory()) {
            this.triggerVictory();
            return;
        }

        if (this.checkGameOver()) {
            this.triggerGameOver();
            return;
        }
    }

    // 检查并移除匹配
    checkAndRemoveMatches() {
        const typeCount = {};
        this.slots.forEach((card, index) => {
            if (card.type !== null) {
                if (!typeCount[card.type]) {
                    typeCount[card.type] = [];
                }
                typeCount[card.type].push(index);
            }
        });

        Object.keys(typeCount).forEach(type => {
            const indices = typeCount[type];
            if (indices.length >= 3) {
                for (let i = 0; i < 3; i++) {
                    this.slots[indices[i]] = null;
                }
            }
        });

        this.slots = this.slots.filter(card => card !== null);
    }

    // 触发游戏结束
    triggerGameOver() {
        this.gameOver = true;
        const modal = document.getElementById('game-over-modal');
        modal.classList.add('show');

        const reviveBtn = document.getElementById('revive-btn');
        if (this.revives <= 0) {
            reviveBtn.disabled = true;
            reviveBtn.textContent = '复活次数已用完';
        }
    }

    // 触发胜利
    triggerVictory() {
        this.victory = true;
        document.getElementById('victory-modal').classList.add('show');
    }

    // 复活
    revive() {
        if (this.revives <= 0) return;

        this.revives--;
        this.slots = this.slots.slice(0, -3);

        document.getElementById('game-over-modal').classList.remove('show');
        this.gameOver = false;

        this.renderSlots();
        this.updateStats();
    }

    // 洗牌
    shuffleRemainingCards() {
        const remainingCards = [];
        this.cells.forEach(cell => {
            if (cell.stack.length > 0) {
                remainingCards.push({ cellId: cell.id, stack: [...cell.stack] });
            }
        });

        // 打乱
        this.shuffleArray(remainingCards);

        // 重新分配
        this.cells.forEach(cell => {
            if (cell.stack.length > 0) {
                const shuffled = remainingCards.pop();
                if (shuffled) {
                    cell.stack = shuffled.stack;
                }
            }
        });

        this.updateAllCells(this.cells);
        this.renderCells();
    }

    // 洗牌数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 绑定事件
    bindEvents() {
        document.getElementById('card-layers').addEventListener('click', (e) => {
            if (e.target.classList.contains('card') && !e.target.classList.contains('blocked')) {
                this.handleCardClick(e.target);
            }
        });

        document.getElementById('shuffle-btn').addEventListener('click', () => {
            if (!this.gameOver && !this.victory) {
                this.shuffleRemainingCards();
            }
        });

        document.getElementById('revive-btn').addEventListener('click', () => {
            if (this.gameOver && this.revives > 0 && !this.victory) {
                this.revive();
            }
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.initializeGame();
        });

        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.initializeGame();
        });
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new SheepGame();
});
