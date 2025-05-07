// 默认的AI助手回复内容
const defaultResponses = [
    "您好！我是数独学堂AI助手，有什么可以帮您的吗？",
    "数独游戏中遇到困难了吗？试试使用提示功能，或者选择更简单的难度。",
    "您可以通过题目ID直接跳转到特定的数独题目，只需在\"题目编号跳转\"输入框中输入ID即可。",
    "在数独中，每一行、每一列和每个3x3宫格中的数字1-9都只能出现一次。",
    "使用笔记模式可以记录可能的数字，这对解决困难的数独非常有帮助。",
    "您知道吗？数独起源于瑞士，后来在日本流行并得到了发展。",
    "如果遇到困难的数独，试着寻找\"唯一候选数\"——某个位置只能填一个特定的数字。",
    "数独学堂提供了多种难度级别的数独，从入门到专家，总有适合您的难度。"
];

// 常见问题和回答
const faqResponses = {
    "怎么玩数独": "数独的规则很简单：在9×9的网格中填入1到9的数字，使得每行、每列和每个3×3宫格内的数字不重复。开始时，部分格子已经有数字，您需要根据这些已知数字推理出其他空格中应该填什么数字。",
    "如何使用笔记功能": "点击屏幕上的\"笔记模式\"按钮，状态会从\"关闭\"变为\"开启\"。在笔记模式下，点击数字会在格子中添加小笔记，而不是直接填入数字。再次点击可以移除笔记。",
    "数独太难了": "可以尝试以下方法：1. 使用提示功能获取帮助；2. 选择较低难度的题目；3. 练习基本解题技巧，如唯一候选数、排除法等；4. 使用笔记功能记录可能的数字。",
    "如何保存进度": "数独学堂会自动保存您的游戏进度。关闭页面后再次打开，仍然可以继续之前的游戏。也可以点击\"保存到题库\"按钮，将当前数独保存到您的个人题库中。",
    "能否打印数独": "是的，点击\"下载题目\"按钮可以导出当前数独题目，然后您可以打印出来进行离线游戏。",
    "如何查看答案": "在游戏界面点击\"查看答案\"按钮即可查看完整的答案。不过，我们鼓励您自己解决数独，这样更有成就感！"
};

// API 配置
const API_CONFIG = {
    apiKey: "80991fb8-17f0-44d6-bf43-09bc5d5fcd8e", // API密钥
    apiEndpoint: "https://ark.cn-beijing.volces.com/api/v3/chat/completions", // API接口地址
    model: "doubao-1.5-pro-32k-250115" // 默认使用的模型ID
};

// 创建AI助手悬浮球和对话框的DOM元素
document.addEventListener('DOMContentLoaded', function() {
    // 创建悬浮球
    const floatingBall = document.createElement('div');
    floatingBall.className = 'ai-floating-ball';
    floatingBall.innerHTML = '<i class="fas fa-robot"></i>';
    document.body.appendChild(floatingBall);
    
    // 创建对话框
    const assistantDialog = document.createElement('div');
    assistantDialog.className = 'ai-assistant-dialog';
    assistantDialog.innerHTML = `
        <div class="ai-dialog-header">
            <div class="ai-dialog-title">
                <i class="fas fa-robot"></i>
                <span>数独学堂AI助手</span>
            </div>
            <button class="ai-dialog-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="ai-dialog-content"></div>
        <div class="ai-dialog-input">
            <input type="text" class="ai-input-field" placeholder="请输入您的问题...">
            <button class="ai-send-button">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;
    document.body.appendChild(assistantDialog);
    
    // 获取DOM元素引用
    const dialogContent = assistantDialog.querySelector('.ai-dialog-content');
    const dialogCloseButton = assistantDialog.querySelector('.ai-dialog-close');
    const inputField = assistantDialog.querySelector('.ai-input-field');
    const sendButton = assistantDialog.querySelector('.ai-send-button');
    
    // 添加欢迎消息
    addAssistantMessage(getRandomResponse());
    
    // 悬浮球点击事件：打开对话框
    floatingBall.addEventListener('click', function() {
        assistantDialog.classList.add('active');
        // 如果对话内容为空，添加欢迎消息
        if (dialogContent.childElementCount === 0) {
            addAssistantMessage(getRandomResponse());
        }
    });
    
    // 关闭按钮点击事件
    dialogCloseButton.addEventListener('click', function() {
        assistantDialog.classList.remove('active');
    });
    
    // 发送消息事件
    sendButton.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 发送消息函数
    function sendMessage() {
        const userMessage = inputField.value.trim();
        if (userMessage === '') return;
        
        // 添加用户消息到对话内容
        addUserMessage(userMessage);
        
        // 清空输入框
        inputField.value = '';
        
        // 显示打字指示器
        showTypingIndicator();
        
        // 先尝试使用本地FAQ回答
        const localResponse = getLocalResponse(userMessage);
        
        if (localResponse) {
            // 有本地匹配的回答，使用本地响应
            setTimeout(function() {
                // 移除打字指示器
                removeTypingIndicator();
                
                // 添加助手回复
                addAssistantMessage(localResponse);
                
                // 滚动到对话内容底部
                scrollToBottom();
            }, 700);
        } else {
            // 没有本地匹配，调用API
            callChatAPI(userMessage);
        }
    }
    
    // 获取当前数独题目的信息
    function getCurrentSudokuInfo() {
        // 数据结构初始化
        let sudokuData = {
            grid: null,
            currentState: null,
            solution: null,
            progress: 0,
            difficulty: "未知",
            timer: "00:00"
        };
        
        try {
            // 从DOM元素直接读取当前数独状态
            const sudokuCells = document.querySelectorAll('.sudoku-cell');
            if (sudokuCells && sudokuCells.length === 81) {
                // 创建9x9的二维数组来存储当前状态
                let currentStateGrid = Array(9).fill().map(() => Array(9).fill(0));
                let filledCells = 0;
                
                // 遍历所有单元格并提取数字
                sudokuCells.forEach((cell, index) => {
                    const row = Math.floor(index / 9);
                    const col = index % 9;
                    
                    // 获取单元格的值（如果有的话）
                    let cellValue = 0;
                    if (cell.textContent && !isNaN(parseInt(cell.textContent))) {
                        cellValue = parseInt(cell.textContent);
                        filledCells++;
                    }
                    
                    currentStateGrid[row][col] = cellValue;
                });
                
                sudokuData.currentState = currentStateGrid;
                
                // 计算完成进度
                sudokuData.progress = Math.round((filledCells / 81) * 100);
            } else {
                console.log("无法找到数独单元格或单元格数量不正确");
            }
            
            // 获取难度信息
            const difficultyStars = document.querySelector('.difficulty-stars');
            if (difficultyStars) {
                sudokuData.difficulty = difficultyStars.textContent.trim();
            }
            
            // 获取当前计时
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                sudokuData.timer = timerElement.textContent.trim();
            }
            
            // 尝试从全局变量获取原始数独和解决方案（如果可能）
            if (typeof window.dailyChallengeGrid !== 'undefined' && Array.isArray(window.dailyChallengeGrid)) {
                sudokuData.grid = formatSudokuGrid(window.dailyChallengeGrid);
            }
            
            if (typeof window.solutionGrid !== 'undefined' && Array.isArray(window.solutionGrid)) {
                sudokuData.solution = formatSudokuGrid(window.solutionGrid);
            }
            
            // 检查是否有可用的原始数独数据，如果没有，可以尝试从DOM推断
            if (!sudokuData.grid && sudokuData.currentState) {
                // 检测哪些单元格是预设的（通常有不同的CSS类）
                const presetCells = document.querySelectorAll('.sudoku-cell.preset');
                if (presetCells && presetCells.length > 0) {
                    // 复制当前状态作为基础
                    let originalGrid = JSON.parse(JSON.stringify(sudokuData.currentState));
                    
                    // 将非预设格子设为0
                    sudokuCells.forEach((cell, index) => {
                        if (!cell.classList.contains('preset')) {
                            const row = Math.floor(index / 9);
                            const col = index % 9;
                            originalGrid[row][col] = 0;
                        }
                    });
                    
                    sudokuData.grid = originalGrid;
                }
            }
            
            console.log("数独数据收集成功:", sudokuData);
        } catch (error) {
            console.error("获取数独信息时出错:", error);
        }
        
        return sudokuData;
    }
    
    // 将一维数组格式化为可读的二维数独网格
    function formatSudokuGrid(gridArray) {
        if (!Array.isArray(gridArray) || gridArray.length !== 81) {
            return null;
        }
        
        let formattedGrid = [];
        for (let i = 0; i < 9; i++) {
            let row = [];
            for (let j = 0; j < 9; j++) {
                row.push(gridArray[i * 9 + j]);
            }
            formattedGrid.push(row);
        }
        
        return formattedGrid;
    }
    
    // 调用聊天API
    async function callChatAPI(userMessage) {
        try {
            // 获取当前数独信息并添加调试信息
            const sudokuInfo = getCurrentSudokuInfo();
            
            // 添加调试消息
            if (userMessage.toLowerCase().includes("调试") || userMessage.toLowerCase().includes("debug")) {
                // 直接返回调试信息，不调用API
                let debugInfo = "**AI助手调试信息**\n\n";
                debugInfo += "1. 数独数据收集：\n";
                debugInfo += `- 难度：${sudokuInfo.difficulty}\n`;
                debugInfo += `- 完成进度：${sudokuInfo.progress}%\n`;
                debugInfo += `- 当前用时：${sudokuInfo.timer}\n\n`;
                
                // 如果有当前状态，显示部分
                if (sudokuInfo.currentState) {
                    debugInfo += "2. 当前数独状态（部分显示）：\n```\n";
                    debugInfo += sudokuGridToString(sudokuInfo.currentState).split('\n').slice(0, 5).join('\n');
                    debugInfo += "\n...\n```\n\n";
                } else {
                    debugInfo += "2. 无法读取当前数独状态\n\n";
                }
                
                // 显示原始网格状态（如果有）
                if (sudokuInfo.grid) {
                    debugInfo += "3. 原始数独题目：已获取\n\n";
                } else {
                    debugInfo += "3. 原始数独题目：未获取\n\n";
                }
                
                // 显示解决方案状态（如果有）
                if (sudokuInfo.solution) {
                    debugInfo += "4. 数独解决方案：已获取\n\n";
                } else {
                    debugInfo += "4. 数独解决方案：未获取\n\n";
                }
                
                // 显示页面检测结果
                debugInfo += "5. DOM元素检测：\n";
                debugInfo += `- 数独单元格：${document.querySelectorAll('.sudoku-cell').length}个\n`;
                debugInfo += `- 预设单元格：${document.querySelectorAll('.sudoku-cell.preset').length}个\n`;
                debugInfo += `- 可编辑单元格：${document.querySelectorAll('.sudoku-cell.editable').length}个\n`;
                
                removeTypingIndicator();
                addAssistantMessage(debugInfo);
                return;
            }
            
            // 构建系统提示信息，包含当前数独状态
            let systemPrompt = "你是数独学堂的AI助手，可以帮助用户解答关于数独游戏的问题。请提供简洁、友好的回答，专注于数独规则、技巧、策略等相关内容。回答要有礼貌且专业。";
            
            // 优化：无论用户问什么，都附加当前题目网格
            if (sudokuInfo.currentState) {
                systemPrompt += "\n\n当前用户正在解决的数独题目信息如下：";
                systemPrompt += `\n- 难度：${sudokuInfo.difficulty}`;
                systemPrompt += `\n- 完成进度：${sudokuInfo.progress}%`;
                systemPrompt += `\n- 当前用时：${sudokuInfo.timer}`;
                systemPrompt += "\n\n当前数独题目：";
                systemPrompt += "\n```\n" + sudokuGridToString(sudokuInfo.currentState) + "\n```";
                if (sudokuInfo.solution) {
                    systemPrompt += "\n\n数独解决方案：";
                    systemPrompt += "\n```\n" + sudokuGridToString(sudokuInfo.solution) + "\n```";
                }
            }
            
            // 构建请求体
            const requestBody = {
                model: API_CONFIG.model,
                messages: [
                    {
                        role: "system",
                        content: [
                            {
                                type: "text",
                                text: systemPrompt
                            }
                        ]
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: userMessage
                            }
                        ]
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            };
            
            console.log("发送API请求:", requestBody);
            
            // 发送API请求
            const response = await fetch(API_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_CONFIG.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            
            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '请求AI助手失败');
            }
            
            // 解析响应数据
            const data = await response.json();
            
            // 移除打字指示器
            removeTypingIndicator();
            
            // 获取模型回复
            if (data.choices && data.choices.length > 0) {
                const aiResponse = data.choices[0].message.content;
                addAssistantMessage(aiResponse);
            } else {
                throw new Error('AI助手没有返回有效回答');
            }
            
        } catch (error) {
            console.error('AI API调用错误:', error);
            
            // 移除打字指示器
            removeTypingIndicator();
            
            // 出错时使用备用回复
            addAssistantMessage("抱歉，我暂时无法回答这个问题。请尝试问一些关于数独游戏规则或技巧的问题，我会尽力帮助您。");
        }
        
        // 滚动到对话内容底部
        scrollToBottom();
    }
    
    // 将二维数独网格转换为格式化的字符串
    function sudokuGridToString(grid) {
        if (!grid || !Array.isArray(grid)) return "无法获取数独数据";
        
        let result = "";
        for (let i = 0; i < grid.length; i++) {
            if (i > 0 && i % 3 === 0) {
                result += "------+-------+------\n";
            }
            
            const row = grid[i];
            for (let j = 0; j < row.length; j++) {
                if (j > 0 && j % 3 === 0) {
                    result += "| ";
                }
                
                const value = row[j] === 0 ? "." : row[j];
                result += value + " ";
            }
            result += "\n";
        }
        
        return result;
    }
    
    // 添加用户消息到对话内容
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'ai-message user';
        messageElement.innerHTML = `<div class="ai-message-bubble">${escapeHtml(message)}</div>`;
        dialogContent.appendChild(messageElement);
        scrollToBottom();
    }
    
    // 添加助手消息到对话内容
    function addAssistantMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'ai-message assistant';
        messageElement.innerHTML = `<div class="ai-message-bubble">${message}</div>`;
        dialogContent.appendChild(messageElement);
        scrollToBottom();
    }
    
    // 显示打字指示器
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'ai-message assistant typing';
        typingElement.innerHTML = `
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        dialogContent.appendChild(typingElement);
        scrollToBottom();
    }
    
    // 移除打字指示器
    function removeTypingIndicator() {
        const typingElement = dialogContent.querySelector('.typing');
        if (typingElement) {
            dialogContent.removeChild(typingElement);
        }
    }
    
    // 获取随机回复
    function getRandomResponse() {
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // 根据用户消息获取本地回答
    function getLocalResponse(userMessage) {
        // 转换为小写以进行匹配
        const lowerMessage = userMessage.toLowerCase();
        
        // 检查是否匹配FAQ问题
        for (const question in faqResponses) {
            if (lowerMessage.includes(question.toLowerCase())) {
                return faqResponses[question];
            }
        }
        
        // 关键词检测
        if (lowerMessage.includes('题目') && lowerMessage.includes('跳转')) {
            return "您可以通过题目ID直接跳转到特定的数独题目，只需在\"题目编号跳转\"输入框中输入ID即可，例如：GSM203。";
        }
        
        if (lowerMessage.includes('提示') || lowerMessage.includes('帮助')) {
            return "遇到困难时，可以点击\"提示\"按钮获取帮助。系统会随机填入一个正确数字，这对于解决棘手的局面很有帮助。";
        }
        
        if (lowerMessage.includes('笔记') || lowerMessage.includes('候选')) {
            return "笔记模式允许您在格子中记录可能的数字。点击\"笔记模式\"按钮开启此功能，然后点击数字可以添加为小笔记，再次点击则移除。这对于高级解题技巧非常实用。";
        }
        
        if (lowerMessage.includes('保存') || lowerMessage.includes('进度')) {
            return "数独学堂会自动保存您的游戏进度。如果您想永久保存当前题目，可以点击\"保存到题库\"按钮，将其添加到个人题库中以便日后使用。";
        }
        
        // 如果没有匹配，返回null以触发API调用
        return null;
    }
    
    // 滚动到对话内容底部
    function scrollToBottom() {
        dialogContent.scrollTop = dialogContent.scrollHeight;
    }
    
    // HTML转义函数，防止XSS攻击
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});

// 全局同步函数，供主逻辑调用
window.syncSudokuToAI = function() {
    if (typeof getCurrentSudokuInfo === 'function') {
        const info = getCurrentSudokuInfo();
        console.log('AI助手已同步最新数独状态:', info);
        // 可选：在AI助手对话框显示提示
        // addAssistantMessage('已同步最新题目状态');
    }
};