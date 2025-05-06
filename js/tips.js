/**
 * 数独学堂 - 技巧提示页面JavaScript
 */

// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 设置主题切换按钮事件
    document.getElementById('theme-toggle-btn').addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            this.title = "切换到亮色主题";
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            this.title = "切换到暗色主题";
        }
        // 保存用户主题偏好
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
    
    // 应用保存的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('#theme-toggle-btn i');
        if (icon) {
            icon.classList.replace('fa-moon', 'fa-sun');
        }
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.title = "切换到亮色主题";
        }
    }
}); 