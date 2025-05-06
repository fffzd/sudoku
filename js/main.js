// 数独学堂 - 主要JavaScript文件

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化粒子背景
    initParticles();
    
    // 生成演示数独盘
    generateDemoGrid();
    
    // 设置「查看更多」按钮事件
    setupMoreInfoButton();
    
    // 设置名言轮播
    setupQuoteCarousel();
});

/**
 * 初始化粒子背景
 * 使用particles.js库创建数字粒子效果
 */
function initParticles() {
    // 检查particles.js是否已加载
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 50, // 粒子数量
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#3b82f6' // 粒子颜色 - 蓝色
                },
                shape: {
                    type: 'char', // 使用字符作为粒子
                    character: {
                        value: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], // 数字字符
                        font: 'Arial',
                        style: 'normal',
                        weight: 'bold'
                    }
                },
                opacity: {
                    value: 0.3,
                    random: true
                },
                size: {
                    value: 15,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#64748b',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
}

/**
 * 生成演示数独盘
 * 创建一个预设的数独盘用于展示
 */
function generateDemoGrid() {
    const demoGrid = document.getElementById('demo-grid');
    if (!demoGrid) return;
    
    // 预设的演示数独盘（部分填充）
    // 0表示空白格
    const demoValues = [
        5, 3, 0, 0, 7, 0, 0, 0, 0,
        6, 0, 0, 1, 9, 5, 0, 0, 0,
        0, 9, 8, 0, 0, 0, 0, 6, 0,
        8, 0, 0, 0, 6, 0, 0, 0, 3,
        4, 0, 0, 8, 0, 3, 0, 0, 1,
        7, 0, 0, 0, 2, 0, 0, 0, 6,
        0, 6, 0, 0, 0, 0, 2, 8, 0,
        0, 0, 0, 4, 1, 9, 0, 0, 5,
        0, 0, 0, 0, 8, 0, 0, 7, 9
    ];
    
    // 清空网格
    demoGrid.innerHTML = '';
    
    // 创建81个格子
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.classList.add('sudoku-cell');
        
        // 预设值不为0则显示数字
        if (demoValues[i] !== 0) {
            cell.textContent = demoValues[i];
            cell.classList.add('preset');
        }
        
        // 将格子添加到网格
        demoGrid.appendChild(cell);
        
        // 添加单元格点击事件 - 高亮显示
        cell.addEventListener('click', function() {
            // 移除其他格子的高亮
            document.querySelectorAll('.sudoku-cell.highlight').forEach(el => {
                el.classList.remove('highlight');
            });
            
            // 添加高亮
            this.classList.add('highlight');
        });
    }
    
    // 随机高亮一个格子，增加视觉吸引力
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * 81);
        const randomCell = demoGrid.children[randomIndex];
        randomCell.classList.add('highlight');
    }, 1000);
}

/**
 * 设置「查看更多」按钮事件
 * 控制更多信息的显示和隐藏
 */
function setupMoreInfoButton() {
    const showMoreBtn = document.getElementById('show-more');
    const moreInfo = document.getElementById('more-info');
    
    if (showMoreBtn && moreInfo) {
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
}

/**
 * 设置名言轮播
 * 定期切换数独相关的名言
 */
function setupQuoteCarousel() {
    const quoteCarousel = document.getElementById('quote-carousel');
    if (!quoteCarousel) return;
    
    // 名言列表
    const quotes = [
        '"数独是大脑的瑜伽。" —— 韦恩·古尔德',
        '"数独并非数学难题，而是逻辑推理游戏。" —— 霍华德·加恩斯',
        '"在数独中，每个数字找到其位置的过程，就如同人生找到自己定位一样重要。" —— 村上春树',
        '"解数独如同生活，需要耐心、专注和持之以恒。" —— 威尔·肖特兹',
        '"数独是21世纪最受欢迎的智力游戏，因为它简单而富有挑战性。" —— 尼克·斯奈德'
    ];
    
    let currentQuoteIndex = 0;
    
    // 每10秒切换一次名言
    setInterval(() => {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        
        // 淡出淡入效果
        quoteCarousel.style.opacity = 0;
        
        setTimeout(() => {
            quoteCarousel.innerHTML = `<p>${quotes[currentQuoteIndex]}</p>`;
            quoteCarousel.style.opacity = 1;
        }, 500);
    }, 10000);
}

/**
 * 平滑滚动到指定元素
 * @param {string} elementId - 目标元素ID
 */
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
} 