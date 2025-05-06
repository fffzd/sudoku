// 数独学堂 - 每日挑战JavaScript文件
// 版本: 1.1 - 添加错误处理与备用数据

// 全局变量
let timer; // 计时器
let seconds = 0; // 计时秒数
let isTimerRunning = false; // 计时器运行状态
let selectedNumber = null; // 当前选中的数字
let selectedCell = null; // 当前选中的单元格
let notesMode = false; // 笔记模式状态
let hintsUsed = 0; // 使用的提示次数
let errorsCount = 0; // 错误次数
let isGameComplete = false; // 游戏是否完成

// 当前日期的挑战数独盘和解决方案
let dailyChallengeGrid = [];
let solutionGrid = [];

// 用户当前的数独盘状态
let currentGrid = [];

// 错误处理日志函数
function logError(message, error) {
    console.error(`数独错误: ${message}`, error);
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 检查版本，重置缓存内容
        checkVersionReset();
        
        // 生成基于日期的数独挑战
        generateDailyChallenge();
        
        // 设置今天的日期
        setTodayDate();
        
        // 初始化数独网格
        initSudokuGrid();
        
        // 恢复保存的统计数据
        restoreStats();
        
        // 设置数字选择器事件
        setupNumberSelector();
        
        // 设置工具按钮事件
        setupToolButtons();
        
        // 设置结果面板按钮事件
        setupResultPanelButtons();
        
        // 如果游戏已完成，显示结果面板
        if (isGameComplete) {
            showCompletionPanel();
        } else {
            // 否则开始计时器
            startTimer();
        }

        // 显示版本信息在控制台
        console.log("数独每日挑战已加载，版本1.1");
    } catch (error) {
        logError("页面初始化失败", error);
        // 显示错误信息给用户
        alert("加载每日挑战时出错，请刷新页面重试");
    }
});

/**
 * 检查版本并重置缓存内容
 * 确保新版本加载时数据正确初始化
 */
function checkVersionReset() {
    try {
        // 版本检查键
        const versionKey = 'sudoku_daily_version';
        const currentVersion = '1.1';
        
        // 获取存储的版本
        let storedVersion;
        try {
            storedVersion = localStorage.getItem(versionKey);
        } catch (error) {
            logError("无法获取存储的版本信息", error);
        }
        
        // 如果版本不匹配或没有版本，清除所有相关数据
        if (storedVersion !== currentVersion) {
            try {
                console.log(`版本变更: ${storedVersion || '无'} -> ${currentVersion}, 重置数据`);
                
                // 获取所有localStorage键
                const keys = Object.keys(localStorage);
                
                // 删除所有与数独相关的键
                for (const key of keys) {
                    if (key.startsWith('sudoku_daily_')) {
                        localStorage.removeItem(key);
                    }
                }
                
                // 保存新版本号
                localStorage.setItem(versionKey, currentVersion);
            } catch (error) {
                logError("清除缓存数据失败", error);
            }
        }
    } catch (error) {
        logError("版本检查失败", error);
    }
}

/**
 * 基于日期生成每日挑战数独
 */
function generateDailyChallenge() {
    try {
        // 获取当前日期
        const today = new Date();
        const dateString = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
        
        // 检查游戏是否已完成
        const isCompleted = localStorage.getItem(`sudoku_daily_completed_${dateString}`);
        if (isCompleted === 'true') {
            isGameComplete = true;
        }
        
        // 检查本地存储中是否已有今天的挑战
        let storedChallenge;
        try {
            storedChallenge = localStorage.getItem(`sudoku_daily_challenge_${dateString}`);
        } catch (storageError) {
            logError("无法访问本地存储", storageError);
            // 继续执行，将生成新的挑战
        }
        
        if (storedChallenge) {
            try {
                // 如果有，使用存储的挑战
                const challenge = JSON.parse(storedChallenge);
                dailyChallengeGrid = challenge.puzzle;
                solutionGrid = challenge.solution;
                
                // 检查是否有保存的进度
                let storedProgress;
                try {
                    storedProgress = localStorage.getItem(`sudoku_daily_progress_${dateString}`);
                } catch (progressError) {
                    logError("无法读取保存的进度", progressError);
                }
                
                if (storedProgress) {
                    // 恢复保存的进度
                    currentGrid = JSON.parse(storedProgress);
                } else {
                    // 没有进度，使用初始题目
                    currentGrid = [...dailyChallengeGrid];
                }
            } catch (parseError) {
                logError("解析存储的挑战数据失败", parseError);
                // 继续执行，将生成新的挑战
            }
        }
        
        // 如果没有有效的挑战数据，生成新的挑战
        if (!dailyChallengeGrid.length || !solutionGrid.length) {
            // 使用日期作为种子生成伪随机数
            const seed = parseInt(dateString);
            
            try {
                // 生成数独题目和解答
                const { puzzle, solution } = generateSudokuFromSeed(seed);
                
                // 设置全局变量
                dailyChallengeGrid = puzzle;
                solutionGrid = solution;
                currentGrid = [...dailyChallengeGrid];
                
                // 保存到本地存储
                try {
                    localStorage.setItem(`sudoku_daily_challenge_${dateString}`, JSON.stringify({
                        puzzle: puzzle,
                        solution: solution
                    }));
                } catch (saveError) {
                    logError("保存挑战到本地存储失败", saveError);
                    // 继续执行，用户仍然可以玩当前生成的数独
                }
            } catch (genError) {
                logError("生成数独失败，使用备用数独", genError);
                // 使用备用数独
                useBackupSudoku();
            }
        }
        
        // 最终检查 - 确保数独数据有效
        if (!validateSudokuData()) {
            // 如果数据无效，使用备用数独
            useBackupSudoku();
        }
    } catch (error) {
        logError("生成每日挑战失败", error);
        // 使用备用数独
        useBackupSudoku();
    }
}

/**
 * 验证数独数据是否有效
 * @returns {boolean} 数据是否有效
 */
function validateSudokuData() {
    // 检查数组长度是否为81
    if (dailyChallengeGrid.length !== 81 || solutionGrid.length !== 81 || currentGrid.length !== 81) {
        return false;
    }
    
    // 检查值范围是否在0-9之间
    for (let i = 0; i < 81; i++) {
        if (
            dailyChallengeGrid[i] < 0 || dailyChallengeGrid[i] > 9 ||
            solutionGrid[i] < 1 || solutionGrid[i] > 9 ||
            currentGrid[i] < 0 || currentGrid[i] > 9
        ) {
            return false;
        }
    }
    
    return true;
}

/**
 * 使用备用数独数据
 * 在无法生成或恢复数独时使用
 */
function useBackupSudoku() {
    // 备用数独 - 中等难度
    dailyChallengeGrid = [
        5,3,0,0,7,0,0,0,0,
        6,0,0,1,9,5,0,0,0,
        0,9,8,0,0,0,0,6,0,
        8,0,0,0,6,0,0,0,3,
        4,0,0,8,0,3,0,0,1,
        7,0,0,0,2,0,0,0,6,
        0,6,0,0,0,0,2,8,0,
        0,0,0,4,1,9,0,0,5,
        0,0,0,0,8,0,0,7,9
    ];
    
    solutionGrid = [
        5,3,4,6,7,8,9,1,2,
        6,7,2,1,9,5,3,4,8,
        1,9,8,3,4,2,5,6,7,
        8,5,9,7,6,1,4,2,3,
        4,2,6,8,5,3,7,9,1,
        7,1,3,9,2,4,8,5,6,
        9,6,1,5,3,7,2,8,4,
        2,8,7,4,1,9,6,3,5,
        3,4,5,2,8,6,1,7,9
    ];
    
    currentGrid = [...dailyChallengeGrid];
}

/**
 * 基于种子值生成数独题目和解答
 * @param {number} seed - 用于伪随机数生成的种子值
 * @returns {Object} 包含puzzle和solution的对象
 */
function generateSudokuFromSeed(seed) {
    // 初始化伪随机数生成器
    const random = seededRandom(seed);
    
    // 生成空的9x9数独网格
    const solution = Array(81).fill(0);
    
    // 生成完整解答
    generateSolution(solution, random);
    
    // 基于难度创建谜题
    // 根据周几调整难度：周一简单，周日困难
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0是周日，1是周一
    
    // 根据日期确定难度（1-5，5最难）
    let difficulty;
    if (dayOfWeek === 0) {
        difficulty = 5; // 周日最难
    } else if (dayOfWeek === 6) {
        difficulty = 4; // 周六较难
    } else {
        difficulty = dayOfWeek; // 周一到周五，1-5递增难度
    }
    
    // 根据难度确定要移除的单元格数量
    const cellsToRemove = 30 + (difficulty * 5);
    
    // 复制解答创建谜题
    const puzzle = [...solution];
    
    // 创建所有单元格的位置列表
    const positions = Array.from({length: 81}, (_, i) => i);
    
    // 随机打乱位置列表
    shuffleArrayWithSeed(positions, random);
    
    // 依次移除单元格，创建谜题
    for (let i = 0; i < cellsToRemove; i++) {
        puzzle[positions[i]] = 0;
    }
    
    return { puzzle, solution };
}

/**
 * 生成数独解答
 * @param {Array} grid - 81个元素的一维数组表示数独网格
 * @param {Function} random - 伪随机数生成函数
 * @returns {boolean} 是否成功生成解答
 */
function generateSolution(grid, random) {
    // 寻找空白单元格
    let emptyCell = -1;
    for (let i = 0; i < 81; i++) {
        if (grid[i] === 0) {
            emptyCell = i;
            break;
        }
    }
    
    // 如果没有空白单元格，数独已解决
    if (emptyCell === -1) {
        return true;
    }
    
    // 获取空白单元格的行列
    const row = Math.floor(emptyCell / 9);
    const col = emptyCell % 9;
    
    // 创建1-9的数组并打乱
    const nums = Array.from({length: 9}, (_, i) => i + 1);
    shuffleArrayWithSeed(nums, random);
    
    // 尝试填入数字
    for (const num of nums) {
        // 检查数字是否可以放在此位置
        if (isSafe(grid, row, col, num)) {
            // 放置数字
            grid[emptyCell] = num;
            
            // 递归解决剩余部分
            if (generateSolution(grid, random)) {
                return true;
            }
            
            // 回溯
            grid[emptyCell] = 0;
        }
    }
    
    // 无解，触发回溯
    return false;
}

/**
 * 检查在指定位置放置数字是否安全
 * @param {Array} grid - 数独网格
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 * @param {number} num - 要放置的数字
 * @returns {boolean} 是否安全
 */
function isSafe(grid, row, col, num) {
    // 检查行
    for (let x = 0; x < 9; x++) {
        if (grid[row * 9 + x] === num) {
            return false;
        }
    }
    
    // 检查列
    for (let x = 0; x < 9; x++) {
        if (grid[x * 9 + col] === num) {
            return false;
        }
    }
    
    // 检查3x3方块
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[(boxRow + i) * 9 + (boxCol + j)] === num) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * 基于种子的伪随机数生成器
 * @param {number} seed - 随机数种子
 * @returns {Function} 返回0-1之间的伪随机数的函数
 */
function seededRandom(seed) {
    return function() {
        // 简单的线性同余生成器
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

/**
 * 使用指定的随机数生成器打乱数组
 * @param {Array} array - 要打乱的数组
 * @param {Function} random - 随机数生成函数
 */
function shuffleArrayWithSeed(array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        // 使用提供的随机数生成器
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * 设置今天的日期
 */
function setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    const dateElement = document.getElementById('challenge-date');
    if (dateElement) {
        dateElement.textContent = `${year}年${month}月${day}日 每日挑战`;
    }
    
    // 更新难度星级显示
    updateDifficultyStars();
}

/**
 * 更新难度星级显示
 */
function updateDifficultyStars() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0是周日，1是周一
    
    // 计算难度星级（1-5星）
    let difficulty;
    if (dayOfWeek === 0) {
        difficulty = 5; // 周日最难
    } else if (dayOfWeek === 6) {
        difficulty = 4; // 周六较难
    } else {
        difficulty = dayOfWeek; // 周一到周五，1-5递增难度
    }
    
    // 更新星级显示
    const starsElement = document.querySelector('.difficulty-stars');
    if (starsElement) {
        let starsHtml = '';
        // 添加实心星星
        for (let i = 0; i < difficulty; i++) {
            starsHtml += '★';
        }
        // 添加空心星星
        for (let i = difficulty; i < 5; i++) {
            starsHtml += '☆';
        }
        starsElement.innerHTML = starsHtml;
    }
}

/**
 * 初始化数独网格
 */
function initSudokuGrid() {
    try {
        const grid = document.getElementById('challenge-grid');
        if (!grid) {
            logError("找不到数独网格容器", "challenge-grid元素不存在");
            return;
        }
        
        // 清空网格
        grid.innerHTML = '';
        
        // 确保数据有效
        if (!validateSudokuData()) {
            logError("数独数据无效，使用备用数据", dailyChallengeGrid);
            useBackupSudoku();
        }
        
        // 创建81个格子
        for (let i = 0; i < 81; i++) {
            try {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                cell.dataset.index = i;
                
                // 设置行列信息（用于高亮相关行列）
                const row = Math.floor(i / 9);
                const col = i % 9;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
                
                // 预设值不为0则显示数字
                if (dailyChallengeGrid[i] !== 0) {
                    cell.textContent = dailyChallengeGrid[i];
                    cell.classList.add('preset');
                } else {
                    // 创建笔记容器（默认隐藏）
                    const notesContainer = document.createElement('div');
                    notesContainer.classList.add('notes');
                    
                    // 创建9个笔记单元格
                    for (let j = 1; j <= 9; j++) {
                        const noteCell = document.createElement('div');
                        noteCell.classList.add('note-cell');
                        noteCell.dataset.note = j;
                        notesContainer.appendChild(noteCell);
                    }
                    
                    cell.appendChild(notesContainer);
                    
                    // 添加可编辑标记
                    cell.classList.add('editable');
                    
                    // 添加单元格点击事件
                    cell.addEventListener('click', handleCellClick);
                }
                
                // 将格子添加到网格
                grid.appendChild(cell);
            } catch (cellError) {
                logError(`创建单元格 ${i} 时出错`, cellError);
                // 继续创建其他单元格
            }
        }
    } catch (error) {
        logError("初始化数独网格失败", error);
        alert("无法初始化数独网格，请刷新页面重试");
    }
}

/**
 * 处理单元格点击事件
 * @param {Event} e - 点击事件
 */
function handleCellClick(e) {
    // 如果游戏已完成，不响应点击
    if (isGameComplete) return;
    
    // 移除其他单元格的选中状态
    document.querySelectorAll('.sudoku-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // 添加选中状态
    this.classList.add('selected');
    selectedCell = this;
    
    // 高亮相关行列和宫
    highlightRelatedCells(this);
    
    // 如果有选中数字且不是笔记模式，直接填入数字
    if (selectedNumber !== null && !notesMode) {
        fillNumber(selectedNumber);
    }
}

/**
 * 高亮相关单元格（同行、同列、同宫）
 * @param {HTMLElement} cell - 当前选中的单元格
 */
function highlightRelatedCells(cell) {
    // 移除之前的高亮
    document.querySelectorAll('.sudoku-cell.highlight').forEach(el => {
        el.classList.remove('highlight');
    });
    
    // 获取行列宫信息
    const row = cell.dataset.row;
    const col = cell.dataset.col;
    const box = cell.dataset.box;
    
    // 高亮同行、同列、同宫的单元格
    document.querySelectorAll('.sudoku-cell').forEach(el => {
        if (el.dataset.row === row || 
            el.dataset.col === col || 
            el.dataset.box === box) {
            el.classList.add('highlight');
        }
    });
}

/**
 * 设置数字选择器事件
 */
function setupNumberSelector() {
    const numberButtons = document.querySelectorAll('.number-btn');
    
    numberButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除其他数字的选中状态
            document.querySelectorAll('.number-btn.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // 获取选中的数字
            const number = parseInt(this.dataset.number);
            
            // 如果点击的是当前已选中的数字，取消选中
            if (selectedNumber === number) {
                selectedNumber = null;
            } else {
                // 否则选中该数字
                this.classList.add('selected');
                selectedNumber = number;
                
                // 如果有选中的单元格且不是笔记模式，直接填入数字
                if (selectedCell && !notesMode) {
                    fillNumber(number);
                }
                // 如果有选中的单元格且是笔记模式，更新笔记
                else if (selectedCell && notesMode) {
                    toggleNote(number);
                }
            }
        });
    });
}

/**
 * 填入数字到选中的单元格
 * @param {number} number - 要填入的数字
 */
function fillNumber(number) {
    // 检查是否有选中的可编辑单元格
    if (!selectedCell || !selectedCell.classList.contains('editable')) return;
    
    const index = parseInt(selectedCell.dataset.index);
    
    // 如果是擦除（数字为0）
    if (number === 0) {
        selectedCell.textContent = '';
        currentGrid[index] = 0;
        
        // 在selectedCell中找到笔记容器并显示
        const notesContainer = selectedCell.querySelector('.notes');
        if (notesContainer) {
            notesContainer.style.display = '';
        }
        
        // 保存进度
        saveProgress();
        
        return;
    }
    
    // 填入数字
    selectedCell.textContent = number;
    currentGrid[index] = number;
    
    // 检查填入的数字是否正确
    if (number !== solutionGrid[index]) {
        // 显示错误样式
        selectedCell.classList.add('error');
        
        // 一秒后移除错误样式
        setTimeout(() => {
            selectedCell.classList.remove('error');
        }, 1000);
        
        // 增加错误计数
        errorsCount++;
    }
    
    // 隐藏笔记
    const notesContainer = selectedCell.querySelector('.notes');
    if (notesContainer) {
        notesContainer.style.display = 'none';
    }
    
    // 检查是否完成游戏
    checkGameCompletion();
    
    // 保存进度
    saveProgress();
}

/**
 * 保存当前进度到本地存储
 */
function saveProgress() {
    try {
        // 获取当前日期字符串
        const today = new Date();
        const dateString = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
        
        // 保存当前网格状态
        try {
            localStorage.setItem(`sudoku_daily_progress_${dateString}`, JSON.stringify(currentGrid));
        } catch (gridError) {
            logError("保存进度失败 - 网格状态", gridError);
        }
        
        // 保存计时器、提示使用次数和错误次数
        try {
            localStorage.setItem(`sudoku_daily_stats_${dateString}`, JSON.stringify({
                seconds: seconds,
                hintsUsed: hintsUsed,
                errorsCount: errorsCount
            }));
        } catch (statsError) {
            logError("保存进度失败 - 统计数据", statsError);
        }
    } catch (error) {
        logError("保存进度过程中出错", error);
        // 不显示错误给用户，这不是关键操作
    }
}

/**
 * 恢复保存的统计数据
 */
function restoreStats() {
    try {
        // 获取当前日期字符串
        const today = new Date();
        const dateString = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
        
        // 获取保存的统计数据
        let storedStats;
        try {
            storedStats = localStorage.getItem(`sudoku_daily_stats_${dateString}`);
        } catch (storageError) {
            logError("读取保存的统计数据失败", storageError);
            return; // 无法读取统计数据，使用默认值
        }
        
        if (storedStats) {
            try {
                const stats = JSON.parse(storedStats);
                
                // 恢复计时器
                seconds = stats.seconds || 0;
                updateTimerDisplay();
                
                // 恢复提示使用次数
                hintsUsed = stats.hintsUsed || 0;
                
                // 恢复错误次数
                errorsCount = stats.errorsCount || 0;
            } catch (parseError) {
                logError("解析统计数据失败", parseError);
                // 使用默认值
                seconds = 0;
                hintsUsed = 0;
                errorsCount = 0;
                updateTimerDisplay();
            }
        }
    } catch (error) {
        logError("恢复统计数据过程中出错", error);
        // 使用默认值
        seconds = 0;
        hintsUsed = 0;
        errorsCount = 0;
        updateTimerDisplay();
    }
}

/**
 * 切换笔记中的数字
 * @param {number} number - 要切换的笔记数字
 */
function toggleNote(number) {
    // 检查是否有选中的可编辑单元格
    if (!selectedCell || !selectedCell.classList.contains('editable')) return;
    
    // 获取笔记容器
    const notesContainer = selectedCell.querySelector('.notes');
    if (!notesContainer) return;
    
    // 获取对应数字的笔记单元格
    const noteCell = notesContainer.querySelector(`.note-cell[data-note="${number}"]`);
    if (!noteCell) return;
    
    // 切换显示状态
    if (noteCell.textContent === '') {
        noteCell.textContent = number;
    } else {
        noteCell.textContent = '';
    }
}

/**
 * 设置工具按钮事件
 */
function setupToolButtons() {
    // 提示按钮
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
        hintBtn.addEventListener('click', giveHint);
    }
    
    // 笔记模式按钮
    const notesBtn = document.getElementById('notes-btn');
    const notesIndicator = document.getElementById('notes-indicator');
    if (notesBtn && notesIndicator) {
        notesBtn.addEventListener('click', function() {
            notesMode = !notesMode;
            
            if (notesMode) {
                notesIndicator.textContent = '开启';
                notesIndicator.style.backgroundColor = 'var(--accent-color)';
            } else {
                notesIndicator.textContent = '关闭';
                notesIndicator.style.backgroundColor = 'var(--secondary-color)';
            }
        });
    }
    
    // 检查按钮
    const checkBtn = document.getElementById('check-btn');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkSolution);
    }
    
    // 重置按钮
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGrid);
    }
}

/**
 * 给予提示
 */
function giveHint() {
    // 如果游戏已完成，不提供提示
    if (isGameComplete) return;
    
    // 如果没有选中单元格，或者选中的不是可编辑单元格，不提供提示
    if (!selectedCell || !selectedCell.classList.contains('editable')) {
        alert('请先选择一个空白格子');
        return;
    }
    
    // 获取选中单元格的索引
    const index = parseInt(selectedCell.dataset.index);
    
    // 如果已经填入了正确的数字，不需要提示
    if (currentGrid[index] === solutionGrid[index]) {
        alert('这个格子已经填入了正确的数字');
        return;
    }
    
    // 给予提示，填入正确数字
    selectedCell.textContent = solutionGrid[index];
    currentGrid[index] = solutionGrid[index];
    
    // 移除可能的笔记
    const notesContainer = selectedCell.querySelector('.notes');
    if (notesContainer) {
        notesContainer.style.display = 'none';
    }
    
    // 记录使用提示次数
    hintsUsed++;
    
    // 保存进度
    saveProgress();
    
    // 检查是否完成游戏
    checkGameCompletion();
}

/**
 * 检查当前解答
 */
function checkSolution() {
    // 如果游戏已完成，不进行检查
    if (isGameComplete) return;
    
    let allCorrect = true;
    let filledCount = 0;
    
    // 检查每个格子
    for (let i = 0; i < 81; i++) {
        if (currentGrid[i] !== 0) {
            filledCount++;
            
            if (currentGrid[i] !== solutionGrid[i]) {
                allCorrect = false;
                
                // 找到对应的DOM元素并标记错误
                const cell = document.querySelector(`.sudoku-cell[data-index="${i}"]`);
                if (cell) {
                    cell.classList.add('error');
                    
                    // 一秒后移除错误样式
                    setTimeout(() => {
                        cell.classList.remove('error');
                    }, 1000);
                }
            }
        }
    }
    
    if (filledCount < 81) {
        alert('数独尚未完成！');
    } else if (allCorrect) {
        completeGame(true);
    } else {
        alert('有错误的答案，请检查并修正。');
    }
}

/**
 * 重置数独网格
 */
function resetGrid() {
    // 确认重置
    if (confirm('确定要重置数独盘吗？所有进度将丢失。')) {
        // 重置状态
        currentGrid = [...dailyChallengeGrid];
        
        // 重新初始化网格
        initSudokuGrid();
        
        // 重置选中状态
        selectedCell = null;
        selectedNumber = null;
        
        // 重置错误计数
        errorsCount = 0;
        
        // 重置提示使用次数
        hintsUsed = 0;
        
        // 如果计时器已启动，重置计时器
        if (isTimerRunning) {
            seconds = 0;
            updateTimerDisplay();
        }
        
        // 保存重置后的进度
        saveProgress();
    }
}

/**
 * 检查游戏是否完成
 */
function checkGameCompletion() {
    let isComplete = true;
    
    // 检查每个格子是否填入了正确的数字
    for (let i = 0; i < 81; i++) {
        if (currentGrid[i] !== solutionGrid[i]) {
            isComplete = false;
            break;
        }
    }
    
    // 如果完成，显示结果并保存状态
    if (isComplete) {
        completeGame();
        
        // 获取当前日期字符串
        const today = new Date();
        const dateString = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
        
        // 保存游戏已完成状态
        localStorage.setItem(`sudoku_daily_completed_${dateString}`, 'true');
    }
}

/**
 * 完成游戏
 * @param {boolean} isCheck - 是否是通过检查按钮完成的
 */
function completeGame(isCheck = false) {
    // 标记游戏已完成
    isGameComplete = true;
    
    // 停止计时器
    stopTimer();
    
    // 更新结果面板标题
    const resultTitle = document.getElementById('result-title');
    if (resultTitle) {
        resultTitle.textContent = isCheck ? '挑战成功！' : '恭喜完成！';
    }
    
    // 更新结果面板
    updateResultPanel();
    
    // 显示结果面板
    const resultPanel = document.getElementById('result-panel');
    const resultOverlay = document.getElementById('result-overlay');
    
    if (resultPanel && resultOverlay) {
        resultPanel.style.display = 'block';
        resultOverlay.style.display = 'block';
    }
    
    // 获取当前日期字符串
    const today = new Date();
    const dateString = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;
    
    // 保存游戏已完成状态
    localStorage.setItem(`sudoku_daily_completed_${dateString}`, 'true');
}

/**
 * 设置结果面板按钮事件
 */
function setupResultPanelButtons() {
    // 分享按钮
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareResult);
    }
    
    // 关闭按钮
    const closeBtn = document.getElementById('close-result-btn');
    const resultPanel = document.getElementById('result-panel');
    const overlay = document.getElementById('result-overlay');
    
    if (closeBtn && resultPanel && overlay) {
        closeBtn.addEventListener('click', function() {
            resultPanel.style.display = 'none';
            overlay.style.display = 'none';
        });
    }
}

/**
 * 分享结果
 */
function shareResult() {
    const time = formatTime(seconds);
    const date = document.getElementById('challenge-date').textContent;
    
    const shareText = `我在数独学堂完成了${date}，用时${time}，使用了${hintsUsed}次提示，犯了${errorsCount}次错误！挑战一下？`;
    
    // 尝试使用Web Share API分享
    if (navigator.share) {
        navigator.share({
            title: '数独学堂每日挑战成绩',
            text: shareText,
            url: window.location.href
        })
        .catch(error => {
            console.log('分享失败:', error);
            // 回退到复制到剪贴板
            copyToClipboard(shareText);
        });
    } else {
        // 不支持Web Share API，复制到剪贴板
        copyToClipboard(shareText);
    }
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 */
function copyToClipboard(text) {
    // 创建临时文本区域
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    
    // 选择并复制
    textarea.select();
    document.execCommand('copy');
    
    // 移除临时元素
    document.body.removeChild(textarea);
    
    // 提示用户
    alert('成绩已复制到剪贴板，可以粘贴分享给好友！');
}

/**
 * 开始计时器
 */
function startTimer() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    timer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

/**
 * 停止计时器
 */
function stopTimer() {
    if (!isTimerRunning) return;
    
    clearInterval(timer);
    isTimerRunning = false;
}

/**
 * 更新计时器显示
 */
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = formatTime(seconds);
    }
}

/**
 * 格式化时间
 * @param {number} totalSeconds - 总秒数
 * @returns {string} 格式化后的时间字符串 (MM:SS)
 */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // 格式化为两位数
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * 显示完成游戏的结果面板
 */
function showCompletionPanel() {
    // 更新结果面板
    updateResultPanel();
    
    // 显示结果面板
    const resultPanel = document.getElementById('result-panel');
    const resultOverlay = document.getElementById('result-overlay');
    
    if (resultPanel && resultOverlay) {
        resultPanel.style.display = 'block';
        resultOverlay.style.display = 'block';
    }
}

/**
 * 更新结果面板信息
 */
function updateResultPanel() {
    const resultTitle = document.getElementById('result-title');
    const resultTime = document.getElementById('result-time');
    const resultHints = document.getElementById('result-hints');
    const resultErrors = document.getElementById('result-errors');
    
    if (resultTitle) {
        resultTitle.textContent = '每日挑战完成！';
    }
    
    if (resultTime) {
        resultTime.textContent = formatTime(seconds);
    }
    
    if (resultHints) {
        resultHints.textContent = `${hintsUsed}次`;
    }
    
    if (resultErrors) {
        resultErrors.textContent = `${errorsCount}次`;
    }
} 