/**
 * 数独学堂 - 历史页面JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // 地图点击交互
    const mapMarkers = document.querySelectorAll('.map-marker');
    
    mapMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const country = this.getAttribute('data-country');
            const tooltip = this.nextElementSibling;
            
            // 将所有tooltip设为隐藏
            document.querySelectorAll('.map-tooltip').forEach(tip => {
                tip.style.opacity = '0';
                tip.style.visibility = 'hidden';
            });
            
            // 显示当前tooltip
            tooltip.style.opacity = '1';
            tooltip.style.visibility = 'visible';
        });
    });
    
    // 点击其他地方关闭tooltip
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('map-marker')) {
            document.querySelectorAll('.map-tooltip').forEach(tip => {
                tip.style.opacity = '0';
                tip.style.visibility = 'hidden';
            });
        }
    });
    
    // 图片放大查看功能
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('.gallery-image');
            const caption = this.querySelector('.gallery-caption').textContent;
            
            // 创建模态框
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.style.flexDirection = 'column';
            modal.style.zIndex = '1000';
            
            // 创建图片元素
            const modalImg = document.createElement('img');
            modalImg.src = img.src;
            modalImg.style.maxWidth = '80%';
            modalImg.style.maxHeight = '80%';
            modalImg.style.objectFit = 'contain';
            
            // 创建说明文字
            const modalCaption = document.createElement('div');
            modalCaption.textContent = caption;
            modalCaption.style.color = 'white';
            modalCaption.style.marginTop = '20px';
            modalCaption.style.padding = '10px';
            
            // 添加到模态框
            modal.appendChild(modalImg);
            modal.appendChild(modalCaption);
            
            // 添加到body
            document.body.appendChild(modal);
            
            // 点击关闭
            modal.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
        });
    });
}); 