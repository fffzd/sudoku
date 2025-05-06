/**
 * 数独游戏核心逻辑
 * 包含数独游戏的生成、求解和验证算法
 */

class Sudoku {
    /**
     * 创建一个数独游戏实例
     * @param {number} difficulty - 难度级别 (1:简单, 2:中等, 3:困难, 4:专家)
     */
    constructor(difficulty = 1) {
        // 初始化9x9的数独网格
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        // 初始给定的数字位置
        this.fixed = Array(9).fill().map(() => Array(9).fill(false));
        // 保存初始的谜题
        this.puzzle = null;
        // 保存完整的解答
        this.solution = null;
        // 游戏难度
        this.difficulty = difficulty;
        // 游戏状态
        this.gameStarted = false;
        this.gameFinished = false;
        this.startTime = null;
        this.elapsedTime = 0;
        this.errorCount = 0;
        this.maxErrors = 3; // 最大错误次数
        // 历史记录，用于撤销功能
        this.history = [];
        this.historyIndex = -1;
        // 数字统计，用于显示剩余数字
        this.numberStats = [0, 9, 9, 9, 9, 9, 9, 9, 9, 9]; // 索引0不使用，1-9表示各数字剩余个数
        // 生成数独谜题
        this.generate();
    }

    /**
     * 生成数独谜题
     */
    generate() {
        // 1. 生成完整的随机解答
        this.generateSolution();
        
        // 2. 根据难度移除适当数量的数字，创建谜题
        this.createPuzzle();
        
        // 3. 保存初始谜题状态
        this.puzzle = this.copyGrid(this.grid);
        
        // 4. 标记固定的数字
        this.markFixedCells();
    }

    /**
     * 生成完整的随机解答
     */
    generateSolution() {
        // 清空网格
        this.clearGrid();
        
        // 填充对角线上的3个3x3方块（这些可以独立填充而不会互相影响）
        for (let i = 0; i < 9; i += 3) {
            this.fillBox(i, i);
        }
        
        // 使用回溯法填充剩余的单元格
        this.solveSudoku();
        
        // 保存完整的解答
        this.solution = this.copyGrid(this.grid);
    }

    /**
     * 清空数独网格
     */
    clearGrid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                this.grid[row][col] = 0;
            }
        }
    }

    /**
     * 填充3x3的方块
     * @param {number} row - 起始行索引
     * @param {number} col - 起始列索引
     */
    fillBox(row, col) {
        const nums = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        let index = 0;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.grid[row + i][col + j] = nums[index++];
            }
        }
    }

    /**
     * 使用回溯法解决数独
     * @returns {boolean} 是否成功解决
     */
    solveSudoku() {
        // 寻找空白单元格
        const emptyCell = this.findEmptyCell();
        
        // 如果没有空白单元格，说明数独已解决
        if (!emptyCell) {
            return true;
        }
        
        const [row, col] = emptyCell;
        
        // 尝试填入1-9的数字
        const nums = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
            // 检查是否可以放置该数字
            if (this.isSafe(row, col, num)) {
                // 尝试放置数字
                this.grid[row][col] = num;
                
                // 递归解决剩余的数独
                if (this.solveSudoku()) {
                    return true;
                }
                
                // 如果无法解决，回溯
                this.grid[row][col] = 0;
            }
        }
        
        // 无解，触发回溯
        return false;
    }

    /**
     * 寻找空白单元格
     * @returns {[number, number]|null} 空白单元格的位置 [row, col] 或 null
     */
    findEmptyCell() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    /**
     * 检查在指定位置放置数字是否安全
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} num - 要放置的数字
     * @returns {boolean} 是否安全
     */
    isSafe(row, col, num) {
        // 检查行
        for (let x = 0; x < 9; x++) {
            if (this.grid[row][x] === num) {
                return false;
            }
        }
        
        // 检查列
        for (let x = 0; x < 9; x++) {
            if (this.grid[x][col] === num) {
                return false;
            }
        }
        
        // 检查3x3方块
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[boxRow + i][boxCol + j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 根据难度创建数独谜题
     */
    createPuzzle() {
        // 根据难度确定要移除的单元格数量
        let cellsToRemove;
        switch (this.difficulty) {
            case 1: // 简单
                cellsToRemove = 35; // 保留46个数字
                break;
            case 2: // 中等
                cellsToRemove = 45; // 保留36个数字
                break;
            case 3: // 困难
                cellsToRemove = 52; // 保留29个数字
                break;
            case 4: // 专家
                cellsToRemove = 58; // 保留23个数字
                break;
            default:
                cellsToRemove = 45;
        }
        
        // 创建所有单元格的位置列表
        const positions = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                positions.push([row, col]);
            }
        }
        
        // 随机打乱位置列表
        this.shuffleArray(positions);
        
        // 依次移除单元格，确保谜题仍有唯一解
        for (let i = 0; i < cellsToRemove; i++) {
            const [row, col] = positions[i];
            const temp = this.grid[row][col];
            this.grid[row][col] = 0;
            
            // 检查是否仍有唯一解（在高难度时跳过，以提高性能）
            if (this.difficulty >= 3 || this.hasUniqueSolution()) {
                continue;
            } else {
                // 如果没有唯一解，恢复单元格的值
                this.grid[row][col] = temp;
            }
        }
    }

    /**
     * 检查当前谜题是否有唯一解
     * （注意：这是简化版本，严格的唯一性检查需要更复杂的算法）
     * @returns {boolean} 是否有唯一解
     */
    hasUniqueSolution() {
        // 复制当前网格
        const tempGrid = this.copyGrid(this.grid);
        
        // 使用回溯法求解
        const solutions = [];
        this.findSolutions(tempGrid, solutions, 2);
        
        // 如果找到超过1个解，则不是唯一解
        return solutions.length === 1;
    }

    /**
     * 查找所有可能的解（最多查找maxCount个）
     * @param {number[][]} grid - 数独网格
     * @param {number[][][]} solutions - 解决方案列表
     * @param {number} maxCount - 最大解的数量
     * @returns {boolean} 是否找到解
     */
    findSolutions(grid, solutions, maxCount) {
        // 寻找空白单元格
        let emptyFound = false;
        let row = -1;
        let col = -1;
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === 0) {
                    row = i;
                    col = j;
                    emptyFound = true;
                    break;
                }
            }
            if (emptyFound) {
                break;
            }
        }
        
        // 如果没有空白单元格，找到一个解
        if (!emptyFound) {
            solutions.push(this.copyGrid(grid));
            return true;
        }
        
        // 尝试填入1-9的数字
        for (let num = 1; num <= 9; num++) {
            // 检查是否可以放置该数字
            if (this.isValid(grid, row, col, num)) {
                // 尝试放置数字
                grid[row][col] = num;
                
                // 递归查找更多解
                this.findSolutions(grid, solutions, maxCount);
                
                // 如果已找到足够多的解，返回
                if (solutions.length >= maxCount) {
                    return true;
                }
                
                // 回溯
                grid[row][col] = 0;
            }
        }
        
        return false;
    }

    /**
     * 检查在指定位置放置数字是否有效
     * @param {number[][]} grid - 数独网格
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} num - 要放置的数字
     * @returns {boolean} 是否有效
     */
    isValid(grid, row, col, num) {
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
        
        // 检查3x3方块
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
     * 标记固定的单元格
     */
    markFixedCells() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                this.fixed[row][col] = this.grid[row][col] !== 0;
            }
        }
    }

    /**
     * 复制数独网格
     * @param {number[][]} grid - 要复制的网格
     * @returns {number[][]} 复制后的网格
     */
    copyGrid(grid) {
        return grid.map(row => [...row]);
    }

    /**
     * 随机打乱数组
     * @param {Array} array - 要打乱的数组
     * @returns {Array} 打乱后的数组
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    /**
     * 随机打乱数组（内部方法）
     * @param {Array} array - 要打乱的数组
     * @returns {Array} 打乱后的数组
     * @private
     */
    _shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    /**
     * 设置单元格的值
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} value - 要设置的值 (0-9)
     * @returns {boolean} 是否设置成功
     */
    setCellValue(row, col, value) {
        // 如果是固定的单元格，不能修改
        if (this.fixed[row][col]) {
            return false;
        }
        
        // 设置值
        this.grid[row][col] = value;
        return true;
    }

    /**
     * 检查单元格的值是否正确
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 是否正确
     */
    isCellValueCorrect(row, col) {
        // 如果单元格为空，返回false
        if (this.grid[row][col] === 0) {
            return false;
        }
        
        // 检查是否与解答相符
        return this.grid[row][col] === this.solution[row][col];
    }

    /**
     * 获取单元格的正确值
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {number} 正确的值
     */
    getCellSolution(row, col) {
        return this.solution[row][col];
    }

    /**
     * 检查整个数独是否完成且正确
     * @returns {boolean} 是否完成且正确
     */
    isComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                // 如果有空单元格或值不正确，返回false
                if (this.grid[row][col] === 0 || !this.isCellValueCorrect(row, col)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 重置数独到初始状态
     */
    reset() {
        this.grid = this.copyGrid(this.puzzle);
    }

    /**
     * 更改难度并重新生成数独
     * @param {number} difficulty - 新的难度级别
     */
    changeDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.generate();
    }

    /**
     * 获取单元格的当前值
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {number} 单元格的值
     */
    getCellValue(row, col) {
        return this.grid[row][col];
    }

    /**
     * 检查单元格是否为固定的（初始给定的）
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 是否为固定的
     */
    isFixedCell(row, col) {
        return this.fixed[row][col];
    }

    /**
     * 获取特定位置所在的区域（3x3方块）
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {number} 区域索引 (0-8)
     */
    getRegion(row, col) {
        const regionRow = Math.floor(row / 3);
        const regionCol = Math.floor(col / 3);
        return regionRow * 3 + regionCol;
    }

    /**
     * 生成新的数独游戏
     * @param {string} difficulty - 游戏难度: easy, medium, hard, expert
     */
    newGame(difficulty) {
        this.difficulty = difficulty;
        this.gameStarted = true;
        this.gameFinished = false;
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.errorCount = 0;
        this.history = [];
        this.historyIndex = -1;
        
        // 生成完整的解决方案
        this._generateSolution();
        
        // 复制解决方案
        this.solution = this._deepCopyMatrix(this.grid);
        
        // 根据难度挖空
        this._createPuzzle(difficulty);
        
        // 更新数字统计
        this._updateNumberStats();
        
        return this.grid;
    }

    /**
     * 生成完整的数独解决方案
     * 使用回溯算法填充数独矩阵
     * @private
     */
    _generateSolution() {
        // 重置棋盘
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // 生成几个随机初始数字以增加变化性
        for (let i = 0; i < 3; i++) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            const num = Math.floor(Math.random() * 9) + 1;
            
            if (this._isValidPlacement(row, col, num)) {
                this.grid[row][col] = num;
            }
        }
        
        // 使用回溯算法填充剩余单元格
        this._solveSudoku();
    }

    /**
     * 使用回溯算法解决数独
     * @returns {boolean} - 是否成功解决
     * @private
     */
    _solveSudoku() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                // 跳过已填充的单元格
                if (this.grid[row][col] !== 0) continue;
                
                // 创建1-9的随机排列
                const nums = this._shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                
                for (const num of nums) {
                    if (this._isValidPlacement(row, col, num)) {
                        this.grid[row][col] = num;
                        
                        if (this._solveSudoku()) {
                            return true;
                        }
                        
                        // 回溯
                        this.grid[row][col] = 0;
                    }
                }
                
                return false; // 无法找到有效数字，需要回溯
            }
        }
        
        return true; // 全部单元格已填充
    }

    /**
     * 根据难度创建数独谜题
     * 通过移除解决方案中的数字来创建谜题
     * @param {string} difficulty - 游戏难度
     * @private
     */
    _createPuzzle(difficulty) {
        // 根据难度确定要移除的单元格数量
        let cellsToRemove;
        switch (difficulty) {
            case 'easy':
                cellsToRemove = 35; // 保留46个数字
                break;
            case 'medium':
                cellsToRemove = 45; // 保留36个数字
                break;
            case 'hard':
                cellsToRemove = 52; // 保留29个数字
                break;
            case 'expert':
                cellsToRemove = 58; // 保留23个数字
                break;
            default:
                cellsToRemove = 45;
        }
        
        // 初始化fixed数组，标记所有单元格为非固定
        this.fixed = Array(9).fill().map(() => Array(9).fill(true));
        
        // 创建所有单元格的位置列表
        const positions = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                positions.push([row, col]);
            }
        }
        
        // 随机打乱位置列表
        this._shuffleArray(positions);
        
        // 逐个移除单元格值，并检查是否仍然只有一个解
        for (let i = 0; i < cellsToRemove; i++) {
            const [row, col] = positions[i];
            const temp = this.grid[row][col];
            this.grid[row][col] = 0;
            this.fixed[row][col] = false;
            
            // 对于困难和专家难度，我们不检查唯一解
            // 这会导致谜题可能有多个解，但能够创建更难的谜题
            if (difficulty === 'easy' || difficulty === 'medium') {
                // 检查移除此单元格后是否仍然只有一个解
                const solutions = this._countSolutions(this._deepCopyMatrix(this.grid));
                
                if (solutions !== 1) {
                    // 如果不是唯一解，恢复单元格值
                    this.grid[row][col] = temp;
                    this.fixed[row][col] = true;
                }
            }
        }
        
        // 重置笔记
        this.notes = Array(9).fill().map(() => Array(9).fill().map(() => Array(9).fill(false)));
    }

    /**
     * 计算给定棋盘的解决方案数量
     * @param {Array<Array<number>>} board - 数独棋盘
     * @returns {number} - 解决方案数量
     * @private
     */
    _countSolutions(board) {
        // 仅计算前两个解，以确定是否有唯一解
        let count = 0;
        const maxSolutions = 2;
        
        const solve = (board) => {
            if (count >= maxSolutions) return;
            
            // 寻找第一个空单元格
            let row = -1;
            let col = -1;
            
            outerLoop: for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (board[r][c] === 0) {
                        row = r;
                        col = c;
                        break outerLoop;
                    }
                }
            }
            
            // 如果没有空单元格，找到一个解
            if (row === -1) {
                count++;
                return;
            }
            
            // 尝试每个数字
            for (let num = 1; num <= 9; num++) {
                if (this._isValidPlacementInBoard(board, row, col, num)) {
                    board[row][col] = num;
                    solve(board);
                    board[row][col] = 0; // 回溯
                }
            }
        };
        
        solve(board);
        return count;
    }

    /**
     * 检查在给定棋盘上特定位置放置数字是否有效
     * @param {Array<Array<number>>} board - 数独棋盘
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} num - 要放置的数字
     * @returns {boolean} - 是否有效
     * @private
     */
    _isValidPlacementInBoard(board, row, col, num) {
        // 检查行
        for (let c = 0; c < 9; c++) {
            if (board[row][c] === num) {
                return false;
            }
        }
        
        // 检查列
        for (let r = 0; r < 9; r++) {
            if (board[r][col] === num) {
                return false;
            }
        }
        
        // 检查3x3宫格
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[boxRow + r][boxCol + c] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 检查在特定位置放置数字是否有效
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} num - 要放置的数字
     * @returns {boolean} - 是否有效
     * @private
     */
    _isValidPlacement(row, col, num) {
        // 检查行
        for (let c = 0; c < 9; c++) {
            if (this.grid[row][c] === num) {
                return false;
            }
        }
        
        // 检查列
        for (let r = 0; r < 9; r++) {
            if (this.grid[r][col] === num) {
                return false;
            }
        }
        
        // 检查3x3宫格
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (this.grid[boxRow + r][boxCol + c] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 在指定位置填入数字
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @param {number} num - 要填入的数字
     * @param {boolean} isNote - 是否为笔记模式
     * @returns {Object} 结果对象，包含是否成功、是否完成等信息
     */
    fillNumber(row, col, num, isNote = false) {
        // 检查是否为固定单元格
        if (this.fixed[row][col]) {
            return { success: false, message: '无法修改初始数字' };
        }
        
        // 添加到历史记录
        this._addToHistory({
            type: 'fill',
            row,
            col,
            oldValue: this.grid[row][col],
            oldNotes: [...this.notes[row][col]],
            isNote
        });
        
        if (isNote) {
            // 笔记模式：切换笔记中的数字
            this.notes[row][col][num - 1] = !this.notes[row][col][num - 1];
            return { success: true };
        } else {
            // 填入模式：检查是否正确
            const isCorrect = (num === this.solution[row][col]);
            
            // 如果填入新数字，先清除笔记
            if (num !== 0) {
                this.notes[row][col] = Array(9).fill(false);
            }
            
            // 更新棋盘
            const oldValue = this.grid[row][col];
            this.grid[row][col] = num;
            
            // 更新数字统计
            this._updateNumberStats();
            
            // 检查是否填错了数字
            if (num !== 0 && !isCorrect) {
                this.errorCount++;
                
                // 检查是否达到最大错误次数
                if (this.maxErrors > 0 && this.errorCount >= this.maxErrors) {
                    return { 
                        success: true, 
                        isCorrect: false, 
                        gameOver: true, 
                        message: '错误次数过多，游戏结束！' 
                    };
                }
                
                return { success: true, isCorrect: false };
            }
            
            // 检查游戏是否完成
            const completed = this._checkCompletion();
            if (completed) {
                this.gameFinished = true;
                return { 
                    success: true, 
                    isCorrect: true, 
                    completed: true, 
                    time: this.elapsedTime,
                    difficulty: this.difficulty,
                    errors: this.errorCount
                };
            }
            
            return { success: true, isCorrect: true };
        }
    }

    /**
     * 检查数独是否已完成
     * @returns {boolean} - 是否完成
     * @private
     */
    _checkCompletion() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0 || this.grid[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 获取提示
     * 随机填入一个空单元格
     * @returns {Object|null} - 提示信息，如果没有可用提示则返回null
     */
    getHint() {
        // 找出所有空单元格
        const emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push([row, col]);
                }
            }
        }
        
        // 如果没有空单元格，返回null
        if (emptyCells.length === 0) {
            return null;
        }
        
        // 随机选择一个空单元格
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const [row, col] = emptyCells[randomIndex];
        const correctNumber = this.solution[row][col];
        
        // 添加到历史记录
        this._addToHistory({
            type: 'hint',
            row,
            col,
            oldValue: this.grid[row][col],
            oldNotes: [...this.notes[row][col]]
        });
        
        // 更新棋盘和数字统计
        this.grid[row][col] = correctNumber;
        this.notes[row][col] = Array(9).fill(false);
        this._updateNumberStats();
        
        // 检查游戏是否完成
        const completed = this._checkCompletion();
        if (completed) {
            this.gameFinished = true;
            return { 
                hint: { row, col, value: correctNumber }, 
                completed: true,
                time: this.elapsedTime,
                difficulty: this.difficulty,
                errors: this.errorCount
            };
        }
        
        return { hint: { row, col, value: correctNumber } };
    }

    /**
     * 检查当前答案是否正确
     * 检查所有已填入的单元格是否与解决方案匹配
     * @returns {Array<Object>} - 错误单元格的列表
     */
    checkAnswers() {
        const errors = [];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                // 跳过空单元格和固定单元格
                if (this.grid[row][col] === 0 || this.fixed[row][col]) {
                    continue;
                }
                
                // 检查是否与解决方案匹配
                if (this.grid[row][col] !== this.solution[row][col]) {
                    errors.push({ row, col });
                }
            }
        }
        
        return errors;
    }

    /**
     * 撤销上一步操作
     * @returns {Object|null} - 撤销信息，如果没有可撤销的操作则返回null
     */
    undo() {
        if (this.historyIndex < 0) {
            return null; // 没有历史记录可撤销
        }
        
        const action = this.history[this.historyIndex];
        this.historyIndex--;
        
        switch (action.type) {
            case 'fill':
            case 'hint':
                this.grid[action.row][action.col] = action.oldValue;
                this.notes[action.row][action.col] = [...action.oldNotes];
                break;
            case 'erase':
                this.grid[action.row][action.col] = action.oldValue;
                this.notes[action.row][action.col] = [...action.oldNotes];
                break;
            // 可以扩展支持更多操作类型
        }
        
        // 更新数字统计
        this._updateNumberStats();
        
        return { action: 'undo', record: action };
    }

    /**
     * 清除指定单元格的内容
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {Object} - 结果对象
     */
    eraseCell(row, col) {
        // 检查是否为固定单元格
        if (this.fixed[row][col]) {
            return { success: false, message: '无法修改初始数字' };
        }
        
        // 如果单元格已经是空的，并且没有笔记，则无需操作
        if (this.grid[row][col] === 0 && !this.notes[row][col].some(note => note)) {
            return { success: false, message: '单元格已经是空的' };
        }
        
        // 添加到历史记录
        this._addToHistory({
            type: 'erase',
            row,
            col,
            oldValue: this.grid[row][col],
            oldNotes: [...this.notes[row][col]]
        });
        
        // 清除单元格的值和笔记
        this.grid[row][col] = 0;
        this.notes[row][col] = Array(9).fill(false);
        
        // 更新数字统计
        this._updateNumberStats();
        
        return { success: true };
    }

    /**
     * 更新游戏时间
     * @param {number} elapsed - 经过的时间（毫秒）
     */
    updateTime(elapsed) {
        this.elapsedTime = elapsed;
    }

    /**
     * 添加操作到历史记录
     * @param {Object} action - 操作对象
     * @private
     */
    _addToHistory(action) {
        // 如果当前不是最新状态，删除后面的历史记录
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // 添加新操作
        this.history.push(action);
        this.historyIndex = this.history.length - 1;
        
        // 限制历史记录长度
        const maxHistoryLength = 100;
        if (this.history.length > maxHistoryLength) {
            this.history = this.history.slice(this.history.length - maxHistoryLength);
            this.historyIndex = this.history.length - 1;
        }
    }

    /**
     * 更新数字使用统计
     * @private
     */
    _updateNumberStats() {
        // 重置计数
        this.numberStats = [0, 9, 9, 9, 9, 9, 9, 9, 9, 9];
        
        // 计算已使用的数字
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = this.grid[row][col];
                if (num > 0) {
                    this.numberStats[num]--;
                }
            }
        }
    }

    /**
     * 深拷贝矩阵
     * @param {Array<Array<number>>} matrix - 要拷贝的矩阵
     * @returns {Array<Array<number>>} - 拷贝后的新矩阵
     * @private
     */
    _deepCopyMatrix(matrix) {
        return matrix.map(row => [...row]);
    }

    /**
     * 获取当前游戏状态
     * @returns {Object} - 游戏状态对象
     */
    getGameState() {
        return {
            board: this._deepCopyMatrix(this.grid),
            fixed: this._deepCopyMatrix(this.fixed),
            notes: this.notes.map(row => row.map(cell => [...cell])),
            solution: this._deepCopyMatrix(this.solution),
            difficulty: this.difficulty,
            gameStarted: this.gameStarted,
            gameFinished: this.gameFinished,
            elapsedTime: this.elapsedTime,
            errorCount: this.errorCount,
            numberStats: [...this.numberStats]
        };
    }

    /**
     * 恢复游戏状态
     * @param {Object} state - 游戏状态对象
     */
    restoreGameState(state) {
        if (!state) return;
        
        this.grid = this._deepCopyMatrix(state.board);
        this.fixed = this._deepCopyMatrix(state.fixed);
        this.notes = state.notes.map(row => row.map(cell => [...cell]));
        this.solution = this._deepCopyMatrix(state.solution);
        this.difficulty = state.difficulty;
        this.gameStarted = state.gameStarted;
        this.gameFinished = state.gameFinished;
        this.elapsedTime = state.elapsedTime;
        this.errorCount = state.errorCount;
        this.numberStats = [...state.numberStats];
        
        // 重置历史记录
        this.history = [];
        this.historyIndex = -1;
    }
}

// 导出Sudoku类，供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Sudoku };
} else {
    window.Sudoku = Sudoku;
} 