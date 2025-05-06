/**
 * 数独答案查看功能
 * 允许用户查看当前数独题目的完整解答
 */

// 初始化查看答案功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取查看答案按钮
    const solutionBtn = document.getElementById('show-solution-btn');
    
    // 如果按钮存在，添加点击事件
    if (solutionBtn) {
        solutionBtn.addEventListener('click', function() {
            // 显示确认对话框
            showConfirmDialog();
        });
    }
});

/**
 * 显示确认对话框
 * 提醒用户查看答案会影响游戏体验
 */
function showConfirmDialog() {
    // 创建模态对话框
    const modal = document.createElement('div');
    modal.className = 'solution-modal';
    modal.innerHTML = `
        <div class="solution-modal-content">
            <span class="solution-modal-close">&times;</span>
            <h2>查看答案确认</h2>
            <p>查看答案将会显示完整解答，这可能会影响您的游戏体验。</p>
            <p>确定要继续吗？</p>
            <div class="solution-options">
                <button id="confirm-solution" class="btn">
                    <i class="fas fa-check"></i> 确认查看
                </button>
                <button id="cancel-solution" class="btn">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
        </div>
    `;
    
    // 添加到文档
    document.body.appendChild(modal);
    
    // 显示模态框
    requestAnimationFrame(() => {
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    });
    
    // 关闭按钮事件
    const closeBtn = modal.querySelector('.solution-modal-close');
    closeBtn.addEventListener('click', function() {
        closeModal(modal);
    });
    
    // 取消按钮事件
    const cancelBtn = document.getElementById('cancel-solution');
    cancelBtn.addEventListener('click', function() {
        closeModal(modal);
    });
    
    // 确认按钮事件
    const confirmBtn = document.getElementById('confirm-solution');
    confirmBtn.addEventListener('click', function() {
        closeModal(modal, () => {
            showSolution();
        });
    });
}

/**
 * 关闭模态框
 * @param {HTMLElement} modal - 要关闭的模态框元素
 * @param {Function} callback - 关闭后的回调函数
 */
function closeModal(modal, callback) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.remove();
        if (callback) callback();
    }, 300);
}

/**
 * 显示数独解答
 * 在界面上展示完整解答
 */
function showSolution() {
    // 获取当前游戏数据
    const gameData = getCurrentGameData();
    if (!gameData || !gameData.solution) {
        calculateAndShowSolution();
        return;
    }
    
    // 创建解答对话框
    displaySolutionModal(gameData.solution);
}

/**
 * 计算并显示解答
 * 当无法直接从游戏实例获取解答时，使用算法计算解答
 */
function calculateAndShowSolution() {
    // 获取当前游戏数据
    const gameData = getCurrentGameData();
    if (!gameData || !gameData.grid) {
        alert('无法获取当前游戏数据');
        return;
    }
    
    // 克隆当前网格，避免修改原始数据
    const grid = gameData.grid.map(row => [...row]);
    
    // 使用回溯算法求解数独
    if (solveSudoku(grid)) {
        // 显示解答
        displaySolutionModal(grid);
    } else {
        alert('无法计算当前数独的解答，可能是数独无解或数据有误');
    }
}

/**
 * 显示解答对话框
 * @param {Array} solution - 数独解答二维数组
 */
function displaySolutionModal(solution) {
    // 创建模态对话框
    const modal = document.createElement('div');
    modal.className = 'solution-modal';
    modal.innerHTML = `
        <div class="solution-modal-content solution-display">
            <span class="solution-modal-close">&times;</span>
            <h2>数独完整解答</h2>
            <div class="solution-grid">
                ${generateSolutionHTML(solution)}
            </div>
            <div class="solution-footer">
                <button id="close-solution" class="btn">
                    <i class="fas fa-times"></i> 关闭
                </button>
            </div>
        </div>
    `;
    
    // 添加到文档
    document.body.appendChild(modal);
    
    // 显示模态框
    requestAnimationFrame(() => {
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    });
    
    // 关闭按钮事件
    const closeBtn = modal.querySelector('.solution-modal-close');
    closeBtn.addEventListener('click', function() {
        closeModal(modal);
    });
    
    // 关闭按钮事件
    const closeButton = document.getElementById('close-solution');
    closeButton.addEventListener('click', function() {
        closeModal(modal);
    });
}

/**
 * 生成解答HTML
 * @param {Array} solution - 数独解答二维数组
 * @returns {string} 解答HTML字符串
 */
function generateSolutionHTML(solution) {
    let html = '';
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            html += `<div class="solution-cell">${solution[i][j]}</div>`;
        }
    }
    return html;
}

/**
 * 使用回溯算法求解数独
 * @param {Array} grid - 数独网格
 * @returns {boolean} 是否成功求解
 */
function solveSudoku(grid) {
    // 寻找空白单元格
    const emptyCell = findEmptyCell(grid);
    
    // 如果没有空白单元格，说明已经解决
    if (!emptyCell) {
        return true;
    }
    
    const [row, col] = emptyCell;
    
    // 尝试1-9的数字
    for (let num = 1; num <= 9; num++) {
        // 检查是否可以放置
        if (isValidPlacement(grid, row, col, num)) {
            // 放置数字
            grid[row][col] = num;
            
            // 递归解决剩余部分
            if (solveSudoku(grid)) {
                return true;
            }
            
            // 回溯
            grid[row][col] = 0;
        }
    }
    
    // 无解
    return false;
}

/**
 * 寻找空白单元格
 * @param {Array} grid - 数独网格
 * @returns {Array|null} 空白单元格坐标 [row, col] 或 null
 */
function findEmptyCell(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

/**
 * 检查在指定位置放置数字是否合法
 * @param {Array} grid - 数独网格
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 * @param {number} num - 要放置的数字
 * @returns {boolean} 是否合法
 */
function isValidPlacement(grid, row, col, num) {
    // 检查行
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) {
            return false;
        }
    }
    
    // 检查列
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) {
            return false;
        }
    }
    
    // 检查3x3区域
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[boxRow + i][boxCol + j] === num) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * 获取当前游戏的数据
 * 适配不同页面的游戏实例
 * @returns {Object} 游戏数据对象
 */
function getCurrentGameData() {
    // 判断当前页面类型
    const currentPage = getCurrentPage();
    let gameData = null;
    
    if (currentPage === 'index') {
        // 首页数独
        gameData = window.game || null;
        if (gameData) {
            return {
                grid: gameData.grid || gameData.board,
                fixed: gameData.fixed || gameData.initialBoard,
                solution: gameData.solution,
                difficulty: gameData.difficulty,
                id: null
            };
        }
    } else if (currentPage === 'daily-challenge') {
        // 每日挑战页面
        const challengeGame = window.challengeGame || null;
        if (challengeGame) {
            return {
                grid: challengeGame.grid || challengeGame.board,
                fixed: challengeGame.fixed || challengeGame.initialBoard,
                solution: challengeGame.solution,
                difficulty: challengeGame.difficulty,
                id: 'Daily-' + new Date().toISOString().split('T')[0]
            };
        }
    } else if (currentPage === 'classic-mode') {
        // 经典模式页面
        const classicGame = window.classicGame || null;
        if (classicGame) {
            return {
                grid: classicGame.grid || classicGame.board,
                fixed: classicGame.fixed || classicGame.initialBoard,
                solution: classicGame.solution,
                difficulty: classicGame.difficulty,
                id: classicGame.puzzleId || document.querySelector('.puzzle-id')?.textContent || null
            };
        }
    }
    
    // 如果无法确定游戏实例，尝试从DOM中获取数据
    return getGameDataFromDOM();
}

/**
 * 从DOM结构中获取数独数据
 * 用于在无法直接访问游戏实例时的备选方案
 * @returns {Object|null} 游戏数据对象或null
 */
function getGameDataFromDOM() {
    // 寻找数独网格
    const sudokuGrid = document.querySelector('.sudoku-grid, #sudoku-board, #challenge-grid, #classic-grid');
    if (!sudokuGrid) return null;
    
    // 获取所有单元格
    const cells = sudokuGrid.querySelectorAll('.sudoku-cell');
    if (cells.length !== 81) return null;
    
    // 创建9x9的网格
    const grid = Array(9).fill().map(() => Array(9).fill(0));
    const fixed = Array(9).fill().map(() => Array(9).fill(false));
    
    // 遍历单元格，获取数据
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        // 获取单元格的值
        const value = cell.textContent.trim();
        if (value && /^[1-9]$/.test(value)) {
            grid[row][col] = parseInt(value);
            
            // 判断是否为固定单元格
            if (cell.classList.contains('fixed') || cell.classList.contains('preset') || cell.hasAttribute('readonly')) {
                fixed[row][col] = true;
            }
        }
    });
    
    // 获取难度信息
    let difficulty = 1; // 默认为简单
    const difficultyElem = document.querySelector('.difficulty-value, .challenge-difficulty .difficulty-stars');
    if (difficultyElem) {
        const difficultyText = difficultyElem.textContent.trim();
        if (difficultyText.includes('★★★★★')) {
            difficulty = 4; // 专家
        } else if (difficultyText.includes('★★★★')) {
            difficulty = 3; // 困难
        } else if (difficultyText.includes('★★★')) {
            difficulty = 2; // 中等
        }
    }
    
    return {
        grid: grid,
        fixed: fixed,
        solution: null, // DOM中无法获取解答
        difficulty: difficulty,
        id: null
    };
}

/**
 * 获取当前页面类型
 * @returns {string} 页面类型 (index, daily-challenge, classic-mode)
 */
function getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('daily-challenge')) {
        return 'daily-challenge';
    } else if (path.includes('classic-mode')) {
        return 'classic-mode';
    } else {
        return 'index';
    }
} 