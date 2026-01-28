// 数字华容道游戏
class NumberHuaronDao {
    constructor() {
        this.size = 4; // 默认4×4
        this.board = [];
        this.emptyPos = { row: 0, col: 0 };
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isPlaying = false;
        this.isWin = false;

        // DOM元素
        this.boardElement = document.getElementById('board');
        this.moveCountElement = document.getElementById('moveCount');
        this.timerElement = document.getElementById('timer');
        this.difficultyElement = document.getElementById('difficulty');
        this.winOverlay = document.getElementById('winOverlay');
        this.winMovesElement = document.getElementById('winMoves');
        this.winTimeElement = document.getElementById('winTime');
        this.tutorialPanel = document.getElementById('tutorialPanel');

        // 初始化
        this.initEventListeners();
        this.initBoard();
        this.updateDifficulty();
        this.updateBoardStyle();
    }

    // 初始化事件监听器
    initEventListeners() {
        // 规格选择按钮
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.size = parseInt(btn.dataset.size);
                this.updateDifficulty();
                this.updateBoardStyle();
                if (this.isPlaying) {
                    this.startNewGame();
                }
            });
        });

        // 新游戏按钮
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.startNewGame();
        });

        // 重新开始按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });

        // 提示按钮
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });

        // 教程按钮
        document.getElementById('tutorialBtn').addEventListener('click', () => {
            this.showTutorial();
        });

        // 再玩一次按钮
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.startNewGame();
            this.hideWinOverlay();
        });

        // 关闭教程按钮
        document.getElementById('closeTutorialBtn').addEventListener('click', () => {
            this.hideTutorial();
        });

        // 点击教程面板外部关闭
        this.tutorialPanel.addEventListener('click', (e) => {
            if (e.target === this.tutorialPanel) {
                this.hideTutorial();
            }
        });

        // ESC键关闭教程
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.tutorialPanel.classList.contains('active')) {
                this.hideTutorial();
            }
        });

        // 键盘控制（箭头键）
        document.addEventListener('keydown', (e) => {
            if (this.isPlaying && !this.isWin && !this.tutorialPanel.classList.contains('active')) {
                let targetRow = this.emptyPos.row;
                let targetCol = this.emptyPos.col;

                switch (e.key) {
                    case 'ArrowUp':
                        targetRow++;
                        break;
                    case 'ArrowDown':
                        targetRow--;
                        break;
                    case 'ArrowLeft':
                        targetCol++;
                        break;
                    case 'ArrowRight':
                        targetCol--;
                        break;
                    default:
                        return; // 不是箭头键，不做处理
                }

                // 检查目标位置是否在棋盘范围内
                if (targetRow >= 0 && targetRow < this.size && targetCol >= 0 && targetCol < this.size) {
                    this.moveTile(targetRow, targetCol);
                    e.preventDefault(); // 防止滚动页面
                }
            }
        });
    }

    // 更新难度显示
    updateDifficulty() {
        let difficulty;
        if (this.size === 4) difficulty = '简单';
        else if (this.size === 5) difficulty = '中等';
        else if (this.size === 6) difficulty = '困难';
        else difficulty = '极难';

        this.difficultyElement.textContent = difficulty;
    }

    // 更新棋盘样式
    updateBoardStyle() {
        this.boardElement.style.setProperty('--size', this.size);
        this.boardElement.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
    }

    // 初始化棋盘
    initBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
    }

    // 生成初始棋盘
    generateBoard() {
        // 创建有序数组
        const totalTiles = this.size * this.size;
        const numbers = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
        numbers.push(null); // 空位

        // 随机打乱（确保有解）
        let shuffled;
        do {
            shuffled = this.shuffleArray([...numbers]);
        } while (!this.isSolvable(shuffled));

        // 转换为二维数组
        this.board = [];
        for (let i = 0; i < this.size; i++) {
            const row = [];
            for (let j = 0; j < this.size; j++) {
                const index = i * this.size + j;
                const value = shuffled[index];
                row.push(value);

                if (value === null) {
                    this.emptyPos = { row: i, col: j };
                }
            }
            this.board.push(row);
        }
    }

    // 洗牌算法
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // 检查是否有解
    isSolvable(array) {
        // 对于数字华容道，只有当逆序数为偶数时有解
        const flatArray = array.filter(val => val !== null);
        let inversions = 0;

        for (let i = 0; i < flatArray.length; i++) {
            for (let j = i + 1; j < flatArray.length; j++) {
                if (flatArray[i] > flatArray[j]) {
                    inversions++;
                }
            }
        }

        // 对于偶数尺寸，需要考虑空位所在行数
        if (this.size % 2 === 0) {
            // 找到空位在原始数组中的位置
            const emptyIndex = array.indexOf(null);
            const emptyRowFromBottom = this.size - Math.floor(emptyIndex / this.size);
            return (inversions % 2 === 0) !== (emptyRowFromBottom % 2 === 1);
        } else {
            // 奇数尺寸：逆序数必须为偶数
            return inversions % 2 === 0;
        }
    }

    // 渲染棋盘
    renderBoard() {
        this.boardElement.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.board[i][j];
                const tile = document.createElement('div');

                if (value === null) {
                    tile.className = 'tile empty';
                    tile.textContent = '';
                } else {
                    tile.className = 'tile';
                    tile.textContent = value;
                    tile.dataset.row = i;
                    tile.dataset.col = j;

                    tile.addEventListener('click', () => {
                        if (!this.isWin) {
                            this.moveTile(i, j);
                        }
                    });
                }

                this.boardElement.appendChild(tile);
            }
        }
    }

    // 移动方块
    moveTile(row, col) {
        // 检查是否与空位相邻
        const rowDiff = Math.abs(row - this.emptyPos.row);
        const colDiff = Math.abs(col - this.emptyPos.col);

        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            // 交换位置
            [this.board[this.emptyPos.row][this.emptyPos.col], this.board[row][col]] =
            [this.board[row][col], this.board[this.emptyPos.row][this.emptyPos.col]];

            // 更新空位位置
            this.emptyPos = { row, col };

            // 增加步数
            this.moves++;
            this.moveCountElement.textContent = this.moves;

            // 重新渲染
            this.renderBoard();

            // 检查是否获胜
            if (this.checkWin()) {
                this.winGame();
            }
        }
    }

    // 检查是否获胜
    checkWin() {
        let expected = 1;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (i === this.size - 1 && j === this.size - 1) {
                    // 最后一个位置应该是空的
                    if (this.board[i][j] !== null) return false;
                } else {
                    if (this.board[i][j] !== expected) return false;
                    expected++;
                }
            }
        }
        return true;
    }

    // 开始新游戏
    startNewGame() {
        // 停止当前计时器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // 重置状态
        this.moves = 0;
        this.timer = 0;
        this.isPlaying = true;
        this.isWin = false;

        // 更新显示
        this.moveCountElement.textContent = '0';
        this.updateTimerDisplay();
        this.hideWinOverlay();

        // 生成棋盘
        this.generateBoard();
        this.renderBoard();

        // 开始计时
        this.startTimer();
    }

    // 重置游戏
    resetGame() {
        if (this.isPlaying) {
            this.startNewGame();
        }
    }

    // 开始计时器
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    // 更新计时器显示
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        this.timerElement.textContent = `${minutes}:${seconds}`;
    }

    // 显示提示
    showHint() {
        if (!this.isPlaying || this.isWin) return;

        // 找到可以移动的方块
        const directions = [
            { row: -1, col: 0 }, // 上
            { row: 1, col: 0 },  // 下
            { row: 0, col: -1 }, // 左
            { row: 0, col: 1 }   // 右
        ];

        const validMoves = [];

        for (const dir of directions) {
            const newRow = this.emptyPos.row + dir.row;
            const newCol = this.emptyPos.col + dir.col;

            if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
                validMoves.push({ row: newRow, col: newCol });
            }
        }

        if (validMoves.length > 0) {
            // 随机选择一个可移动的方块高亮
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            const tile = document.querySelector(`.tile[data-row="${move.row}"][data-col="${move.col}"]`);

            if (tile) {
                // 添加高亮效果
                tile.style.boxShadow = '0 0 20px gold, 0 0 30px gold';
                tile.style.transform = 'scale(1.1)';
                tile.style.zIndex = '5';

                // 2秒后移除高亮
                setTimeout(() => {
                    tile.style.boxShadow = '';
                    tile.style.transform = '';
                    tile.style.zIndex = '';
                }, 2000);
            }
        }
    }

    // 获胜处理
    winGame() {
        this.isWin = true;
        this.isPlaying = false;

        // 停止计时器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // 更新获胜统计
        this.winMovesElement.textContent = this.moves;
        this.winTimeElement.textContent = this.timerElement.textContent;

        // 显示获胜弹窗
        this.showWinOverlay();
    }

    // 显示获胜弹窗
    showWinOverlay() {
        this.winOverlay.classList.add('active');
    }

    // 隐藏获胜弹窗
    hideWinOverlay() {
        this.winOverlay.classList.remove('active');
    }

    // 显示教程
    showTutorial() {
        this.tutorialPanel.classList.add('active');
    }

    // 隐藏教程
    hideTutorial() {
        this.tutorialPanel.classList.remove('active');
    }

    // 获取棋盘状态（用于调试）
    getBoardState() {
        return this.board.map(row => [...row]);
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new NumberHuaronDao();
    // 自动开始一个游戏
    game.startNewGame();

    // 暴露游戏对象到全局（用于调试）
    window.game = game;
});