/**
 * 数独学习页面脚本 
 * 处理学习页面的交互和动画效果
 */

// 在文档加载完成后执行初始化
document.addEventListener('DOMContentLoaded', () => {
    // 缓存DOM元素
    const DOM = {
        menuItems: document.querySelectorAll('.learn-menu a'),
        sections: document.querySelectorAll('.learn-section'),
        progressBar: document.querySelector('.progress'),
        progressText: document.querySelector('.progress-text'),
        hintButtons: document.querySelectorAll('.hint-btn'),
        solutionButtons: document.querySelectorAll('.solution-btn')
    };

    // 初始化页面
    initPage();

    /**
     * 初始化页面功能
     */
    function initPage() {
        // 设置菜单项点击事件
        setupMenuNavigation();
        
        // 设置滚动监听
        setupScrollSpy();
        
        // 初始化进度追踪
        initProgressTracking();
        
        // 设置练习区按钮事件
        setupPracticeButtons();
    }

    /**
     * 设置菜单导航功能
     */
    function setupMenuNavigation() {
        DOM.menuItems.forEach(item => {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                
                // 获取目标部分的ID
                const targetId = item.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                // 平滑滚动到目标部分
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 20,
                        behavior: 'smooth'
                    });
                    
                    // 更新活动菜单项
                    updateActiveMenuItem(item);
                }
            });
        });
    }

    /**
     * 更新活动菜单项
     * @param {HTMLElement} activeItem - 当前活动的菜单项
     */
    function updateActiveMenuItem(activeItem) {
        // 移除所有菜单项的活动状态
        DOM.menuItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加当前项的活动状态
        activeItem.classList.add('active');
    }

    /**
     * 设置滚动监听，根据滚动位置更新活动菜单项
     */
    function setupScrollSpy() {
        window.addEventListener('scroll', () => {
            // 获取当前滚动位置
            const scrollPosition = window.scrollY + 100;
            
            // 检查哪个部分在视图中
            DOM.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    // 找到对应的菜单项并激活
                    const id = section.id;
                    const menuItem = document.querySelector(`.learn-menu a[href="#${id}"]`);
                    
                    if (menuItem) {
                        updateActiveMenuItem(menuItem);
                        updateProgress();
                    }
                }
            });
        });
    }

    /**
     * 初始化进度追踪功能
     */
    function initProgressTracking() {
        // 检查本地存储中是否有进度记录
        const savedProgress = localStorage.getItem('sudokuLearnProgress');
        
        if (savedProgress) {
            // 恢复保存的进度
            const progress = JSON.parse(savedProgress);
            updateProgressBar(progress.percentage);
            
            // 如果有已完成的部分，标记它们
            if (progress.completedSections) {
                progress.completedSections.forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        section.classList.add('completed');
                    }
                });
            }
        } else {
            // 初始进度为0
            updateProgressBar(0);
        }
    }

    /**
     * 更新进度条
     * @param {number} percentage - 完成百分比(0-100)
     */
    function updateProgressBar(percentage) {
        DOM.progressBar.style.width = `${percentage}%`;
        DOM.progressText.textContent = `${Math.round(percentage)}% 完成`;
    }

    /**
     * 根据当前位置更新进度
     */
    function updateProgress() {
        // 计算已查看的部分数量
        const totalSections = DOM.sections.length;
        let viewedSections = 0;
        
        // 获取当前滚动位置
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        DOM.sections.forEach(section => {
            if (section.offsetTop < scrollPosition) {
                viewedSections++;
                
                // 标记部分为已查看
                markSectionAsViewed(section.id);
            }
        });
        
        // 计算进度百分比
        const percentage = (viewedSections / totalSections) * 100;
        
        // 更新进度条
        updateProgressBar(percentage);
        
        // 保存进度到本地存储
        saveProgress(percentage);
    }

    /**
     * 标记部分为已查看
     * @param {string} sectionId - 部分的ID
     */
    function markSectionAsViewed(sectionId) {
        // 从本地存储获取当前已完成的部分
        const savedProgress = localStorage.getItem('sudokuLearnProgress');
        let progress = { completedSections: [], percentage: 0 };
        
        if (savedProgress) {
            progress = JSON.parse(savedProgress);
        }
        
        // 如果此部分尚未标记为已完成，则添加它
        if (!progress.completedSections.includes(sectionId)) {
            progress.completedSections.push(sectionId);
            
            // 重新计算百分比
            const percentage = (progress.completedSections.length / DOM.sections.length) * 100;
            progress.percentage = percentage;
            
            // 保存更新的进度
            localStorage.setItem('sudokuLearnProgress', JSON.stringify(progress));
        }
    }

    /**
     * 保存进度到本地存储
     * @param {number} percentage - 完成百分比
     */
    function saveProgress(percentage) {
        // 获取当前已完成的部分
        const completedSections = [];
        DOM.sections.forEach(section => {
            if (section.offsetTop < window.scrollY + window.innerHeight / 2) {
                completedSections.push(section.id);
            }
        });
        
        // 创建进度对象
        const progress = {
            percentage: percentage,
            completedSections: completedSections,
            lastVisit: new Date().toISOString()
        };
        
        // 保存到本地存储
        localStorage.setItem('sudokuLearnProgress', JSON.stringify(progress));
    }

    /**
     * 设置练习区按钮事件
     */
    function setupPracticeButtons() {
        // 设置提示按钮点击事件
        DOM.hintButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 显示与按钮关联的提示
                const hintId = button.dataset.hint;
                const hintElement = document.getElementById(hintId);
                
                if (hintElement) {
                    hintElement.classList.toggle('visible');
                    
                    // 更新按钮文本
                    if (hintElement.classList.contains('visible')) {
                        button.textContent = '隐藏提示';
                    } else {
                        button.textContent = '显示提示';
                    }
                }
            });
        });
        
        // 设置解答按钮点击事件
        DOM.solutionButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 显示与按钮关联的解答
                const solutionId = button.dataset.solution;
                const solutionElement = document.getElementById(solutionId);
                
                if (solutionElement) {
                    solutionElement.classList.toggle('visible');
                    
                    // 更新按钮文本
                    if (solutionElement.classList.contains('visible')) {
                        button.textContent = '隐藏解答';
                    } else {
                        button.textContent = '显示解答';
                    }
                }
            });
        });
    }
}); 