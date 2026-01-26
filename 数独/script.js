/* 简约数独 - 游戏逻辑 */

// 游戏状态
const GameState = {
    mode: 'classic', // 'classic' 或 'continuous'
    selectedMode: null, // 用户选择的模式
    difficulty: 'hard', // 'medium', 'hard', 'master', 'continuous-hard', 'continuous-master'
    selectedDifficulty: null, // 用户选择的难度
    board: Array(9).fill().map(() => Array(9).fill(0)),
    solution: Array(9).fill().map(() => Array(9).fill(0)),
    initialBoard: Array(9).fill().map(() => Array(9).fill(0)),
    selectedCell: null,
    selectedNumber: null, // 当前选中的数字（用于高亮）
    hints: 3,
    energy: 4, // 体力，一局有4个体力，不能错超过3个
    timer: 0,
    timerInterval: null,
    isPlaying: false,
    isContinuousMode: false,
    continuousProgress: 1,
    continuousTotal: 5,
    // 连续数独特定状态
    constraints: {
        lines: [] // [{r1, c1, r2, c2}] 灰色粗线约束，表示相邻单元格数字必须连续（差值为1）
    }
};

// DOM 元素
const elements = {
    // 屏幕
    homeScreen: document.getElementById('home-screen'),
    difficultyScreen: document.getElementById('difficulty-screen'),
    gameScreen: document.getElementById('game-screen'),

    // 主页元素
    modeOptions: document.querySelectorAll('.mode-option'),
    continueBtn: document.getElementById('continue-btn'),

    // 难度选择元素
    selectedModeDisplay: document.getElementById('selected-mode'),
    difficultyOptions: document.getElementById('difficulty-options'),
    backToModeBtn: document.getElementById('back-to-mode-btn'),
    startGameBtn: document.getElementById('start-game-btn'),

    // 游戏屏幕元素
    sudokuGrid: document.getElementById('sudoku-grid'),
    timer: document.getElementById('timer'),
    hintsLeft: document.getElementById('hints-left'),
    energyLeft: document.getElementById('energy-left'),
    continuousProgress: document.getElementById('continuous-progress'),
    currentModeDisplay: document.getElementById('current-mode-display'),
    currentDifficultyDisplay: document.getElementById('current-difficulty-display'),
    newGameBtn: document.getElementById('new-game-btn'),
    hintBtn: document.getElementById('hint-btn'),
    checkBtn: document.getElementById('check-btn'),
    solveBtn: document.getElementById('solve-btn'),
    backToMenuBtn: document.getElementById('back-to-menu-btn'),
    numberButtons: document.querySelectorAll('.number-btn'),
    classicInstructions: document.getElementById('classic-instructions'),
    continuousInstructions: document.getElementById('continuous-instructions'),

    // 模态框
    rulesLink: document.getElementById('rules-link'),
    aboutLink: document.getElementById('about-link'),
    rulesModal: document.getElementById('rules-modal'),
    aboutModal: document.getElementById('about-modal'),
    closeModalButtons: document.querySelectorAll('.close-modal'),
};

// 初始化游戏
function initGame() {
    createSudokuGrid();
    attachEventListeners();

    // 初始显示主页
    showScreen('home');

    // 初始化游戏状态
    GameState.selectedMode = null;
    GameState.isPlaying = false;

    // 生成难度选项
    generateDifficultyOptions();
}

// 创建数独网格
function createSudokuGrid() {
    elements.sudokuGrid.innerHTML = '';

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // 添加3x3宫格背景色区分
            const blockRow = Math.floor(row / 3);
            const blockCol = Math.floor(col / 3);
            if ((blockRow + blockCol) % 2 === 0) {
                cell.classList.add('highlight');
            }

            cell.addEventListener('click', () => selectCell(row, col));
            elements.sudokuGrid.appendChild(cell);
        }
    }
}

// 附加事件监听器
function attachEventListeners() {
    // 主页：模式选择
    elements.modeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const mode = this.dataset.mode;
            selectMode(mode);
        });
    });

    elements.continueBtn.addEventListener('click', () => {
        if (GameState.selectedMode) {
            showScreen('difficulty');
        }
    });

    // 难度选择屏幕
    elements.backToModeBtn.addEventListener('click', () => {
        showScreen('home');
    });

    elements.startGameBtn.addEventListener('click', startGame);

    // 游戏屏幕
    elements.newGameBtn.addEventListener('click', generateNewGame);
    elements.hintBtn.addEventListener('click', giveHint);
    elements.checkBtn.addEventListener('click', checkBoard);
    elements.solveBtn.addEventListener('click', solvePuzzle);
    elements.backToMenuBtn.addEventListener('click', () => {
        showScreen('home');
        stopTimer();
        GameState.isPlaying = false;
    });

    // 数字选择
    elements.numberButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const number = parseInt(this.dataset.number);
            if (GameState.selectedCell) {
                placeNumber(GameState.selectedCell.row, GameState.selectedCell.col, number);
            }
        });
    });

    // 模态框
    elements.rulesLink.addEventListener('click', (e) => {
        e.preventDefault();
        showModal(elements.rulesModal);
    });

    elements.aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        showModal(elements.aboutModal);
    });

    elements.closeModalButtons.forEach(btn => {
        btn.addEventListener('click', hideAllModals);
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideAllModals();
        }
    });

    // 键盘输入
    document.addEventListener('keydown', handleKeyPress);

    // 窗口大小改变时重新绘制约束
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (GameState.mode === 'continuous' && GameState.isPlaying) {
                drawConstraints();
            }
        }, 250);
    });
}

// 屏幕管理函数
function showScreen(screenName) {
    // 隐藏所有屏幕
    elements.homeScreen.classList.remove('active');
    elements.difficultyScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');

    // 显示目标屏幕
    switch (screenName) {
        case 'home':
            elements.homeScreen.classList.add('active');
            break;
        case 'difficulty':
            elements.difficultyScreen.classList.add('active');
            updateDifficultyScreen();
            break;
        case 'game':
            elements.gameScreen.classList.add('active');
            break;
    }
}

// 选择模式
function selectMode(mode) {
    // 移除之前的选择
    elements.modeOptions.forEach(option => {
        option.classList.remove('selected');
    });

    // 标记当前选择
    const selectedOption = document.querySelector(`[data-mode="${mode}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        GameState.selectedMode = mode;
        elements.continueBtn.disabled = false;
    }
}

// 更新难度选择屏幕
function updateDifficultyScreen() {
    if (!GameState.selectedMode) return;

    const modeName = GameState.selectedMode === 'classic' ? '经典数独' : '连续数独';
    elements.selectedModeDisplay.textContent = modeName;
}

// 生成难度选项
function generateDifficultyOptions() {
    elements.difficultyOptions.innerHTML = '';

    const difficulties = GameState.selectedMode === 'classic' ?
        [
            { id: 'medium', name: '中等', icon: 'star', description: '适合初学者', stats: '约35个已知数字' },
            { id: 'hard', name: '困难', icon: 'star-half-alt', description: '需要逻辑推理', stats: '约25个已知数字' },
            { id: 'master', name: '大师', icon: 'star-and-crescent', description: '需假设推理', stats: '难度在困难与大师之间' }
        ] :
        [
            { id: 'continuous-hard', name: '困难', icon: 'fire', description: '中等难度连续数独', stats: '约30个已知数字和连续性标记' },
            { id: 'continuous-master', name: '大师', icon: 'dragon', description: '高难度连续数独', stats: '约20个已知数字和连续性标记，需假设推理' }
        ];

    difficulties.forEach(diff => {
        const option = document.createElement('div');
        option.className = 'difficulty-option';
        option.dataset.difficulty = diff.id;

        option.innerHTML = `
            <h3><i class="fas fa-${diff.icon}"></i> ${diff.name}</h3>
            <p class="description">${diff.description}</p>
            <div class="difficulty-stats">${diff.stats}</div>
        `;

        option.addEventListener('click', function() {
            // 移除之前的选择
            document.querySelectorAll('.difficulty-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            // 标记当前选择
            this.classList.add('selected');
            GameState.selectedDifficulty = diff.id;
        });

        elements.difficultyOptions.appendChild(option);
    });

    // 默认选择第一个难度
    const firstOption = elements.difficultyOptions.querySelector('.difficulty-option');
    if (firstOption) {
        firstOption.classList.add('selected');
        GameState.selectedDifficulty = firstOption.dataset.difficulty;
    }
}

// 开始游戏
function startGame() {
    if (!GameState.selectedMode || !GameState.selectedDifficulty) {
        alert('请先选择模式和难度！');
        return;
    }

    // 设置游戏状态
    GameState.mode = GameState.selectedMode;
    GameState.difficulty = GameState.selectedDifficulty;
    GameState.isContinuousMode = GameState.selectedMode === 'continuous';

    // 更新显示
    const modeName = GameState.mode === 'classic' ? '经典数独' : '连续数独';
    const difficultyName = GameState.selectedDifficulty.includes('master') ? '大师' :
                          GameState.selectedDifficulty.includes('hard') ? '困难' : '中等';

    elements.currentModeDisplay.textContent = modeName;
    elements.currentDifficultyDisplay.textContent = difficultyName;

    // 显示对应的游戏说明
    if (GameState.mode === 'classic') {
        elements.classicInstructions.classList.remove('hidden');
        elements.continuousInstructions.classList.add('hidden');
    } else {
        elements.classicInstructions.classList.add('hidden');
        elements.continuousInstructions.classList.remove('hidden');
    }

    // 切换到游戏屏幕
    showScreen('game');

    // 开始新游戏
    setTimeout(() => {
        generateNewGame();
    }, 100);
}

// 切换游戏模式
function switchMode(mode) {
    // 此函数已弃用，使用新的屏幕导航流程
    // GameState.mode = mode;
    // GameState.isContinuousMode = mode === 'continuous';

    // // 更新UI
    // if (mode === 'classic') {
    //     elements.classicModeBtn.classList.add('active');
    //     elements.continuousModeBtn.classList.remove('active');
    //     elements.classicInstructions.classList.remove('hidden');
    //     elements.continuousInstructions.classList.add('hidden');
    //     document.body.classList.remove('continuous-mode');
    // } else {
    //     elements.classicModeBtn.classList.remove('active');
    //     elements.continuousModeBtn.classList.add('active');
    //     elements.classicInstructions.classList.add('hidden');
    //     elements.continuousInstructions.classList.remove('hidden');
    //     document.body.classList.add('continuous-mode');
    // }

    // updateUI();
}

// 设置难度
function setDifficulty(difficulty) {
    // 此函数已弃用，使用新的屏幕导航流程
    // // 移除所有难度按钮的active类
    // elements.difficultyButtons.forEach(btn => btn.classList.remove('active'));

    // // 为当前难度按钮添加active类
    // const activeBtn = document.querySelector(`[data-difficulty="${difficulty}"]`);
    // if (activeBtn) {
    //     activeBtn.classList.add('active');
    // }

    // GameState.difficulty = difficulty;

    // // 如果切换到连续模式难度，显示连续难度选择器
    // if (difficulty.startsWith('continuous')) {
    //     elements.continuousDifficulty.classList.remove('hidden');
    // } else {
    //     elements.continuousDifficulty.classList.add('hidden');
    // }
}

// 更新UI
function updateUI() {
    // 更新计时器显示
    updateTimerDisplay();

    // 更新提示数量
    elements.hintsLeft.textContent = GameState.hints;
    elements.hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> 提示 (${GameState.hints})`;

    // 更新体力
    elements.energyLeft.textContent = GameState.energy;

    // 更新连续进度
    elements.continuousProgress.textContent = `${GameState.continuousProgress}/${GameState.continuousTotal}`;

    // 更新数独棋盘
    updateBoardDisplay();
}

// 更新计时器显示
function updateTimerDisplay() {
    const minutes = Math.floor(GameState.timer / 60);
    const seconds = GameState.timer % 60;
    elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 开始计时器
function startTimer() {
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
    }

    GameState.timerInterval = setInterval(() => {
        GameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

// 停止计时器
function stopTimer() {
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
        GameState.timerInterval = null;
    }
}

// 重置计时器
function resetTimer() {
    stopTimer();
    GameState.timer = 0;
    updateTimerDisplay();
}

// 生成新游戏
function generateNewGame() {
    resetTimer();
    GameState.hints = 3;
    GameState.energy = 4; // 初始化体力为4
    GameState.isPlaying = true;
    GameState.selectedCell = null;
    GameState.continuousProgress = 1;

    // 根据模式和难度生成谜题
    if (GameState.mode === 'classic') {
        generateClassicPuzzle();
    } else {
        generateContinuousPuzzle();
    }

    // 更新棋盘显示
    updateBoardDisplay();

    // 开始计时
    startTimer();

    // 更新UI
    updateUI();
}

// 生成经典数独谜题
function generateClassicPuzzle() {
    // 创建完整解决方案
    generateSolution();

    // 根据难度移除数字
    let clues;
    switch (GameState.difficulty) {
        case 'medium':
            clues = 35;
            break;
        case 'hard':
            clues = 25;
            break;
        case 'master':
            clues = 20;
            break;
        default:
            clues = 25;
    }

    // 复制解决方案到初始棋盘
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            GameState.solution[r][c] = GameState.board[r][c];
        }
    }

    // 移除数字创建谜题
    createPuzzleFromSolution(clues);
}

// 生成连续数独谜题
function generateContinuousPuzzle() {
    // 为连续数独生成解决方案（考虑连续性约束）
    generateContinuousSolution();

    // 根据难度设置线索数量
    let clues;
    switch (GameState.difficulty) {
        case 'continuous-hard':
            clues = 30;
            break;
        case 'continuous-master':
            clues = 20;
            break;
        default:
            clues = 30;
    }

    // 创建谜题
    createPuzzleFromSolution(clues);

    // 生成连续性约束标记
    generateConstraints();
}

// 生成完整解决方案（经典数独）
function generateSolution() {
    // 重置棋盘
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            GameState.board[r][c] = 0;
        }
    }

    // 简单生成一个有效解决方案
    // 实际实现应使用回溯算法，这里为简化使用预生成模式
    const baseSolution = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];

    // 随机变换增加多样性
    const transformed = transformSolution(baseSolution);

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            GameState.board[r][c] = transformed[r][c];
        }
    }
}

// 生成连续数独解决方案
function generateContinuousSolution() {
    // 这里简化实现：先生成经典解决方案，然后调整以满足连续性约束
    generateSolution();

    // 实际连续数独需要特殊算法生成，这里简化处理
    // 将经典解决方案复制到solution
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            GameState.solution[r][c] = GameState.board[r][c];
        }
    }
}

// 生成连续性约束 - 基于解决方案生成灰色粗线
function generateConstraints() {
    GameState.constraints.lines = [];

    // 收集所有可能的相邻单元格对
    const possibleConstraints = [];

    // 水平相邻对（左右）
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 8; c++) {
            possibleConstraints.push({ r1: r, c1: c, r2: r, c2: c + 1 });
        }
    }

    // 垂直相邻对（上下）
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 9; c++) {
            possibleConstraints.push({ r1: r, c1: c, r2: r + 1, c2: c });
        }
    }

    // 筛选出解决方案中数字差为1的约束
    const validConstraints = possibleConstraints.filter(constraint => {
        const { r1, c1, r2, c2 } = constraint;
        const val1 = GameState.solution[r1][c1];
        const val2 = GameState.solution[r2][c2];
        return Math.abs(val1 - val2) === 1; // 数字连续
    });

    // 根据难度选择约束数量
    const targetConstraints = GameState.difficulty === 'continuous-master' ? 25 : 35;

    // 随机选择有效约束，确保分布均匀
    if (validConstraints.length > 0) {
        // 打乱有效约束数组
        for (let i = validConstraints.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validConstraints[i], validConstraints[j]] = [validConstraints[j], validConstraints[i]];
        }

        // 选择前targetConstraints个约束，但不超过有效约束总数
        const count = Math.min(targetConstraints, validConstraints.length);
        GameState.constraints.lines = validConstraints.slice(0, count);
    } else {
        // 如果没有找到连续数字对，生成少量随机约束（游戏可能无解，但至少可以玩）
        console.warn('警告：解决方案中没有连续数字对，生成随机约束');
        const count = Math.min(targetConstraints, possibleConstraints.length);
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * possibleConstraints.length);
            GameState.constraints.lines.push(possibleConstraints[randomIndex]);
        }
    }
}

// 从解决方案创建谜题（移除数字）
function createPuzzleFromSolution(clues) {
    // 复制解决方案到棋盘
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            GameState.board[r][c] = GameState.solution[r][c];
            GameState.initialBoard[r][c] = GameState.solution[r][c];
        }
    }

    // 需要移除的数字数量
    const cellsToRemove = 81 - clues;

    // 随机移除数字，确保唯一解
    let removed = 0;
    while (removed < cellsToRemove) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);

        if (GameState.board[r][c] !== 0) {
            const temp = GameState.board[r][c];
            GameState.board[r][c] = 0;
            GameState.initialBoard[r][c] = 0;

            // 简化：假设总是有唯一解（实际应检查）
            removed++;
        }
    }
}

// 变换解决方案增加多样性
function transformSolution(board) {
    const newBoard = JSON.parse(JSON.stringify(board));

    // 随机交换行（在同一宫内）
    for (let block = 0; block < 3; block++) {
        if (Math.random() > 0.5) {
            const r1 = block * 3 + Math.floor(Math.random() * 3);
            const r2 = block * 3 + Math.floor(Math.random() * 3);
            if (r1 !== r2) {
                [newBoard[r1], newBoard[r2]] = [newBoard[r2], newBoard[r1]];
            }
        }
    }

    // 随机交换列（在同一宫内）
    for (let block = 0; block < 3; block++) {
        if (Math.random() > 0.5) {
            const c1 = block * 3 + Math.floor(Math.random() * 3);
            const c2 = block * 3 + Math.floor(Math.random() * 3);
            if (c1 !== c2) {
                for (let r = 0; r < 9; r++) {
                    [newBoard[r][c1], newBoard[r][c2]] = [newBoard[r][c2], newBoard[r][c1]];
                }
            }
        }
    }

    return newBoard;
}

// 选择单元格
function selectCell(row, col) {
    if (!GameState.isPlaying) return;

    // 移除之前选中的样式
    clearSelection();

    // 设置新选中的单元格
    GameState.selectedCell = { row, col };

    // 添加选中样式
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.add('selected');

        // 高亮同行同列同宫
        highlightRelatedCells(row, col);

        // 高亮相同数字
        highlightSameNumbers(row, col);
    }
}

// 清除选中样式
function clearSelection() {
    document.querySelectorAll('.sudoku-cell').forEach(cell => {
        cell.classList.remove('selected', 'error', 'highlight-related', 'same-number');
    });
    GameState.selectedNumber = null;
}

// 高亮相关单元格
function highlightRelatedCells(row, col) {
    // 高亮行
    for (let c = 0; c < 9; c++) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${c}"]`);
        if (cell && !cell.classList.contains('selected')) {
            cell.classList.add('highlight-related');
        }
    }

    // 高亮列
    for (let r = 0; r < 9; r++) {
        const cell = document.querySelector(`[data-row="${r}"][data-col="${col}"]`);
        if (cell && !cell.classList.contains('selected')) {
            cell.classList.add('highlight-related');
        }
    }

    // 高亮宫
    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;

    for (let r = blockRow; r < blockRow + 3; r++) {
        for (let c = blockCol; c < blockCol + 3; c++) {
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (cell && !cell.classList.contains('selected')) {
                cell.classList.add('highlight-related');
            }
        }
    }
}

// 高亮相同数字的单元格
function highlightSameNumbers(row, col) {
    const selectedNumber = GameState.board[row][col];
    if (selectedNumber === 0) {
        GameState.selectedNumber = null;
        return;
    }

    GameState.selectedNumber = selectedNumber;

    // 高亮所有相同数字的单元格
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (GameState.board[r][c] === selectedNumber) {
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.classList.add('same-number');
                }
            }
        }
    }
}

// 放置数字
function placeNumber(row, col, number) {
    if (!GameState.isPlaying || GameState.initialBoard[row][col] !== 0) {
        return;
    }

    // 更新棋盘
    GameState.board[row][col] = number;

    // 更新显示
    updateCellDisplay(row, col);

    // 检查数字是否正确（与solution比较）
    if (number !== 0 && GameState.board[row][col] !== GameState.solution[row][col]) {
        markCellError(row, col);
    } else {
        clearCellError(row, col);
    }

    // 如果是连续模式，检查该单元格相关的连续性约束
    if (GameState.mode === 'continuous' && number !== 0) {
        checkCellConstraints(row, col);
    }

    // 检查是否完成
    if (checkIfComplete()) {
        gameComplete();
    }

    // 如果当前有选中的单元格，重新高亮相同数字
    if (GameState.selectedCell && GameState.selectedCell.row === row && GameState.selectedCell.col === col) {
        // 先清除所有高亮
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('same-number');
        });

        // 如果输入了新数字，高亮所有相同数字
        if (number !== 0) {
            highlightSameNumbers(row, col);
        } else {
            GameState.selectedNumber = null;
        }
    }
}

// 更新单元格显示
function updateCellDisplay(row, col) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    const value = GameState.board[row][col];

    if (value === 0) {
        cell.textContent = '';
        cell.classList.remove('fixed');
    } else {
        cell.textContent = value;

        if (GameState.initialBoard[row][col] !== 0) {
            cell.classList.add('fixed');
        } else {
            cell.classList.remove('fixed');
        }
    }
}

// 标记单元格错误
function markCellError(row, col) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.add('error');
    }
}

// 清除单元格错误标记
function clearCellError(row, col) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.remove('error');
    }
}

// 更新棋盘显示
function updateBoardDisplay() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            updateCellDisplay(row, col);
        }
    }

    // 绘制连续性约束（简化：仅用边框表示）
    drawConstraints();
}

// 绘制连续性约束 - 使用灰色粗线
function drawConstraints() {
    // 清除之前的约束显示
    document.querySelectorAll('.constraint-line').forEach(el => el.remove());

    if (GameState.mode !== 'continuous') return;

    // 绘制灰色粗线约束
    GameState.constraints.lines.forEach(constraint => {
        drawConstraintLine(constraint);
    });
}

// 绘制约束点
// 绘制约束线 - 灰色粗线
function drawConstraintLine(constraint) {
    const { r1, c1, r2, c2 } = constraint;

    // 获取两个相邻单元格的DOM元素
    const cell1 = elements.sudokuGrid.querySelector(`[data-row="${r1}"][data-col="${c1}"]`);
    const cell2 = elements.sudokuGrid.querySelector(`[data-row="${r2}"][data-col="${c2}"]`);

    if (!cell1 || !cell2) {
        console.warn('找不到单元格元素', constraint);
        return;
    }

    // 获取单元格的实际像素位置（相对于网格）
    const rect1 = cell1.getBoundingClientRect();
    const rect2 = cell2.getBoundingClientRect();
    const gridRect = elements.sudokuGrid.getBoundingClientRect();

    // 转换为相对于网格的坐标
    const cell1Left = rect1.left - gridRect.left;
    const cell1Top = rect1.top - gridRect.top;
    const cell1Right = rect1.right - gridRect.left;
    const cell1Bottom = rect1.bottom - gridRect.top;

    const cell2Left = rect2.left - gridRect.left;
    const cell2Top = rect2.top - gridRect.top;
    const cell2Right = rect2.right - gridRect.left;
    const cell2Bottom = rect2.bottom - gridRect.top;

    // 确定约束方向
    const isHorizontal = Math.abs(c2 - c1) === 1 && r1 === r2; // 水平相邻，同一行
    const isVertical = Math.abs(r2 - r1) === 1 && c1 === c2;   // 垂直相邻，同一列

    if (!isHorizontal && !isVertical) {
        console.warn('无效的约束：单元格不相邻', constraint);
        return;
    }

    let left, top, width, height;

    if (isHorizontal) {
        // 左右相邻单元格：在垂直边界上显示垂直线段
        const lineWidth = 6; // 垂直线粗细
        const lineHeight = 40; // 垂直线长度

        // 计算两个单元格之间的垂直边界中心
        // 对于左右相邻，边界在两个单元格的垂直边缘之间
        const boundaryX = (Math.min(cell1Right, cell2Right) + Math.max(cell1Left, cell2Left)) / 2;

        // 行的垂直中心（两个单元格的垂直中心应该相同）
        const rowCenterY = (cell1Top + cell1Bottom) / 2;

        // 线中心在边界上，垂直居中于行
        left = boundaryX - lineWidth / 2;
        top = rowCenterY - lineHeight / 2;
        width = lineWidth;
        height = lineHeight;
    } else {
        // 上下相邻单元格：在水平边界上显示水平线段
        const lineWidth = 40; // 水平线长度
        const lineHeight = 6; // 水平线粗细

        // 计算两个单元格之间的水平边界中心
        // 对于上下相邻，边界在两个单元格的水平边缘之间
        const boundaryY = (Math.min(cell1Bottom, cell2Bottom) + Math.max(cell1Top, cell2Top)) / 2;

        // 列的水平中心（两个单元格的水平中心应该相同）
        const colCenterX = (cell1Left + cell1Right) / 2;

        // 线中心在边界上，水平居中于列
        left = colCenterX - lineWidth / 2;
        top = boundaryY - lineHeight / 2;
        width = lineWidth;
        height = lineHeight;
    }

    const line = document.createElement('div');
    // 注意：isHorizontal表示水平相邻（左右），应该显示垂直线
    // isVertical表示垂直相邻（上下），应该显示水平线
    line.className = `constraint-line ${isHorizontal ? 'vertical' : 'horizontal'}`;
    line.style.position = 'absolute';
    line.style.left = `${left}px`;
    line.style.top = `${top}px`;
    line.style.width = `${width}px`;
    line.style.height = `${height}px`;
    line.style.pointerEvents = 'none';

    elements.sudokuGrid.appendChild(line);
}

// 提供提示
function giveHint() {
    if (!GameState.isPlaying || GameState.hints <= 0) return;

    // 找到第一个错误的或空的单元格
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (GameState.initialBoard[r][c] === 0 &&
                GameState.board[r][c] !== GameState.solution[r][c]) {

                // 放置正确数字
                GameState.board[r][c] = GameState.solution[r][c];
                updateCellDisplay(r, c);

                // 消耗一个提示
                GameState.hints--;
                updateUI();

                return;
            }
        }
    }

    // 如果所有单元格都正确，显示消息
    alert('所有单元格都已正确！');
}

// 检查棋盘
function checkBoard() {
    if (!GameState.isPlaying) return;

    let hasErrors = false;

    // 清除所有错误标记
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            clearCellError(r, c);
        }
    }

    // 检查标准数独错误
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (GameState.board[r][c] !== 0 &&
                GameState.board[r][c] !== GameState.solution[r][c]) {
                markCellError(r, c);
                hasErrors = true;
            }
        }
    }

    // 如果是连续模式，检查连续性约束
    if (GameState.mode === 'continuous') {
        hasErrors = hasErrors || checkContinuousConstraints();
    }

    if (hasErrors) {
        // 消耗一点体力
        if (GameState.energy > 0) {
            GameState.energy--;
            updateUI();

            if (GameState.energy === 0) {
                alert('体力耗尽！游戏结束。');
                // 可以在这里添加游戏结束逻辑，比如返回主菜单
                showScreen('home');
                stopTimer();
                GameState.isPlaying = false;
                return;
            }
        }
        alert(`发现错误！请检查红色标记的单元格。剩余体力：${GameState.energy}`);
    } else {
        alert('恭喜！所有填写的数字都是正确的。');

        // 检查是否完成
        if (checkIfComplete()) {
            endGame();
        }
    }
}

// 检查连续性约束
function checkContinuousConstraints() {
    let hasConstraintErrors = false;

    GameState.constraints.lines.forEach(constraint => {
        const { r1, c1, r2, c2 } = constraint;
        const val1 = GameState.board[r1][c1];
        const val2 = GameState.board[r2][c2];

        // 如果两个单元格都有数字，检查它们是否连续
        if (val1 !== 0 && val2 !== 0) {
            if (Math.abs(val1 - val2) !== 1) {
                // 标记两个单元格都有错误
                markCellError(r1, c1);
                markCellError(r2, c2);
                hasConstraintErrors = true;
            }
        }
    });

    return hasConstraintErrors;
}

// 检查单个单元格相关的连续性约束
function checkCellConstraints(row, col) {
    let hasErrors = false;

    GameState.constraints.lines.forEach(constraint => {
        const { r1, c1, r2, c2 } = constraint;

        // 如果约束涉及当前单元格
        if ((r1 === row && c1 === col) || (r2 === row && c2 === col)) {
            const val1 = GameState.board[r1][c1];
            const val2 = GameState.board[r2][c2];

            // 如果两个单元格都有数字，检查它们是否连续
            if (val1 !== 0 && val2 !== 0) {
                if (Math.abs(val1 - val2) !== 1) {
                    // 标记两个单元格都有错误
                    markCellError(r1, c1);
                    markCellError(r2, c2);
                    hasErrors = true;
                }
            }
        }
    });

    return hasErrors;
}

// 求解谜题
function solvePuzzle() {
    if (!GameState.isPlaying) return;

    if (!confirm('这将显示完整解决方案。确定要继续吗？')) {
        return;
    }

    // 填充所有数字
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            GameState.board[r][c] = GameState.solution[r][c];
        }
    }

    updateBoardDisplay();
    stopTimer();
    GameState.isPlaying = false;

    alert('谜题已解决！');
}

// 检查是否完成
function checkIfComplete() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (GameState.board[r][c] !== GameState.solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

// 游戏完成
function gameComplete() {
    stopTimer();
    GameState.isPlaying = false;

    const minutes = Math.floor(GameState.timer / 60);
    const seconds = GameState.timer % 60;

    if (GameState.mode === 'classic') {
        alert(`恭喜！你完成了数独谜题！\n用时：${minutes}分${seconds}秒\n难度：${GameState.difficulty}`);
    } else {
        alert(`恭喜！你完成了连续数独谜题！\n用时：${minutes}分${seconds}秒\n难度：${GameState.difficulty}\n进度：${GameState.continuousProgress}/${GameState.continuousTotal}`);

        // 如果是连续模式，继续下一题
        if (GameState.continuousProgress < GameState.continuousTotal) {
            GameState.continuousProgress++;
            setTimeout(() => {
                if (confirm(`进入第 ${GameState.continuousProgress} 题？`)) {
                    generateNewGame();
                }
            }, 1000);
        }
    }
}

// 处理键盘输入
function handleKeyPress(event) {
    if (!GameState.selectedCell || !GameState.isPlaying) return;

    const { row, col } = GameState.selectedCell;

    // 数字1-9
    if (event.key >= '1' && event.key <= '9') {
        placeNumber(row, col, parseInt(event.key));
    }

    // 退格键或删除键清除
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        placeNumber(row, col, 0);
    }

    // 方向键移动选择
    if (event.key === 'ArrowUp' && row > 0) {
        selectCell(row - 1, col);
    } else if (event.key === 'ArrowDown' && row < 8) {
        selectCell(row + 1, col);
    } else if (event.key === 'ArrowLeft' && col > 0) {
        selectCell(row, col - 1);
    } else if (event.key === 'ArrowRight' && col < 8) {
        selectCell(row, col + 1);
    }
}

// 显示模态框
function showModal(modal) {
    modal.classList.add('active');
}

// 隐藏所有模态框
function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);