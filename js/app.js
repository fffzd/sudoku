/**
 * 数独游戏前端交互逻辑
 * 处理用户界面交互和游戏状态管理
 */

// 全局游戏实例
let game = null;
let timer = null;
let timerInterval = null;

// DOM 元素引用
const boardElement = document.getElementById('sudoku-board');
const numberPad = document.getElementById('number-pad');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const gameInfo = {
    difficulty: document.getElementById('game-difficulty'),
    timer: document.getElementById('game-timer'),
    errors: document.getElementById('error-count')
};
const controls = {
    newGame: document.getElementById('new-game'),
    check: document.getElementById('check-game'),
    hint: document.getElementById('hint'),
    notes: document.getElementById('toggle-notes'),
    undo: document.getElementById('undo'),
    erase: document.getElementById('erase')
};
const winModal = document.getElementById('win-modal');
const closeModal = document.getElementById('close-modal');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const closeModalBtns = document.querySelectorAll('.modal-close');
const body = document.body;
const modals = document.querySelectorAll('.modal');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const navLinks = document.querySelectorAll('.nav-links a');
const currentPage = window.location.pathname.split('/').pop();

// 检查必要的DOM元素是否存在
if (!boardElement) {
    console.warn('警告: 未找到sudoku-board元素，数独游戏功能可能无法正常工作');
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    // 检查当前页面是否包含数独游戏板
    const sudokuBoard = document.getElementById('sudoku-board');
    if (!sudokuBoard) {
        console.log('当前页面不包含数独游戏板，跳过数独游戏初始化');
        return; // 如果当前页面没有数独游戏板，则跳过初始化
    }
    
    // 初始化游戏对象
    game = new Sudoku();
    
    // DOM元素引用 - 使用已有的全局变量引用，不再重新声明
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const newGameBtn = document.getElementById('new-game');
    const checkBtn = document.getElementById('check-game');
    const hintBtn = document.getElementById('hint');
    const notesBtn = document.getElementById('notes-toggle');
    const undoBtn = document.getElementById('undo');
    const eraseBtn = document.getElementById('erase');
    const numberBtns = document.querySelectorAll('.number-btn');
    const timeElement = document.getElementById('time-value');
    const errorElement = document.getElementById('errors-value');
    const difficultyElement = document.getElementById('difficulty-value');
    const winTime = document.getElementById('win-time');
    const winErrors = document.getElementById('win-errors');
    const winDifficulty = document.getElementById('win-difficulty');
    const closeModalBtn = document.querySelector('.close-btn');
    
    // 游戏状态变量
    let selectedCell = null;
    let noteMode = false;
    
    // 游戏初始化 - 默认简单难度
    initializeGame('easy');
    
    // 生成数独板
    function createBoard() {
        // 先检查boardElement是否存在
        if (!boardElement) {
            console.error('找不到sudoku-board元素');
            return; // 如果boardElement不存在，直接返回
        }
        
        // 清空现有数独板
        boardElement.innerHTML = '';
        
        // 创建9x9的数独板
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 添加备注容器
                const notesContainer = document.createElement('div');
                notesContainer.className = 'notes-container';
                for (let i = 1; i <= 9; i++) {
                    const noteCell = document.createElement('span');
                    noteCell.className = 'note';
                    noteCell.dataset.note = i;
                    notesContainer.appendChild(noteCell);
                }
                
                cell.appendChild(notesContainer);
                
                // 添加单元格点击事件
                cell.addEventListener('click', () => selectCell(cell));
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    // 更新数独板显示
    function updateBoard() {
        const cells = document.querySelectorAll('.sudoku-cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = game.board[row][col];
            
            // 清除数字和备注
            cell.innerHTML = '';
            const notesContainer = document.createElement('div');
            notesContainer.className = 'notes-container';
            
            // 如果有数字，显示数字
            if (value !== 0) {
                cell.textContent = value;
                
                // 为初始数字添加固定样式
                if (game.initialBoard[row][col] !== 0) {
                    cell.classList.add('fixed');
                } else {
                    cell.classList.remove('fixed');
                }
            } else {
                // 否则显示备注
                for (let i = 1; i <= 9; i++) {
                    const noteCell = document.createElement('span');
                    noteCell.className = 'note';
                    noteCell.dataset.note = i;
                    
                    // 如果备注已存在则显示
                    if (game.notes[row][col].includes(i)) {
                        noteCell.textContent = i;
                    }
                    
                    notesContainer.appendChild(noteCell);
                }
                cell.appendChild(notesContainer);
            }
        });
    }
    
    // 选择单元格
    function selectCell(cell) {
        // 已完成游戏或者是固定单元格则不能选择
        if (game.gameFinished || cell.classList.contains('fixed')) {
            return;
        }
        
        // 移除之前选中的单元格样式
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            
            // 移除相同数字高亮
            const prevNumber = game.board[parseInt(selectedCell.dataset.row)][parseInt(selectedCell.dataset.col)];
            if (prevNumber !== 0) {
                document.querySelectorAll('.same-number').forEach(cell => {
                    cell.classList.remove('same-number');
                });
            }
        }
        
        // 设置新选中的单元格
        selectedCell = cell;
        selectedCell.classList.add('selected');
        
        // 高亮相同数字
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const currentNumber = game.board[row][col];
        
        if (currentNumber !== 0) {
            document.querySelectorAll('.sudoku-cell').forEach(otherCell => {
                const otherRow = parseInt(otherCell.dataset.row);
                const otherCol = parseInt(otherCell.dataset.col);
                
                if (game.board[otherRow][otherCol] === currentNumber && otherCell !== cell) {
                    otherCell.classList.add('same-number');
                }
            });
        }
    }
    
    // 填入数字
    function fillNumber(number) {
        if (!selectedCell || game.gameFinished) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        // 如果是固定单元格则不能修改
        if (game.initialBoard[row][col] !== 0) return;
        
        // 检查是否已开始游戏
        if (!game.gameStarted && number > 0) {
            startGame();
        }
        
        // 填入数字或备注
        game.fillNumber(row, col, number, noteMode);
        
        // 更新界面
        updateBoard();
        updateGameInfo();
        
        // 检查游戏是否完成
        if (game.checkCompletion()) {
            endGame();
        }
    }
    
    // 数字键处理
    numberBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const number = parseInt(btn.textContent);
            fillNumber(number);
        });
    });
    
    // 键盘输入处理
    document.addEventListener('keydown', (e) => {
        if (!selectedCell) return;
        
        // 数字键1-9
        if (e.key >= '1' && e.key <= '9') {
            fillNumber(parseInt(e.key));
        } 
        // 删除键 (Backspace或Delete)
        else if (e.key === 'Backspace' || e.key === 'Delete') {
            eraseNumber();
        }
        // 方向键
        else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            navigateWithKeys(e.key);
        }
    });
    
    // 方向键导航
    function navigateWithKeys(key) {
        if (!selectedCell) return;
        
        let row = parseInt(selectedCell.dataset.row);
        let col = parseInt(selectedCell.dataset.col);
        
        switch (key) {
            case 'ArrowUp':
                row = (row - 1 + 9) % 9;
                break;
            case 'ArrowDown':
                row = (row + 1) % 9;
                break;
            case 'ArrowLeft':
                col = (col - 1 + 9) % 9;
                break;
            case 'ArrowRight':
                col = (col + 1) % 9;
                break;
        }
        
        // 选择新单元格
        const newCell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
        if (newCell) {
            selectCell(newCell);
        }
    }
    
    // 擦除当前选中单元格的数字
    function eraseNumber() {
        if (!selectedCell || game.gameFinished) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        // 如果是固定单元格则不能擦除
        if (game.initialBoard[row][col] !== 0) return;
        
        // 确保游戏已开始
        if (!game.gameStarted) return;
        
        // 擦除数字
        game.eraseCell(row, col);
        
        // 更新界面
        updateBoard();
    }
    
    // 切换备注模式
    notesBtn.addEventListener('click', () => {
        noteMode = !noteMode;
        notesBtn.classList.toggle('active', noteMode);
    });
    
    // 撤销上一步操作
    undoBtn.addEventListener('click', () => {
        if (game.gameFinished) return;
        
        game.undo();
        updateBoard();
        updateGameInfo();
    });
    
    // 擦除按钮
    eraseBtn.addEventListener('click', eraseNumber);
    
    // 提示按钮 - 获取一个提示
    hintBtn.addEventListener('click', () => {
        if (game.gameFinished) return;
        
        // 如果游戏未开始，提示将自动开始游戏
        if (!game.gameStarted) {
            startGame();
        }
        
        // 获取提示
        const hint = game.getHint();
        if (hint) {
            const { row, col, value } = hint;
            
            // 高亮提示单元格
            const hintCell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
            if (hintCell) {
                // 先选中单元格
                if (selectedCell) {
                    selectedCell.classList.remove('selected');
                }
                selectedCell = hintCell;
                selectedCell.classList.add('selected');
                selectedCell.classList.add('hint');
                
                // 2秒后移除提示高亮
                setTimeout(() => {
                    selectedCell.classList.remove('hint');
                }, 2000);
            }
            
            // 更新界面
            updateBoard();
            updateGameInfo();
        }
    });
    
    // 检查按钮 - 检查当前的答案
    checkBtn.addEventListener('click', () => {
        if (!game.gameStarted || game.gameFinished) return;
        
        // 检查答案并标记错误
        const errors = game.checkAnswers();
        
        // 显示错误单元格
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('error');
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            // 如果单元格有值且答案错误，标记为错误
            if (game.board[row][col] !== 0 && !game.isValidPlacement(row, col, game.board[row][col])) {
                cell.classList.add('error');
            }
        });
        
        // 更新错误计数
        updateGameInfo();
        
        // 2秒后移除错误标记
        setTimeout(() => {
            document.querySelectorAll('.error').forEach(cell => {
                cell.classList.remove('error');
            });
        }, 2000);
    });
    
    // 难度选择
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = btn.dataset.difficulty;
            initializeGame(difficulty);
            
            // 更新激活按钮样式
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // 新游戏按钮
    newGameBtn.addEventListener('click', () => {
        const currentDifficulty = difficultyElement.textContent.toLowerCase();
        initializeGame(currentDifficulty);
    });
    
    // 初始化游戏
    function initializeGame(difficulty) {
        // 检查boardElement是否存在
        if (!boardElement) {
            console.error('找不到sudoku-board元素，请确保页面包含id为sudoku-board的元素');
            return; // 如果不存在，则直接返回
        }

        // 停止计时器
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        
        // 重置游戏状态
        game.newGame(difficulty);
        selectedCell = null;
        noteMode = false;
        if (notesBtn) {
        notesBtn.classList.remove('active');
        }
        
        // 创建并更新棋盘
        createBoard();
        updateBoard();
        
        // 更新游戏信息
        if (difficultyElement) {
        difficultyElement.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        }
        if (timeElement) {
        timeElement.textContent = '00:00';
        }
        if (errorElement) {
        errorElement.textContent = '0';
        }
        
        // 隐藏胜利模态框
        if (winModal) {
        winModal.style.display = 'none';
        }
    }
    
    // 开始游戏 - 启动计时器
    function startGame() {
        if (game.gameStarted) return;
        
        game.gameStarted = true;
        game.startTime = Date.now();
        
        // 启动计时器
        timer = setInterval(updateTimer, 1000);
    }
    
    // 更新计时器显示
    function updateTimer() {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - game.startTime) / 1000);
        game.elapsedTime = elapsedSeconds;
        
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        
        timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 更新游戏信息
    function updateGameInfo() {
        errorElement.textContent = game.errorCount;
    }
    
    // 游戏结束 - 显示胜利模态框
    function endGame() {
        game.gameFinished = true;
        
        // 停止计时器
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        
        // 更新胜利模态框内容
        const minutes = Math.floor(game.elapsedTime / 60);
        const seconds = game.elapsedTime % 60;
        winTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        winErrors.textContent = game.errorCount;
        winDifficulty.textContent = difficultyElement.textContent;
        
        // 显示胜利模态框
        winModal.style.display = 'block';
    }
    
    // 关闭胜利模态框
    closeModalBtn.addEventListener('click', () => {
        winModal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === winModal) {
            winModal.style.display = 'none';
        }
    });
    
    // 初始设置主题为现代主题
    function setInitialTheme() {
        document.body.classList.add('modern-theme');
    }
    
    // 初始化主题
    setInitialTheme();

    // 初始化函数
    function initApp() {
        updateNavHighlight();
        setupEventListeners();
        setInitialTheme();
    }

    // 设置所有事件监听器
    function setupEventListeners() {
        // 如果按钮存在，则添加事件监听器
        if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
        if (registerBtn) registerBtn.addEventListener('click', () => openModal(registerModal));
        
        // 关闭模态框按钮
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        
        // 点击模态框背景关闭
        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) closeModal();
            });
        });
        
        // 表单提交
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        if (registerForm) registerForm.addEventListener('submit', handleRegister);
    }
});

/**
 * 数独学堂 - 应用主JavaScript文件
 * 负责初始化和管理页面交互
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化网站共通功能
    initializeCommonFeatures();
    
    // 注册服务工作线程（用于PWA支持）
    registerServiceWorker();
    
    // 检测页面类型并初始化对应的模块
    initializePageModules();
});

/**
 * 初始化网站共通功能
 */
function initializeCommonFeatures() {
    // 设置引用轮播
    setupQuoteCarousel();
    
    // 绑定导航栏事件
    setupNavigation();
    
    // 绑定深色模式切换
    setupDarkModeToggle();
    
    // 绑定返回顶部按钮
    setupScrollToTop();
    
    // 设置"查看更多"按钮
    setupShowMoreButton();
}

/**
 * 检测页面类型并初始化对应的模块
 */
function initializePageModules() {
    // 首页特有初始化
    if (document.body.classList.contains('home-page') || document.querySelector('.showcase')) {
        initializeHomePage();
    }
    
    // 经典模式初始化 
    if (document.body.classList.contains('classic-mode') || document.querySelector('.classic-mode-container')) {
        // 经典模式特定逻辑在classic-mode.js中实现
    }
    
    // 每日挑战初始化
    if (document.body.classList.contains('daily-challenge') || document.querySelector('.daily-challenge-container')) {
        // 每日挑战特定逻辑在daily-challenge.js中实现
    }
}

/**
 * 初始化首页特有功能
 */
function initializeHomePage() {
    // 绑定模式卡片悬停效果
    setupModeCards();
    
    // 初始化首页演示数独
    initializeDemoSudoku();
}

/**
 * 设置引用轮播
 */
function setupQuoteCarousel() {
    const quotes = [
        "数独是大脑的瑜伽。 —— 韦恩·古尔德",
        "解决数独不仅是娱乐，也是锻炼逻辑思维的方式。",
        "数独：如同数字们的舞蹈，遵循着严格而美丽的规则。",
        "数独之美在于简单的规则与复杂的变化之间的平衡。",
        "生活就像数独，有时候需要退一步，才能看清全局。"
    ];
    
    const quoteCarousel = document.getElementById('quote-carousel');
    if (!quoteCarousel) return;
    
    let currentQuote = 0;
    
    // 设置定时器，每8秒切换一次引用
    setInterval(() => {
        currentQuote = (currentQuote + 1) % quotes.length;
        // 添加淡出效果
        quoteCarousel.style.opacity = 0;
        
        setTimeout(() => {
            quoteCarousel.innerHTML = `<p>${quotes[currentQuote]}</p>`;
            // 添加淡入效果
            quoteCarousel.style.opacity = 1;
        }, 500);
    }, 8000);
}

/**
 * 绑定导航栏事件
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname;
    
    // 设置当前页面对应的导航项为活动状态
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.endsWith(linkPath)) {
            link.classList.add('active');
        }
    });
}

/**
 * 绑定深色模式切换
 */
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;
    
    // 检查本地存储中的深色模式设置
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // 应用保存的设置
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
        darkModeToggle.checked = true;
    }
    
    // 监听切换事件
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('darkMode', 'false');
        }
    });
}

/**
 * 绑定返回顶部按钮
 */
function setupScrollToTop() {
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (!scrollTopBtn) return;
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });
    
    // 点击按钮返回顶部
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * 设置模式卡片悬停效果
 */
function setupModeCards() {
    const modeCards = document.querySelectorAll('.mode-card');
    
    modeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('card-hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('card-hover');
        });
    });
}

/**
 * 设置"查看更多"按钮
 */
function setupShowMoreButton() {
    const showMoreBtn = document.getElementById('show-more');
    const moreInfo = document.getElementById('more-info');
    
    if (!showMoreBtn || !moreInfo) return;
    
    showMoreBtn.addEventListener('click', function() {
        if (moreInfo.style.display === 'block') {
            moreInfo.style.display = 'none';
            showMoreBtn.textContent = '查看更多';
        } else {
            moreInfo.style.display = 'block';
            showMoreBtn.textContent = '收起';
        }
    });
}

/**
 * 初始化首页演示数独
 */
function initializeDemoSudoku() {
    const sudokuBoard = document.getElementById('sudoku-board');
    if (!sudokuBoard) return;
    
    // 生成9x9网格
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // 为每个3x3宫格添加边框样式
            if (i % 3 === 0) cell.classList.add('border-top');
            if (i === 8) cell.classList.add('border-bottom');
            if (j % 3 === 0) cell.classList.add('border-left');
            if (j === 8) cell.classList.add('border-right');
            
            sudokuBoard.appendChild(cell);
        }
    }
    
    // 填充演示数据
    const demoData = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];
    
    // 填充数据
    const cells = sudokuBoard.querySelectorAll('.cell');
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const index = i * 9 + j;
            const value = demoData[i][j];
            
            if (value !== 0) {
                cells[index].textContent = value;
                cells[index].classList.add('fixed');
            }
        }
    }
    
    // 添加一些交互效果
    cells.forEach(cell => {
        cell.addEventListener('click', function() {
            // 移除所有选中状态
            cells.forEach(c => c.classList.remove('selected', 'highlighted'));
            
            // 如果是固定单元格，不能选择
            if (this.classList.contains('fixed')) return;
            
            // 选中当前单元格
            this.classList.add('selected');
            
            // 高亮同行同列
            const row = parseInt(this.dataset.row);
            const col = parseInt(this.dataset.col);
            
            cells.forEach(c => {
                const cRow = parseInt(c.dataset.row);
                const cCol = parseInt(c.dataset.col);
                
                // 同行、同列或同宫格的单元格高亮
                if (cRow === row || cCol === col || 
                    (Math.floor(cRow / 3) === Math.floor(row / 3) && 
                     Math.floor(cCol / 3) === Math.floor(col / 3))) {
                    c.classList.add('highlighted');
                }
            });
        });
    });
}

/**
 * 注册服务工作线程（用于PWA支持）
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful');
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
} 