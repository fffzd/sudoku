/**
 * 数独题目打印和下载功能
 * 允许用户将当前的数独题目保存为PDF或图片
 */

// 初始化打印功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取打印按钮
    const printBtn = document.getElementById('print-btn');
    
    // 如果按钮存在，添加点击事件
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            // 打开打印选项对话框
            openPrintOptions();
        });
    }
});

/**
 * 打开打印选项对话框
 * 提供PDF和图片格式的选项
 */
function openPrintOptions() {
    // 创建模态对话框
    const modal = document.createElement('div');
    modal.className = 'print-modal';
    modal.innerHTML = `
        <div class="print-modal-content">
            <span class="print-modal-close">&times;</span>
            <h2>下载数独题目</h2>
            <div class="print-options">
                <button id="download-pdf" class="btn">
                    <i class="fas fa-file-pdf"></i> 下载PDF
                </button>
                <button id="download-image" class="btn">
                    <i class="fas fa-image"></i> 下载图片
                </button>
            </div>
        </div>
    `;
    
    // 添加到文档
    document.body.appendChild(modal);
    
    // 显示模态框
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 50);
    
    // 关闭按钮事件
    const closeBtn = modal.querySelector('.print-modal-close');
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // 下载PDF按钮事件
    const pdfBtn = document.getElementById('download-pdf');
    pdfBtn.addEventListener('click', function() {
        downloadAsPDF();
        modal.style.display = 'none';
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // 下载图片按钮事件
    const imgBtn = document.getElementById('download-image');
    imgBtn.addEventListener('click', function() {
        downloadAsImage();
        modal.style.display = 'none';
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
}

/**
 * 将当前数独题目下载为PDF
 */
function downloadAsPDF() {
    // 获取当前游戏数据
    const gameData = getCurrentGameData();
    if (!gameData) {
        alert('无法获取当前游戏数据');
        return;
    }
    
    // 创建用于打印的临时元素
    const printElement = document.createElement('div');
    printElement.className = 'sudoku-print-container';
    
    // 添加游戏信息
    const difficultyText = getDifficultyText(gameData.difficulty);
    const currentDate = new Date().toLocaleDateString('zh-CN');
    const pageTitle = getGameModeName();
    
    // 设置打印内容
    printElement.innerHTML = `
        <div class="sudoku-print-header">
            <h1>数独学堂 - ${pageTitle}</h1>
            <div class="sudoku-print-info">
                <p>难度：${difficultyText}</p>
                <p>日期：${currentDate}</p>
                ${gameData.id ? `<p>题目ID：${gameData.id}</p>` : ''}
            </div>
        </div>
        <div class="sudoku-print-board">
            ${generatePrintableSudokuHTML(gameData)}
        </div>
        <div class="sudoku-print-footer">
            <p>数独学堂 | www.sudokucool.com</p>
        </div>
    `;
    
    // 添加打印样式
    const style = document.createElement('style');
    style.textContent = `
        .sudoku-print-container {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .sudoku-print-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .sudoku-print-info {
            display: flex;
            justify-content: space-around;
            margin: 10px 0;
            flex-wrap: wrap;
        }
        .sudoku-print-info p {
            margin: 5px 10px;
        }
        .sudoku-print-board {
            margin: 20px auto;
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            grid-gap: 1px;
            width: 400px;
            height: 400px;
            border: 2px solid #000;
        }
        .sudoku-print-cell {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            border: 1px solid #ccc;
            background: white;
        }
        .sudoku-print-cell.fixed {
            font-weight: bold;
        }
        .sudoku-print-board .sudoku-print-cell:nth-child(3n) {
            border-right: 2px solid #000;
        }
        .sudoku-print-board .sudoku-print-cell:nth-child(9n) {
            border-right: none;
        }
        .sudoku-print-board .sudoku-print-cell:nth-child(n+19):nth-child(-n+27),
        .sudoku-print-board .sudoku-print-cell:nth-child(n+46):nth-child(-n+54) {
            border-bottom: 2px solid #000;
        }
        .sudoku-print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    `;
    
    // 添加到文档并准备打印
    document.body.appendChild(style);
    document.body.appendChild(printElement);
    
    // 使用html2pdf库将内容转换为PDF
    if (typeof html2pdf !== 'undefined') {
        const element = document.querySelector('.sudoku-print-container');
        const opt = {
            margin: 10,
            filename: `数独学堂_${pageTitle}_${difficultyText}_${currentDate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
            // 清理临时元素
            document.body.removeChild(printElement);
            document.body.removeChild(style);
        });
    } else {
        // 如果没有html2pdf库，尝试使用浏览器打印功能
        window.print();
        
        // 打印后删除临时元素
        setTimeout(() => {
            document.body.removeChild(printElement);
            document.body.removeChild(style);
        }, 1000);
    }
}

/**
 * 将当前数独题目下载为图片
 */
function downloadAsImage() {
    // 获取当前游戏数据
    const gameData = getCurrentGameData();
    if (!gameData) {
        alert('无法获取当前游戏数据');
        return;
    }
    
    // 创建用于生成图片的临时元素
    const printElement = document.createElement('div');
    printElement.className = 'sudoku-print-container';
    
    // 添加游戏信息
    const difficultyText = getDifficultyText(gameData.difficulty);
    const currentDate = new Date().toLocaleDateString('zh-CN');
    const pageTitle = getGameModeName();
    
    // 设置打印内容
    printElement.innerHTML = `
        <div class="sudoku-print-header">
            <h1>数独学堂 - ${pageTitle}</h1>
            <div class="sudoku-print-info">
                <p>难度：${difficultyText}</p>
                <p>日期：${currentDate}</p>
                ${gameData.id ? `<p>题目ID：${gameData.id}</p>` : ''}
            </div>
        </div>
        <div class="sudoku-print-board">
            ${generatePrintableSudokuHTML(gameData)}
        </div>
        <div class="sudoku-print-footer">
            <p>数独学堂 | www.sudokucool.com</p>
        </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .sudoku-print-container {
            font-family: Arial, sans-serif;
            background: white;
            width: 600px;
            padding: 20px;
            box-sizing: border-box;
        }
        .sudoku-print-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .sudoku-print-info {
            display: flex;
            justify-content: space-around;
            margin: 10px 0;
            flex-wrap: wrap;
        }
        .sudoku-print-info p {
            margin: 5px 10px;
        }
        .sudoku-print-board {
            margin: 20px auto;
            display: grid;
            grid-template-columns: repeat(9, 1fr);
            grid-gap: 1px;
            width: 400px;
            height: 400px;
            border: 2px solid #000;
        }
        .sudoku-print-cell {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            border: 1px solid #ccc;
            background: white;
        }
        .sudoku-print-cell.fixed {
            font-weight: bold;
        }
        .sudoku-print-board .sudoku-print-cell:nth-child(3n) {
            border-right: 2px solid #000;
        }
        .sudoku-print-board .sudoku-print-cell:nth-child(9n) {
            border-right: none;
        }
        .sudoku-print-board .sudoku-print-cell:nth-child(n+19):nth-child(-n+27),
        .sudoku-print-board .sudoku-print-cell:nth-child(n+46):nth-child(-n+54) {
            border-bottom: 2px solid #000;
        }
        .sudoku-print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    `;
    
    // 隐藏元素，但添加到文档中以便生成图片
    printElement.style.position = 'absolute';
    printElement.style.left = '-9999px';
    document.body.appendChild(style);
    document.body.appendChild(printElement);
    
    // 使用html2canvas库将内容转换为图片
    if (typeof html2canvas !== 'undefined') {
        html2canvas(printElement, {
            backgroundColor: 'white',
            scale: 2
        }).then(canvas => {
            // 将画布转换为图片下载
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `数独学堂_${pageTitle}_${difficultyText}_${currentDate}.png`;
            a.click();
            
            // 清理临时元素
            document.body.removeChild(printElement);
            document.body.removeChild(style);
        });
    } else {
        alert('无法生成图片，请尝试下载PDF格式');
        document.body.removeChild(printElement);
        document.body.removeChild(style);
    }
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
        difficulty: difficulty,
        id: null
    };
}

/**
 * 生成可打印的数独HTML
 * @param {Object} gameData - 数独游戏数据
 * @returns {string} HTML字符串
 */
function generatePrintableSudokuHTML(gameData) {
    let html = '';
    
    // 无游戏数据时返回空白网格
    if (!gameData || !gameData.grid) {
        for (let i = 0; i < 81; i++) {
            html += '<div class="sudoku-print-cell"></div>';
        }
        return html;
    }
    
    // 遍历数独网格
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const value = gameData.grid[row][col];
            const isFixed = gameData.fixed ? gameData.fixed[row][col] : false;
            
            // 创建单元格
            if (value !== 0) {
                html += `<div class="sudoku-print-cell ${isFixed ? 'fixed' : ''}">${value}</div>`;
            } else {
                html += `<div class="sudoku-print-cell"></div>`;
            }
        }
    }
    
    return html;
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

/**
 * 获取当前游戏模式名称
 * @returns {string} 游戏模式名称
 */
function getGameModeName() {
    const page = getCurrentPage();
    
    switch (page) {
        case 'daily-challenge':
            return '每日挑战';
        case 'classic-mode':
            return '经典模式';
        default:
            return '数独题目';
    }
}

/**
 * 根据难度级别获取文字描述
 * @param {number} difficulty - 难度级别 (1-4)
 * @returns {string} 难度描述
 */
function getDifficultyText(difficulty) {
    switch (Number(difficulty)) {
        case 1: return '简单';
        case 2: return '中等';
        case 3: return '困难';
        case 4: return '专家';
        default: return '简单';
    }
} 