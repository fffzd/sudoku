// 数独学堂 - 经典模式JavaScript文件

// 全局变量
let selectedNumber = null; // 当前选中的数字
let selectedCell = null; // 当前选中的单元格
let notesMode = false; // 笔记模式状态
let checkMode = false; // 检查模式状态
let currentGrid = []; // 当前数独状态
let solutionGrid = []; // 解决方案
let difficultyLevel = 2; // 默认难度等级（1-5）
let isGameComplete = false; // 游戏是否完成
let currentPuzzleId = ''; // 当前谜题ID
let currentLibraryPage = 1; // 当前题库页码
let currentLibraryCategory = '精选题库'; // 当前选中的题库分类
let currentSearchTerm = ''; // 当前搜索词
let userGeneratedPuzzles = []; // 用户生成的题目

// 困难级别对应的名称和星级显示
const difficultyMapping = [
    { name: "入门", stars: "★☆☆☆☆" },
    { name: "简单", stars: "★★☆☆☆" },
    { name: "中级", stars: "★★★☆☆" },
    { name: "困难", stars: "★★★★☆" },
    { name: "专家", stars: "★★★★★" }
];

// 预定义的题库（格式：ID, 难度, 初始网格, 解决方案）
const puzzleLibrary = [
    {
        id: "CLS-2023-0101-001",
        difficulty: 1,
        grid: [
            5,3,0,0,7,0,0,0,0,
            6,0,0,1,9,5,0,0,0,
            0,9,8,0,0,0,0,6,0,
            8,0,0,0,6,0,0,0,3,
            4,0,0,8,0,3,0,0,1,
            7,0,0,0,2,0,0,0,6,
            0,6,0,0,0,0,2,8,0,
            0,0,0,4,1,9,0,0,5,
            0,0,0,0,8,0,0,7,9
        ],
        solution: [
            5,3,4,6,7,8,9,1,2,
            6,7,2,1,9,5,3,4,8,
            1,9,8,3,4,2,5,6,7,
            8,5,9,7,6,1,4,2,3,
            4,2,6,8,5,3,7,9,1,
            7,1,3,9,2,4,8,5,6,
            9,6,1,5,3,7,2,8,4,
            2,8,7,4,1,9,6,3,5,
            3,4,5,2,8,6,1,7,9
        ]
    },
    {
        id: "CLS-2023-0202-002",
        difficulty: 2,
        grid: [
            0,0,0,2,6,0,7,0,1,
            6,8,0,0,7,0,0,9,0,
            1,9,0,0,0,4,5,0,0,
            8,2,0,1,0,0,0,4,0,
            0,0,4,6,0,2,9,0,0,
            0,5,0,0,0,3,0,2,8,
            0,0,9,3,0,0,0,7,4,
            0,4,0,0,5,0,0,3,6,
            7,0,3,0,1,8,0,0,0
        ],
        solution: [
            4,3,5,2,6,9,7,8,1,
            6,8,2,5,7,1,4,9,3,
            1,9,7,8,3,4,5,6,2,
            8,2,6,1,9,5,3,4,7,
            3,7,4,6,8,2,9,1,5,
            9,5,1,7,4,3,6,2,8,
            5,1,9,3,2,6,8,7,4,
            2,4,8,9,5,7,1,3,6,
            7,6,3,4,1,8,2,5,9
        ]
    },
    {
        id: "CLS-2023-0303-003",
        difficulty: 3,
        grid: [
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,3,0,8,5,
            0,0,1,0,2,0,0,0,0,
            0,0,0,5,0,7,0,0,0,
            0,0,4,0,0,0,1,0,0,
            0,9,0,0,0,0,0,0,0,
            5,0,0,0,0,0,0,7,3,
            0,0,2,0,1,0,0,0,0,
            0,0,0,0,4,0,0,0,9
        ],
        solution: [
            9,8,7,6,5,4,3,2,1,
            2,4,6,1,7,3,9,8,5,
            3,5,1,9,2,8,7,4,6,
            1,2,8,5,3,7,6,9,4,
            6,3,4,8,9,2,1,5,7,
            7,9,5,4,6,1,8,3,2,
            5,1,9,2,8,6,4,7,3,
            4,7,2,3,1,9,5,6,8,
            8,6,3,7,4,5,2,1,9
        ]
    },
    {
        id: "CLS-2023-0404-004",
        difficulty: 4,
        grid: [
            0,2,0,0,0,0,0,0,0,
            0,0,0,6,0,0,0,0,3,
            0,7,4,0,8,0,0,0,0,
            0,0,0,0,0,3,0,0,2,
            0,8,0,0,4,0,0,1,0,
            6,0,0,5,0,0,0,0,0,
            0,0,0,0,1,0,7,8,0,
            5,0,0,0,0,9,0,0,0,
            0,0,0,0,0,0,0,4,0
        ],
        solution: [
            1,2,6,4,3,7,9,5,8,
            8,9,5,6,2,1,4,7,3,
            3,7,4,9,8,5,1,2,6,
            4,5,7,1,9,3,8,6,2,
            9,8,3,2,4,6,5,1,7,
            6,1,2,5,7,8,3,9,4,
            2,3,9,4,1,5,7,8,6,
            5,4,8,7,6,9,2,3,1,
            7,6,1,8,5,2,9,4,3
        ]
    },
    {
        id: "CLS-2023-0505-005",
        difficulty: 5,
        grid: [
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,3,0,8,5,
            0,0,1,0,2,0,0,0,0,
            0,0,0,5,0,7,0,0,0,
            0,0,4,0,0,0,1,0,0,
            0,9,0,0,0,0,0,0,0,
            5,0,0,0,0,0,0,7,3,
            0,0,2,0,1,0,0,0,0,
            0,0,0,0,4,0,0,0,9
        ],
        solution: [
            9,8,7,6,5,4,3,2,1,
            2,4,6,1,7,3,9,8,5,
            3,5,1,9,2,8,7,4,6,
            1,2,8,5,3,7,6,9,4,
            6,3,4,8,9,2,1,5,7,
            7,9,5,4,6,1,8,3,2,
            5,1,9,2,8,6,4,7,3,
            4,7,2,3,1,9,5,6,8,
            8,6,3,7,4,5,2,1,9
        ]
    },
    {
        id: "GSM-2023-0101",
        difficulty: 2,
        grid: [
            0,0,3,0,0,8,0,0,0,
            0,0,0,0,1,0,5,0,7,
            0,0,0,0,0,0,3,1,0,
            8,0,0,0,0,3,0,9,0,
            0,7,0,0,0,0,0,6,0,
            0,1,0,7,0,0,0,0,4,
            0,9,8,0,0,0,0,0,0,
            5,0,7,0,4,0,0,0,0,
            0,0,0,9,0,0,2,0,0
        ],
        solution: [
            1,5,3,2,7,8,4,6,9,
            9,8,2,4,1,6,5,3,7,
            7,6,4,5,3,9,3,1,2,
            8,4,5,1,2,3,7,9,6,
            3,7,9,8,5,4,1,6,2,
            2,1,6,7,9,5,8,3,4,
            4,9,8,3,6,7,1,2,5,
            5,3,7,6,4,2,9,8,1,
            6,2,1,9,8,5,2,7,3
        ]
    },
    {
        id: "GSM-2023-0202",
        difficulty: 3,
        grid: [
            1,0,0,4,0,0,0,0,0,
            0,2,0,0,0,0,0,0,0,
            0,0,3,0,0,0,7,0,0,
            0,0,0,1,0,0,0,0,0,
            0,0,0,0,2,0,0,0,0,
            0,0,0,0,0,3,0,0,0,
            0,0,1,0,0,0,4,0,0,
            0,0,0,0,0,0,0,5,0,
            0,0,0,0,0,6,0,0,7
        ],
        solution: [
            1,9,8,4,7,5,6,3,2,
            7,2,6,3,9,8,5,1,4,
            5,4,3,6,1,2,7,9,8,
            9,5,4,1,3,7,8,2,6,
            8,1,7,5,2,4,3,6,9,
            6,3,2,9,8,3,1,7,5,
            3,7,1,2,5,9,4,8,6,
            4,6,9,8,3,1,2,5,3,
            2,8,5,7,4,6,9,3,7
        ]
    },
    {
        id: "GSM-2023-0303",
        difficulty: 4,
        grid: [
            0,0,0,9,0,0,0,0,2,
            0,5,0,1,2,3,4,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,6,
            0,0,8,0,0,0,1,0,0,
            4,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,6,4,1,5,0,3,0,
            5,0,0,0,0,7,0,0,0
        ],
        solution: [
            6,3,1,9,8,4,7,5,2,
            8,5,7,1,2,3,4,6,9,
            2,9,4,5,7,6,3,1,8,
            1,2,5,7,3,9,8,4,6,
            3,7,8,6,4,2,1,9,5,
            4,6,9,8,5,1,2,7,3,
            9,8,2,3,6,8,5,4,7,
            7,1,6,4,1,5,9,3,8,
            5,4,3,2,9,7,6,8,1
        ]
    },
    {
        id: "GSM-2023-0404",
        difficulty: 4,
        grid: [
            0,0,5,3,0,0,0,0,0,
            8,0,0,0,0,0,0,2,0,
            0,7,0,0,1,0,5,0,0,
            4,0,0,0,0,5,3,0,0,
            0,1,0,0,7,0,0,0,6,
            0,0,3,2,0,0,0,8,0,
            0,6,0,5,0,0,0,0,9,
            0,0,4,0,0,0,0,3,0,
            0,0,0,0,0,9,7,0,0
        ],
        solution: [
            1,9,5,3,4,2,6,7,8,
            8,3,6,1,9,7,4,2,5,
            2,7,9,8,1,6,5,4,3,
            4,2,7,9,6,5,3,1,8,
            5,1,3,4,7,8,9,2,6,
            9,6,3,2,5,1,4,8,7,
            7,6,8,5,3,4,2,1,9,
            6,5,4,7,2,8,1,3,9,
            3,8,1,6,4,9,7,5,2
        ]
    },
    {
        id: "GSM-2023-0505",
        difficulty: 5,
        grid: [
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,1,0,0,0,0,0,0,0,
            0,0,0,0,0,0,2,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0
        ],
        solution: [
            2,3,8,6,5,1,9,4,7,
            6,5,9,8,4,7,3,2,1,
            7,4,1,9,3,2,5,8,6,
            3,9,5,4,7,8,6,1,2,
            8,1,6,2,9,5,7,3,4,
            4,7,2,1,6,3,2,9,5,
            9,2,3,5,8,6,1,7,4,
            1,8,4,7,2,9,3,5,6,
            5,6,7,3,1,4,8,2,9
        ]
    }
];

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化选项卡切换
    setupTabSwitching();
    
    // 初始化难度滑块
    setupDifficultySlider();
    
    // 加载用户生成的题目
    loadUserGeneratedPuzzles();
    
    // 合并预定义题库和用户生成题库
    mergePuzzleLibraries();
    
    // 生成初始数独
    generateSudoku(difficultyLevel);
    
    // 设置数字选择器事件
    setupNumberSelector();
    
    // 设置功能按钮事件
    setupFunctionButtons();
    
    // 设置新游戏按钮事件
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function() {
            generateSudoku(difficultyLevel);
        });
    }
    
    // 设置生成按钮事件
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            generateSudoku(difficultyLevel);
        });
    }
    
    // 设置保存到题库按钮事件
    const saveToLibraryBtn = document.getElementById('save-to-library-btn');
    if (saveToLibraryBtn) {
        saveToLibraryBtn.addEventListener('click', function() {
            savePuzzleToLibrary();
        });
    }
    
    // 设置题库和序号跳转功能
    setupLibraryFunctions();
});

/**
 * 设置选项卡切换功能
 */
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有选项卡的激活状态
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 添加当前选项卡的激活状态
            this.classList.add('active');
            
            // 获取目标选项卡ID
            const targetTab = this.getAttribute('data-tab');
            
            // 隐藏所有选项卡内容
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // 显示目标选项卡内容
            document.getElementById(targetTab + '-tab').style.display = 'block';
        });
    });
}

/**
 * 设置难度滑块功能
 */
function setupDifficultySlider() {
    const slider = document.getElementById('difficulty-slider');
    const difficultyStars = document.getElementById('difficulty-stars');
    const difficultyName = document.getElementById('difficulty-name');
    
    if (slider && difficultyStars && difficultyName) {
        // 初始化显示
        updateDifficultyDisplay(slider.value);
        
        // 监听滑块变化
        slider.addEventListener('input', function() {
            difficultyLevel = parseInt(this.value);
            updateDifficultyDisplay(difficultyLevel);
        });
    }
}

/**
 * 更新难度显示
 * @param {number} level - 难度级别（1-5）
 */
function updateDifficultyDisplay(level) {
    const index = level - 1;
    const difficultyStars = document.getElementById('difficulty-stars');
    const difficultyName = document.getElementById('difficulty-name');
    
    if (difficultyStars && difficultyName) {
        difficultyStars.textContent = difficultyMapping[index].stars;
        difficultyName.textContent = difficultyMapping[index].name;
    }
    
    // 更新当前难度信息
    const puzzleDifficultyStars = document.querySelector('.puzzle-difficulty .difficulty-stars');
    if (puzzleDifficultyStars) {
        puzzleDifficultyStars.textContent = difficultyMapping[index].stars;
    }
}

/**
 * 生成新的数独谜题
 * @param {number} difficulty - 难度级别（1-5）
 */
function generateSudoku(difficulty) {
    // 重置游戏状态
    isGameComplete = false;
    selectedCell = null;
    selectedNumber = null;
    
    // 生成空数独盘
    const emptyGrid = Array(81).fill(0);
    
    // 生成解决方案（完整的数独盘）
    solutionGrid = generateSolutionGrid(emptyGrid);
    
    // 根据难度移除适当数量的数字
    currentGrid = [...solutionGrid];
    removeNumbers(currentGrid, difficulty);
    
    // 初始化数独网格
    initSudokuGrid();
    
    // 更新难度显示
    updateDifficultyDisplay(difficulty);
    
    // 更新ID显示
    updatePuzzleId();
    // 题目生成后同步AI助手
    if (window.syncSudokuToAI) window.syncSudokuToAI();
}

/**
 * 更新数独谜题ID
 */
function updatePuzzleId() {
    const puzzleIdElement = document.querySelector('.puzzle-id');
    if (puzzleIdElement) {
        // 生成一个基于日期和随机数的ID
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        currentPuzzleId = `CLS-${year}-${month}${day}-${random}`;
        puzzleIdElement.textContent = `ID: ${currentPuzzleId}`;
    }
}

/**
 * 生成完整的数独解决方案
 * @param {Array} grid - 初始网格
 * @returns {Array} 完整的数独解决方案
 */
function generateSolutionGrid(grid) {
    // 为简化实现，这里使用一个预设的数独解决方案
    // 在实际应用中，应该使用回溯算法生成合法的数独解决方案
    return [
        5, 3, 4, 6, 7, 8, 9, 1, 2,
        6, 7, 2, 1, 9, 5, 3, 4, 8,
        1, 9, 8, 3, 4, 2, 5, 6, 7,
        8, 5, 9, 7, 6, 1, 4, 2, 3,
        4, 2, 6, 8, 5, 3, 7, 9, 1,
        7, 1, 3, 9, 2, 4, 8, 5, 6,
        9, 6, 1, 5, 3, 7, 2, 8, 4,
        2, 8, 7, 4, 1, 9, 6, 3, 5,
        3, 4, 5, 2, 8, 6, 1, 7, 9
    ];
}

/**
 * 根据难度从网格中移除数字
 * @param {Array} grid - 数独网格
 * @param {number} difficulty - 难度级别（1-5）
 */
function removeNumbers(grid, difficulty) {
    // 根据难度级别确定要移除的数字数量
    const removalCounts = [30, 40, 50, 55, 60]; // 每个难度级别对应的移除数量
    const count = removalCounts[difficulty - 1];
    
    // 创建索引数组（0-80）
    const indices = Array.from({ length: 81 }, (_, i) => i);
    
    // 随机打乱索引数组
    shuffleArray(indices);
    
    // 移除指定数量的数字
    for (let i = 0; i < count; i++) {
        const index = indices[i];
        grid[index] = 0;
    }
}

/**
 * 随机打乱数组
 * @param {Array} array - 要打乱的数组
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * 初始化数独网格
 */
function initSudokuGrid() {
    const grid = document.getElementById('classic-grid');
    if (!grid) return;
    
    // 清空网格
    grid.innerHTML = '';
    
    // 创建81个格子
    for (let i = 0; i < 81; i++) {
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
        if (currentGrid[i] !== 0) {
            cell.textContent = currentGrid[i];
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
    }
}

/**
 * 处理单元格点击事件
 */
function handleCellClick() {
    // 如果游戏已完成，不响应点击
    if (isGameComplete) return;
    
    // 移除其他单元格的选中状态
    document.querySelectorAll('.sudoku-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // 添加选中状态
    this.classList.add('selected');
    selectedCell = this;
    
    // 高亮相关单元格（同行、同列、同宫）
    highlightRelatedCells(this);
    
    // 如果有选中数字且不是笔记模式，直接填入数字
    if (selectedNumber !== null && !notesMode) {
        fillNumber(selectedNumber);
        // 用户填写数字后同步AI助手
        if (window.syncSudokuToAI) window.syncSudokuToAI();
    }
    // 如果有选中数字且是笔记模式，更新笔记
    else if (selectedNumber !== null && notesMode) {
        toggleNote(selectedNumber);
        // 用户填写笔记后同步AI助手
        if (window.syncSudokuToAI) window.syncSudokuToAI();
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
        selectedCell.classList.remove('error'); // 移除错误标记
        
        // 在selectedCell中找到笔记容器并显示
        const notesContainer = selectedCell.querySelector('.notes');
        if (notesContainer) {
            notesContainer.style.display = '';
        }
        
        return;
    }
    
    // 填入数字
    selectedCell.textContent = number;
    currentGrid[index] = number;
    
    // 如果在检查模式下，检查填入的数字是否正确
    if (checkMode) {
    if (number !== solutionGrid[index]) {
        selectedCell.classList.add('error');
    } else {
            selectedCell.classList.remove('error');
        }
    }
    
    // 移除笔记容器
        const notesContainer = selectedCell.querySelector('.notes');
        if (notesContainer) {
            notesContainer.style.display = 'none';
        }
        
        // 检查是否完成游戏
        checkGameCompletion();

        // 填入数字后，自动取消数字按钮选中状态，实现单次输入
        selectedNumber = null;
        document.querySelectorAll('.number-btn.selected').forEach(el => el.classList.remove('selected'));
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
    // 填入笔记后，自动取消数字按钮选中状态，实现单次输入
    selectedNumber = null;
    document.querySelectorAll('.number-btn.selected').forEach(el => el.classList.remove('selected'));
    // 填入笔记后，自动取消单元格选中状态
    if (selectedCell) {
        selectedCell.classList.remove('selected');
        selectedCell = null;
    }
}

/**
 * 设置功能按钮事件
 */
function setupFunctionButtons() {
    // 提示按钮
    const hintBtn = document.getElementById('hint-button');
    if (hintBtn) {
        hintBtn.addEventListener('click', giveHint);
    }
    
    // 笔记模式按钮
    const notesBtn = document.getElementById('notes-button');
    const notesStatus = document.querySelector('.notes-status-indicator');
    
    if (notesBtn && notesStatus) {
        notesBtn.addEventListener('click', function() {
            notesMode = !notesMode;
            // 更新笔记模式状态
            if (notesMode) {
                notesStatus.textContent = '开启';
                notesStatus.classList.add('active'); // 添加active类，启用动画
            } else {
                notesStatus.textContent = '关闭';
                notesStatus.classList.remove('active'); // 移除active类，关闭动画
            }
        });
    }
    
    // 检查按钮
    const checkBtn = document.getElementById('check-button');
    const checkStatus = document.querySelector('.check-status-indicator');
    if (checkBtn && checkStatus) {
        checkBtn.addEventListener('click', function() {
            checkMode = !checkMode;
            // 更新检查模式状态
            if (checkMode) {
                checkStatus.textContent = '开启';
                checkStatus.classList.add('active'); // 添加active类，启用动画
                // 立即检查所有已填数字
                checkAllNumbers();
            } else {
                checkStatus.textContent = '关闭';
                checkStatus.classList.remove('active'); // 移除active类，关闭动画
                // 移除所有错误标记
                removeAllErrorMarks();
            }
        });
    }
    
    // 重置按钮
    const resetBtn = document.getElementById('reset-button');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGrid);
    }

    // 清空笔记按钮
    const clearNotesBtn = document.getElementById('clear-note-btn');
    if (clearNotesBtn) {
        clearNotesBtn.addEventListener('click', function() {
            // 清空所有单元格的笔记
            document.querySelectorAll('.sudoku-cell.editable .notes').forEach(notesContainer => {
                notesContainer.querySelectorAll('.note-cell').forEach(noteCell => {
                    noteCell.textContent = '';
                });
            });
        });
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
        completeGame();
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
        currentGrid = Array(81).fill(0);
        
        // 遍历所有单元格，只保留初始预设的数字
        document.querySelectorAll('.sudoku-cell').forEach((cell, index) => {
            if (cell.classList.contains('preset')) {
                currentGrid[index] = solutionGrid[index];
            }
        });
        
        // 重新初始化网格
        initSudokuGrid();
        
        // 重置选中状态
        selectedCell = null;
        selectedNumber = null;
        
        // 重置游戏状态
        isGameComplete = false;
        
        // 移除所有错误标记
        removeAllErrorMarks();
        
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
    
    // 如果完成，显示祝贺信息
    if (isComplete) {
        completeGame();
    }
}

/**
 * 完成游戏
 */
function completeGame() {
    // 标记游戏已完成
    isGameComplete = true;
    
    // 显示祝贺信息
    setTimeout(() => {
        alert('恭喜！你已成功完成数独！');
        
        // 将游戏记录添加到历史记录表格
        addToHistory();
    }, 500);
}

/**
 * 将当前游戏添加到历史记录
 */
function addToHistory() {
    // 获取历史记录表格
    const historyTable = document.querySelector('.history-table tbody');
    if (!historyTable) return;
    
    // 获取当前日期时间
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 获取数独ID
    const puzzleId = document.querySelector('.puzzle-id').textContent.replace('ID: ', '');
    
    // 获取难度星级
    const difficultyStars = document.querySelector('.puzzle-difficulty .difficulty-stars').textContent;
    
    // 创建新的历史记录行
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${puzzleId}</td>
        <td><span class="difficulty-stars">${difficultyStars}</span></td>
        <td>${dateStr} ${timeStr}</td>
        <td>--:--</td>
        <td><a href="#" class="btn-secondary">重玩</a></td>
    `;
    
    // 在表格顶部添加新行
    historyTable.insertBefore(newRow, historyTable.firstChild);
}

/**
 * 设置题库相关功能
 */
function setupLibraryFunctions() {
    // 初始化题库显示
    populateLibraryItems();
    
    // 设置跳转按钮点击事件
    const jumpBtn = document.getElementById('jump-btn');
    if (jumpBtn) {
        jumpBtn.style.pointerEvents = 'auto';
        jumpBtn.style.opacity = '1';
        jumpBtn.addEventListener('click', jumpToPuzzle);
    }
    
    // 设置ID输入框回车事件
    const puzzleIdInput = document.getElementById('puzzle-id-input');
    if (puzzleIdInput) {
        // 确保输入框可点击并正常工作
        puzzleIdInput.style.pointerEvents = 'auto';
        puzzleIdInput.style.opacity = '1';
        
        puzzleIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                jumpToPuzzle();
            }
        });
        
        // 添加点击聚焦事件，确保可以正常点击
        puzzleIdInput.addEventListener('click', function(e) {
            this.focus();
        });
    }
    
    // 设置题库搜索功能
    const puzzleSearch = document.getElementById('puzzle-search');
    if (puzzleSearch) {
        puzzleSearch.addEventListener('input', function() {
            currentSearchTerm = this.value;
            currentLibraryPage = 1; // 重置为第一页
            populateLibraryItems(currentSearchTerm, currentLibraryCategory);
        });
    }
    
    // 设置难度筛选功能
    const difficultyFilters = document.querySelectorAll('.difficulty-filter input');
    difficultyFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            currentLibraryPage = 1; // 重置为第一页
            populateLibraryItems(currentSearchTerm, currentLibraryCategory);
        });
    });
    
    // 设置分类选择功能
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除其他分类的激活状态
            document.querySelectorAll('.category-item').forEach(el => {
                el.classList.remove('active');
            });
            
            // 添加当前分类的激活状态
            this.classList.add('active');
            
            // 根据分类进行筛选
            currentLibraryCategory = this.querySelector('span').textContent;
            currentLibraryPage = 1; // 重置为第一页
            populateLibraryItems(currentSearchTerm, currentLibraryCategory);
        });
    });
    
    // 设置分页按钮点击事件
    const prevPageBtn = document.querySelector('.pagination-btn:first-child');
    const nextPageBtn = document.querySelector('.pagination-btn:last-child');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentLibraryPage > 1) {
                currentLibraryPage--;
                populateLibraryItems(currentSearchTerm, currentLibraryCategory);
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            currentLibraryPage++;
            populateLibraryItems(currentSearchTerm, currentLibraryCategory);
        });
    }
}

/**
 * 填充题库列表
 * @param {string} searchTerm - 搜索词
 * @param {string} category - 选中的分类
 */
function populateLibraryItems(searchTerm = '', category = '精选题库') {
    // 更新全局状态
    currentSearchTerm = searchTerm;
    currentLibraryCategory = category;
    
    // 根据难度筛选
    const selectedDifficulties = [];
    document.querySelectorAll('.difficulty-filter input:checked').forEach(input => {
        const difficultyText = input.nextElementSibling.textContent.trim();
        let diffLevel = 1;
        
        switch(difficultyText) {
            case '简单': diffLevel = 1; break;
            case '中等': diffLevel = 2; break;
            case '困难': diffLevel = 3; break;
            case '专家': diffLevel = 4; break;
        }
        
        selectedDifficulties.push(diffLevel);
    });
    
    // 筛选题目
    const filteredPuzzles = puzzleLibrary.filter(puzzle => {
        // 难度筛选
        if (!selectedDifficulties.includes(puzzle.difficulty)) {
            return false;
        }
        
        // 搜索筛选
        if (searchTerm && !puzzle.id.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        
        // 分类筛选（简化处理）
        if (category === '精选题库') {
            return true; // 所有题目都在精选题库中
        } else if (category === '教学题集' && puzzle.id.startsWith('CLS')) {
            return true;
        } else if (category === '锦标赛题目' && puzzle.id.startsWith('GSM')) {
            return true;
        } else if (category === '热门挑战' && puzzle.difficulty > 3) {
            return true;
        } else if (category === '用户生成' && puzzle.userGenerated) {
            return true;
        }
        
        return false;
    });
    
    // 更新题目数量显示
    updateCategoryCounters(filteredPuzzles);
    
    // 获取题库列表容器
    const puzzleListContainer = document.getElementById('puzzle-list');
    if (!puzzleListContainer) return;
    
    // 清空当前列表
    puzzleListContainer.innerHTML = '';
    
    // 如果没有匹配的题目，显示提示
    if (filteredPuzzles.length === 0) {
        puzzleListContainer.innerHTML = `
            <div class="no-puzzles-message">
                <i class="fas fa-search"></i>
                <p>没有找到匹配的题目</p>
            </div>
        `;
        
        // 更新分页信息和按钮状态
        updatePagination(0, 1, 1);
        return;
    }
    
    // 每页显示的题目数量
    const perPage = 5;
    
    // 计算总页数
    const totalPages = Math.ceil(filteredPuzzles.length / perPage);
    
    // 确保当前页码有效
    if (currentLibraryPage < 1) currentLibraryPage = 1;
    if (currentLibraryPage > totalPages) currentLibraryPage = totalPages;
    
    // 计算当前页的起始和结束索引
    const startIndex = (currentLibraryPage - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, filteredPuzzles.length);
    
    // 获取当前页的题目
    const currentPagePuzzles = filteredPuzzles.slice(startIndex, endIndex);
    
    // 生成题目列表HTML
    currentPagePuzzles.forEach(puzzle => {
        const difficultyLevel = puzzle.difficulty;
        const stars = difficultyMapping[difficultyLevel - 1].stars;
        const difficultyName = difficultyMapping[difficultyLevel - 1].name;
        // 获取本地自定义名称
        const customName = getCustomPuzzleName(puzzle.id);
        // 生成题目名称
        const puzzleName = customName || puzzle.id || '未命名题目';
        // 生成题目描述
        let description = `${difficultyName}级数独`;
        if (puzzle.id.startsWith('CLS')) {
            description += '，教学题集';
        } else if (puzzle.id.startsWith('GSM')) {
            description += '，锦标赛题目';
        } else if (puzzle.userGenerated) {
            description += '，用户生成';
        }
        // 创建列表项
        const puzzleItem = document.createElement('div');
        puzzleItem.className = 'puzzle-list-item';
        puzzleItem.innerHTML = `
            <div class="puzzle-item-header">
                <span class="puzzle-item-id">${puzzle.id}</span>
                <span class="puzzle-item-difficulty">${stars}</span>
            </div>
            <div class="puzzle-item-title">
                <span class="title-text">${puzzleName}</span>
                <button class="btn-small btn-edit-name" data-id="${puzzle.id}" title="编辑题目名称">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="puzzle-item-description">
                ${description}
            </div>
            <div class="puzzle-item-actions">
                <button class="btn-small btn-play" data-id="${puzzle.id}">开始</button>
                ${puzzle.userGenerated ? `<button class="btn-small btn-delete" data-id="${puzzle.id}"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        `;
        // 编辑名称按钮事件
        const editBtn = puzzleItem.querySelector('.btn-edit-name');
        const titleText = puzzleItem.querySelector('.title-text');
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const currentName = titleText.textContent;
            // 创建输入框
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'title-edit-input';
            input.maxLength = 50;
            titleText.style.display = 'none';
            editBtn.style.display = 'none';
            titleText.parentNode.insertBefore(input, titleText);
            input.focus();
            // 保存编辑
            function saveEdit() {
                const newName = input.value.trim();
                if (newName) {
                    setCustomPuzzleName(id, newName);
                    titleText.textContent = newName;
                }
                input.remove();
                titleText.style.display = 'inline';
                editBtn.style.display = 'inline-block';
            }
            input.addEventListener('keypress', e => {
                if (e.key === 'Enter') saveEdit();
            });
            input.addEventListener('blur', saveEdit);
        });
        // 修正开始按钮事件
        const playButton = puzzleItem.querySelector('.btn-play');
        playButton.addEventListener('click', function() {
            const puzzleId = this.getAttribute('data-id');
            // 先查找官方和用户题库
            let selectedPuzzle = puzzleLibrary.find(p => p.id === puzzleId);
            if (!selectedPuzzle) {
                // 兼容本地自定义题目
                const customPuzzles = JSON.parse(localStorage.getItem('custom_puzzles') || '{}');
                selectedPuzzle = customPuzzles[puzzleId];
                // 兼容自定义题目结构
                if (selectedPuzzle && selectedPuzzle.grid) {
                    selectedPuzzle = {
                        id: puzzleId,
                        grid: selectedPuzzle.grid,
                        solution: selectedPuzzle.solution || [],
                        difficulty: selectedPuzzle.difficulty || 1
                    };
                }
            }
            if (selectedPuzzle) {
                loadPuzzle(selectedPuzzle);
                document.querySelector('.sudoku-grid').scrollIntoView({ behavior: 'smooth' });
            }
        });
        // 删除按钮事件绑定
        const deleteBtn = puzzleItem.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // 防止冒泡
                const puzzleId = this.getAttribute('data-id');
                deletePuzzleFromLibrary(puzzleId);
            });
        }
        puzzleListContainer.appendChild(puzzleItem);
    });
    
    // 更新分页信息和按钮状态
    updatePagination(filteredPuzzles.length, currentLibraryPage, totalPages);
}

/**
 * 更新分类数量显示
 * @param {Array} filteredPuzzles - 筛选后的题目
 */
function updateCategoryCounters(filteredPuzzles) {
    // 统计各分类下的题目数量
    const counts = {
        '精选题库': filteredPuzzles.length,
        '教学题集': filteredPuzzles.filter(p => p.id.startsWith('CLS')).length,
        '锦标赛题目': filteredPuzzles.filter(p => p.id.startsWith('GSM')).length,
        '热门挑战': filteredPuzzles.filter(p => p.difficulty > 3).length,
        '用户生成': filteredPuzzles.filter(p => p.userGenerated).length
    };
    
    // 更新各分类的计数器
    document.querySelectorAll('.category-item').forEach(item => {
        const category = item.querySelector('span').textContent;
        const counter = item.querySelector('.category-counter');
        if (counter && counts[category] !== undefined) {
            counter.textContent = counts[category];
        }
    });
}

/**
 * 根据ID跳转到指定题目
 */
function jumpToPuzzle() {
    const puzzleIdInput = document.getElementById('puzzle-id-input');
    if (!puzzleIdInput) return;
    
    const puzzleId = puzzleIdInput.value.trim();
    if (!puzzleId) {
        alert('请输入有效的题目编号');
        return;
    }
    
    // 在题库中查找对应ID的题目
    const puzzle = puzzleLibrary.find(p => p.id === puzzleId);
    if (puzzle) {
        loadPuzzle(puzzle);
        
        // 滚动到数独盘
        document.querySelector('.sudoku-grid').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert(`找不到编号为 ${puzzleId} 的题目`);
    }
}

/**
 * 加载指定的数独题目
 * @param {Object} puzzle - 题目对象
 */
function loadPuzzle(puzzle) {
    // 设置当前题目ID
    currentPuzzleId = puzzle.id;
    
    // 设置难度
    difficultyLevel = puzzle.difficulty;
    
    // 复制网格数据
    currentGrid = [...puzzle.grid];
    solutionGrid = [...puzzle.solution];
    
    // 重置游戏状态
    isGameComplete = false;
    selectedCell = null;
    selectedNumber = null;
    
    // 初始化数独网格
    initSudokuGrid();
    
    // 更新难度显示
    updateDifficultyDisplay(difficultyLevel);
    
    // 更新ID显示
    const puzzleIdElement = document.querySelector('.puzzle-id');
    if (puzzleIdElement) {
        puzzleIdElement.textContent = `ID: ${currentPuzzleId}`;
    }
    // 题目加载后同步AI助手
    if (window.syncSudokuToAI) window.syncSudokuToAI();
}

/**
 * 更新分页信息和按钮状态
 * @param {number} totalItems - 总题目数量
 * @param {number} currentPage - 当前页码
 * @param {number} totalPages - 总页数
 */
function updatePagination(totalItems, currentPage, totalPages) {
    // 更新分页信息
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    }
    
    // 更新分页按钮状态
    const prevButton = document.querySelector('.pagination-btn:first-child');
    const nextButton = document.querySelector('.pagination-btn:last-child');
    
    if (prevButton) {
        prevButton.disabled = currentPage <= 1;
    }
    
    if (nextButton) {
        nextButton.disabled = currentPage >= totalPages;
    }
}

/**
 * 加载用户生成的题目
 */
function loadUserGeneratedPuzzles() {
    const savedPuzzles = localStorage.getItem('userGeneratedPuzzles');
    if (savedPuzzles) {
        userGeneratedPuzzles = JSON.parse(savedPuzzles);
    }
}

/**
 * 合并预定义题库和用户生成题库
 */
function mergePuzzleLibraries() {
    // 将用户生成的题目添加到题库中
    userGeneratedPuzzles.forEach(puzzle => {
        // 检查题目是否已经存在
        const existingIndex = puzzleLibrary.findIndex(p => p.id === puzzle.id);
        if (existingIndex === -1) {
            puzzleLibrary.push(puzzle);
        }
    });
}

/**
 * 将当前数独保存到题库
 */
function savePuzzleToLibrary() {
    // 检查是否有正在进行的数独
    if (!currentGrid.length || !solutionGrid.length) {
        alert('没有可保存的数独题目');
        return;
    }
    
    // 弹出对话框让用户输入自定义名称
    const customName = prompt('请输入题目的自定义名称（可选）：');
    
    // 生成唯一ID（用户生成的题目使用USER前缀）
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const timestamp = now.getTime();
    
    const newId = `USER-${year}${month}${day}-${random}-${timestamp.toString().slice(-4)}`;
    
    // 创建新题目对象
    const newPuzzle = {
        id: newId,
        difficulty: difficultyLevel,
        grid: [...currentGrid], // 当前状态（包含空格）
        solution: [...solutionGrid], // 解决方案
        userGenerated: true,
        dateCreated: now.toISOString(),
        customName: customName || null // 添加自定义名称字段
    };
    
    // 添加到用户生成的题目数组
    userGeneratedPuzzles.push(newPuzzle);
    
    // 保存到本地存储
    localStorage.setItem('userGeneratedPuzzles', JSON.stringify(userGeneratedPuzzles));
    
    // 添加到题库
    puzzleLibrary.push(newPuzzle);
    
    // 更新当前题目ID
    currentPuzzleId = newId;
    const puzzleIdElement = document.querySelector('.puzzle-id');
    if (puzzleIdElement) {
        puzzleIdElement.textContent = `ID: ${currentPuzzleId}`;
    }
    
    // 提示用户
    alert(`数独题目已成功保存到题库！\nID: ${newId}${customName ? '\n自定义名称: ' + customName : ''}`);
    
    // 重新填充题库列表（如果当前在题库选项卡）
    const libraryTab = document.getElementById('library-tab');
    if (libraryTab && window.getComputedStyle(libraryTab).display !== 'none') {
        populateLibraryItems(currentSearchTerm, currentLibraryCategory);
    }
}

/**
 * 从题库中删除题目
 * @param {string} puzzleId - 题目ID
 */
function deletePuzzleFromLibrary(puzzleId) {
    // 确认删除
    if (!confirm(`确定要删除题目 ${puzzleId} 吗？`)) {
        return;
    }
    
    // 从用户生成的题目数组中删除
    const puzzleIndex = userGeneratedPuzzles.findIndex(p => p.id === puzzleId);
    if (puzzleIndex !== -1) {
        userGeneratedPuzzles.splice(puzzleIndex, 1);
        
        // 更新本地存储
        localStorage.setItem('userGeneratedPuzzles', JSON.stringify(userGeneratedPuzzles));
        
        // 从题库中删除
        const libraryIndex = puzzleLibrary.findIndex(p => p.id === puzzleId);
        if (libraryIndex !== -1) {
            puzzleLibrary.splice(libraryIndex, 1);
        }
        
        // 重新填充题库列表
        populateLibraryItems(currentSearchTerm, currentLibraryCategory);
        
        // 提示用户
        alert('题目已成功删除！');
    }
}

/**
 * 获取本地自定义题目名称
 * @param {string} id - 题目ID
 * @returns {string} 自定义名称
 */
function getCustomPuzzleName(id) {
    const names = JSON.parse(localStorage.getItem('custom_puzzle_names') || '{}');
    return names[id] || '';
}

/**
 * 设置本地自定义题目名称
 * @param {string} id - 题目ID
 * @param {string} name - 自定义名称
 */
function setCustomPuzzleName(id, name) {
    const names = JSON.parse(localStorage.getItem('custom_puzzle_names') || '{}');
    names[id] = name;
    localStorage.setItem('custom_puzzle_names', JSON.stringify(names));
}

/**
 * 检查所有已填数字
 */
function checkAllNumbers() {
    document.querySelectorAll('.sudoku-cell').forEach(cell => {
        const index = parseInt(cell.dataset.index);
        const number = currentGrid[index];
        
        if (number !== 0) {
            if (number !== solutionGrid[index]) {
                cell.classList.add('error');
            } else {
                cell.classList.remove('error');
            }
        }
    });
}

/**
 * 移除所有错误标记
 */
function removeAllErrorMarks() {
    document.querySelectorAll('.sudoku-cell.error').forEach(cell => {
        cell.classList.remove('error');
    });
}

// 监听页面点击，点击空白处时取消所有选中和高亮
// 只在点击非数独格子时触发

document.addEventListener('click', function (e) {
    const grid = document.getElementById('classic-grid');
    if (grid && !grid.contains(e.target)) {
        document.querySelectorAll('.sudoku-cell.selected, .sudoku-cell.highlight').forEach(cell => {
            cell.classList.remove('selected', 'highlight');
        });
        selectedCell = null;
    }
}); 