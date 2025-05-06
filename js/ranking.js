/**
 * 排行榜页面脚本
 * 处理排行榜页面的交互和数据展示
 */

// 在文档加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化排行榜数据
    initRankingData();
    
    // 初始化视图切换
    initViewToggle();
    
    // 初始化筛选器
    initFilters();
    
    // 初始化分页
    initPagination();
    
    // 初始化排名徽章着色
    initRankHighlighting();
    
    // 初始化用户统计
    updateUserStats();
});

/**
 * 初始化表格/网格视图切换
 */
function initViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const tableView = document.querySelector('.ranking-table-view');
    const gridView = document.querySelector('.ranking-grid-view');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按钮的活动状态
            viewButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的活动状态
            button.classList.add('active');
            
            // 获取视图类型
            const viewType = button.getAttribute('data-view');
            
            // 切换视图
            if (viewType === 'table') {
                tableView.classList.add('active');
                gridView.classList.remove('active');
            } else {
                gridView.classList.add('active');
                tableView.classList.remove('active');
            }
            
            // 保存用户偏好设置
            localStorage.setItem('rankingViewPreference', viewType);
        });
    });
    
    // 应用保存的视图偏好
    const savedViewPreference = localStorage.getItem('rankingViewPreference');
    if (savedViewPreference) {
        const preferredButton = document.querySelector(`.view-btn[data-view="${savedViewPreference}"]`);
        if (preferredButton) {
            preferredButton.click();
        }
    }
}

/**
 * 初始化筛选器功能
 */
function initFilters() {
    const difficultyFilter = document.getElementById('difficulty-filter');
    const timeFilter = document.getElementById('time-filter');
    
    // 筛选器变化时重新加载数据
    difficultyFilter.addEventListener('change', applyFilters);
    timeFilter.addEventListener('change', applyFilters);
    
    // 应用之前保存的筛选设置
    const savedDifficulty = localStorage.getItem('rankingDifficultyFilter');
    const savedTimeFilter = localStorage.getItem('rankingTimeFilter');
    
    if (savedDifficulty) {
        difficultyFilter.value = savedDifficulty;
    }
    
    if (savedTimeFilter) {
        timeFilter.value = savedTimeFilter;
    }
    
    // 初始应用筛选器
    applyFilters();
}

/**
 * 应用筛选器设置并重新加载数据
 */
function applyFilters() {
    // 获取筛选值
    const difficultyValue = document.getElementById('difficulty-filter').value;
    const timeValue = document.getElementById('time-filter').value;
    
    // 保存筛选设置到本地存储
    localStorage.setItem('rankingDifficultyFilter', difficultyValue);
    localStorage.setItem('rankingTimeFilter', timeValue);
    
    // 在这里添加实际的数据筛选逻辑
    // 当连接到后端API时，这里将发送请求获取筛选后的数据
    console.log(`Filtering by: difficulty=${difficultyValue}, time=${timeValue}`);
    
    // 模拟筛选操作（在实际应用中，这将替换为API调用）
    simulateFilteredData(difficultyValue, timeValue);
}

/**
 * 模拟获取筛选后的数据
 * @param {string} difficulty - 难度级别筛选
 * @param {string} timeRange - 时间范围筛选
 */
function simulateFilteredData(difficulty, timeRange) {
    // 显示加载状态
    showLoadingState();
    
    // 模拟网络延迟
    setTimeout(() => {
        // 在真实应用中，这里将根据筛选结果更新表格和网格视图
        
        // 模拟没有匹配记录的情况
        if (difficulty === 'expert' && timeRange === 'this-week') {
            showNoDataMessage();
        } else {
            hideLoadingState();
        }
    }, 500);
}

/**
 * 显示加载状态
 */
function showLoadingState() {
    const tableBody = document.querySelector('.ranking-table tbody');
    const gridView = document.querySelector('.ranking-grid');
    
    if (tableBody && gridView) {
        // 添加加载指示器的类
        tableBody.classList.add('loading');
        gridView.classList.add('loading');
    }
}

/**
 * 隐藏加载状态
 */
function hideLoadingState() {
    const tableBody = document.querySelector('.ranking-table tbody');
    const gridView = document.querySelector('.ranking-grid');
    
    if (tableBody && gridView) {
        // 移除加载指示器的类
        tableBody.classList.remove('loading');
        gridView.classList.remove('loading');
    }
}

/**
 * 显示无数据消息
 */
function showNoDataMessage() {
    const tableBody = document.querySelector('.ranking-table tbody');
    const gridView = document.querySelector('.ranking-grid');
    
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data-message">
                    <div class="no-data">
                        <i class="fas fa-search"></i>
                        <p>没有找到匹配的记录</p>
                    </div>
                </td>
            </tr>
        `;
    }
    
    if (gridView) {
        gridView.innerHTML = `
            <div class="no-data">
                <i class="fas fa-search"></i>
                <p>没有找到匹配的记录</p>
            </div>
        `;
    }
}

/**
 * 初始化分页控制
 */
function initPagination() {
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    
    paginationButtons.forEach(button => {
        if (!button.hasAttribute('disabled')) {
            button.addEventListener('click', () => {
                // 移除所有按钮的活动状态
                paginationButtons.forEach(btn => {
                    if (!btn.querySelector('i')) { // 排除箭头按钮
                        btn.classList.remove('active');
                    }
                });
                
                // 如果是数字按钮，添加活动状态
                if (!button.querySelector('i')) {
                    button.classList.add('active');
                }
                
                // 获取页码
                const page = button.textContent || '1';
                
                // 模拟加载对应页面的数据
                loadPage(page);
            });
        }
    });
}

/**
 * 加载指定页码的数据
 * @param {string} page - 页码
 */
function loadPage(page) {
    // 显示加载状态
    showLoadingState();
    
    // 模拟网络延迟
    setTimeout(() => {
        // 在真实应用中，这里将请求并加载指定页码的数据
        console.log(`Loading page ${page}`);
        
        // 更新URL参数但不刷新页面
        updateUrlParams('page', page);
        
        // 隐藏加载状态
        hideLoadingState();
    }, 500);
}

/**
 * 更新URL参数
 * @param {string} key - 参数名
 * @param {string} value - 参数值
 */
function updateUrlParams(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

/**
 * 初始化排名徽章着色
 */
function initRankHighlighting() {
    // 实现排名徽章着色的逻辑
}

/**
 * 初始化用户统计
 */
function updateUserStats() {
    // 实现用户统计的逻辑
} 