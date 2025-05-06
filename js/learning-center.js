// 数独学堂 - 学习中心JavaScript文件

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 设置导航切换
    setupNavigation();
    
    // 初始化3D数独演示
    initSudoku3D();
    
    // 设置技巧示例按钮
    setupTechniqueButtons();
    
    // 设置案例播放按钮
    setupCasePlayback();
    
    // 初始化目录折叠功能
    initializeNavToggle();
});

/**
 * 设置导航切换功能
 * 点击左侧导航切换右侧内容
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有导航链接的active类
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // 为当前点击的链接添加active类
            this.classList.add('active');
            
            // 隐藏所有内容区块
            const contentSections = document.querySelectorAll('.content-section');
            contentSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // 显示对应的内容区块
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // 更新URL锚点
            const href = this.getAttribute('href');
            history.pushState(null, null, href);
        });
    });
    
    // 根据URL锚点显示对应内容
    const hash = window.location.hash;
    if (hash) {
        const activeLink = document.querySelector(`.nav-link[href="${hash}"]`);
        if (activeLink) {
            activeLink.click();
        }
    }
}

/**
 * 初始化3D数独演示
 * 使用Three.js创建3D交互式数独演示
 */
function initSudoku3D() {
    // 检查是否有3D容器和Three.js是否已加载
    const container = document.getElementById('sudoku-3d');
    if (!container || typeof THREE === 'undefined') return;
    
    // 场景、相机和渲染器
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // 浅背景色
    
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // 添加轨道控制
    if (typeof THREE.OrbitControls !== 'undefined') {
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxDistance = 30;
        controls.minDistance = 5;
    }
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    
    // 创建数独网格
    const gridGroup = new THREE.Group();
    scene.add(gridGroup);
    
    // 数独盘面大小
    const gridSize = 9;
    const cellSize = 1;
    const totalSize = gridSize * cellSize;
    const halfSize = totalSize / 2;
    
    // 创建网格单元格
    const boxGeometry = new THREE.BoxGeometry(cellSize, cellSize, 0.1);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    
    // 材质集
    const defaultMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const highlightMaterial = new THREE.MeshLambertMaterial({ color: 0xdbeafe });
    const errorMaterial = new THREE.MeshLambertMaterial({ color: 0xfecaca });
    
    // 3D数独单元格数组
    const cells = [];
    
    // 为每个单元格创建3D框
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cellMesh = new THREE.Mesh(boxGeometry, defaultMaterial);
            
            // 定位单元格
            cellMesh.position.x = col * cellSize - halfSize + cellSize / 2;
            cellMesh.position.y = -row * cellSize + halfSize - cellSize / 2;
            cellMesh.position.z = 0;
            
            // 添加单元格边框
            const edges = new THREE.LineSegments(
                new THREE.EdgesGeometry(boxGeometry),
                edgeMaterial
            );
            cellMesh.add(edges);
            
            // 添加到网格组和单元格数组
            gridGroup.add(cellMesh);
            cells.push({
                mesh: cellMesh,
                row: row,
                col: col,
                box: Math.floor(row / 3) * 3 + Math.floor(col / 3),
                value: 0
            });
        }
    }
    
    // 添加粗线分隔九宫格
    const thickLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    
    // 水平粗线
    for (let i = 1; i < 3; i++) {
        const y = -i * 3 * cellSize + halfSize;
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-halfSize, y, 0.06),
            new THREE.Vector3(halfSize, y, 0.06)
        ]);
        const line = new THREE.Line(lineGeometry, thickLineMaterial);
        gridGroup.add(line);
    }
    
    // 垂直粗线
    for (let i = 1; i < 3; i++) {
        const x = i * 3 * cellSize - halfSize;
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, halfSize, 0.06),
            new THREE.Vector3(x, -halfSize, 0.06)
        ]);
        const line = new THREE.Line(lineGeometry, thickLineMaterial);
        gridGroup.add(line);
    }
    
    // 添加一些预设的数字
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
    
    // 字体加载器
    const fontLoader = new THREE.FontLoader();
    
    // 尝试加载内置字体，如果失败则创建字体回退方案
    try {
        fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
            // 为预设值创建3D文本
            for (let i = 0; i < cells.length; i++) {
                if (demoValues[i] !== 0) {
                    const cell = cells[i];
                    cell.value = demoValues[i];
                    
                    const textGeometry = new THREE.TextGeometry(demoValues[i].toString(), {
                        font: font,
                        size: 0.5,
                        height: 0.1
                    });
                    
                    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x1e3a8a });
                    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                    
                    // 居中文本
                    textGeometry.computeBoundingBox();
                    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
                    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
                    
                    textMesh.position.x = cell.mesh.position.x - textWidth / 2;
                    textMesh.position.y = cell.mesh.position.y - textHeight / 2;
                    textMesh.position.z = 0.1;
                    
                    gridGroup.add(textMesh);
                    cell.textMesh = textMesh;
                }
            }
        });
    } catch (error) {
        console.log('字体加载失败，使用回退方案');
        
        // 字体加载失败时的回退方案
        for (let i = 0; i < cells.length; i++) {
            if (demoValues[i] !== 0) {
                const cell = cells[i];
                cell.value = demoValues[i];
                
                // 使用HTML标签添加数字
                const digitDiv = document.createElement('div');
                digitDiv.textContent = demoValues[i];
                digitDiv.style.position = 'absolute';
                digitDiv.style.color = '#1e3a8a';
                digitDiv.style.fontSize = '16px';
                digitDiv.style.fontWeight = 'bold';
                
                // 转换3D位置到屏幕坐标
                const vector = new THREE.Vector3(cell.mesh.position.x, cell.mesh.position.y, 0.1);
                vector.project(camera);
                
                const x = (vector.x * 0.5 + 0.5) * container.clientWidth;
                const y = (-vector.y * 0.5 + 0.5) * container.clientHeight;
                
                digitDiv.style.left = `${x}px`;
                digitDiv.style.top = `${y}px`;
                
                container.appendChild(digitDiv);
                cell.digitDiv = digitDiv;
            }
        }
    }
    
    // 更新点击的单元格位置的函数
    function updateCellPosition(cellDiv, cell) {
        if (cellDiv && cell) {
            const vector = new THREE.Vector3(cell.mesh.position.x, cell.mesh.position.y, 0.1);
            vector.project(camera);
            
            const x = (vector.x * 0.5 + 0.5) * container.clientWidth;
            const y = (-vector.y * 0.5 + 0.5) * container.clientHeight;
            
            cellDiv.style.left = `${x}px`;
            cellDiv.style.top = `${y}px`;
        }
    }
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 更新控制器（如果存在）
        if (typeof THREE.OrbitControls !== 'undefined' && controls) {
            controls.update();
        }
        
        // 更新HTML数字的位置（如果使用回退方案）
        cells.forEach(cell => {
            if (cell.digitDiv) {
                updateCellPosition(cell.digitDiv, cell);
            }
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // 窗口大小改变时调整3D场景
    window.addEventListener('resize', function() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // 设置演示控制按钮
    const highlightRowBtn = document.getElementById('highlight-row');
    const highlightColumnBtn = document.getElementById('highlight-column');
    const highlightBoxBtn = document.getElementById('highlight-box');
    const resetDemoBtn = document.getElementById('reset-demo');
    
    // 高亮行冲突
    if (highlightRowBtn) {
        highlightRowBtn.addEventListener('click', function() {
            resetHighlights();
            
            // 选择第4行进行演示
            const targetRow = 3;
            const rowCells = cells.filter(cell => cell.row === targetRow);
            
            // 高亮整行
            rowCells.forEach(cell => {
                cell.mesh.material = highlightMaterial;
            });
            
            // 添加冲突数字3
            const conflictValue = 3;
            
            // 第一个3已经存在（预设值）
            const firstThreeCell = rowCells.find(cell => cell.value === conflictValue);
            
            // 找到空白格子添加第二个3
            const emptyCell = rowCells.find(cell => cell.value === 0);
            if (emptyCell && firstThreeCell) {
                // 显示错误
                emptyCell.mesh.material = errorMaterial;
                
                // 添加冲突数字
                try {
                    if (emptyCell.textMesh) {
                        // 已有文本网格，更新值
                        emptyCell.value = conflictValue;
                        emptyCell.textMesh.geometry = new THREE.TextGeometry(conflictValue.toString(), {
                            font: font,
                            size: 0.5,
                            height: 0.1
                        });
                    } else if (emptyCell.digitDiv) {
                        // 使用HTML方式
                        emptyCell.value = conflictValue;
                        emptyCell.digitDiv.textContent = conflictValue;
                        emptyCell.digitDiv.style.color = '#ef4444'; // 错误颜色
                    }
                } catch (error) {
                    console.log('无法添加冲突数字，使用备用方案');
                    
                    // 备用方案：添加HTML标签
                    const errorDigit = document.createElement('div');
                    errorDigit.textContent = conflictValue;
                    errorDigit.style.position = 'absolute';
                    errorDigit.style.color = '#ef4444';
                    errorDigit.style.fontSize = '16px';
                    errorDigit.style.fontWeight = 'bold';
                    
                    // 转换3D位置到屏幕坐标
                    updateCellPosition(errorDigit, emptyCell);
                    
                    container.appendChild(errorDigit);
                    emptyCell.digitDiv = errorDigit;
                    emptyCell.value = conflictValue;
                }
                
                // 动画效果：抖动效果
                const originalZ = emptyCell.mesh.position.z;
                let time = 0;
                const shakeInterval = setInterval(() => {
                    time += 0.1;
                    emptyCell.mesh.position.z = originalZ + Math.sin(time * 10) * 0.1;
                    
                    if (time > 2) {
                        clearInterval(shakeInterval);
                        emptyCell.mesh.position.z = originalZ;
                    }
                }, 16);
            }
        });
    }
    
    // 高亮列冲突
    if (highlightColumnBtn) {
        highlightColumnBtn.addEventListener('click', function() {
            resetHighlights();
            
            // 选择第6列进行演示
            const targetCol = 5;
            const colCells = cells.filter(cell => cell.col === targetCol);
            
            // 高亮整列
            colCells.forEach(cell => {
                cell.mesh.material = highlightMaterial;
            });
            
            // 添加冲突数字5
            const conflictValue = 5;
            
            // 第一个5已经存在（预设值）
            const firstFiveCell = colCells.find(cell => cell.value === conflictValue);
            
            // 找到空白格子添加第二个5
            const emptyCell = colCells.find(cell => cell.value === 0);
            if (emptyCell && firstFiveCell) {
                // 显示错误
                emptyCell.mesh.material = errorMaterial;
                
                // 添加冲突数字（使用备用方案）
                const errorDigit = document.createElement('div');
                errorDigit.textContent = conflictValue;
                errorDigit.style.position = 'absolute';
                errorDigit.style.color = '#ef4444';
                errorDigit.style.fontSize = '16px';
                errorDigit.style.fontWeight = 'bold';
                
                // 转换3D位置到屏幕坐标
                updateCellPosition(errorDigit, emptyCell);
                
                container.appendChild(errorDigit);
                emptyCell.digitDiv = errorDigit;
                emptyCell.value = conflictValue;
                
                // 动画效果：抖动效果
                const originalZ = emptyCell.mesh.position.z;
                let time = 0;
                const shakeInterval = setInterval(() => {
                    time += 0.1;
                    emptyCell.mesh.position.z = originalZ + Math.sin(time * 10) * 0.1;
                    
                    if (time > 2) {
                        clearInterval(shakeInterval);
                        emptyCell.mesh.position.z = originalZ;
                    }
                }, 16);
            }
        });
    }
    
    // 高亮宫冲突
    if (highlightBoxBtn) {
        highlightBoxBtn.addEventListener('click', function() {
            resetHighlights();
            
            // 选择左上角宫格进行演示
            const targetBox = 0;
            const boxCells = cells.filter(cell => cell.box === targetBox);
            
            // 高亮整个宫格
            boxCells.forEach(cell => {
                cell.mesh.material = highlightMaterial;
            });
            
            // 添加冲突数字9
            const conflictValue = 9;
            
            // 第一个9已经存在（预设值）
            const firstNineCell = boxCells.find(cell => cell.value === conflictValue);
            
            // 找到空白格子添加第二个9
            const emptyCell = boxCells.find(cell => cell.value === 0);
            if (emptyCell && firstNineCell) {
                // 显示错误
                emptyCell.mesh.material = errorMaterial;
                
                // 添加冲突数字（使用备用方案）
                const errorDigit = document.createElement('div');
                errorDigit.textContent = conflictValue;
                errorDigit.style.position = 'absolute';
                errorDigit.style.color = '#ef4444';
                errorDigit.style.fontSize = '16px';
                errorDigit.style.fontWeight = 'bold';
                
                // 转换3D位置到屏幕坐标
                updateCellPosition(errorDigit, emptyCell);
                
                container.appendChild(errorDigit);
                emptyCell.digitDiv = errorDigit;
                emptyCell.value = conflictValue;
                
                // 动画效果：抖动效果
                const originalZ = emptyCell.mesh.position.z;
                let time = 0;
                const shakeInterval = setInterval(() => {
                    time += 0.1;
                    emptyCell.mesh.position.z = originalZ + Math.sin(time * 10) * 0.1;
                    
                    if (time > 2) {
                        clearInterval(shakeInterval);
                        emptyCell.mesh.position.z = originalZ;
                    }
                }, 16);
            }
        });
    }
    
    // 重置演示
    if (resetDemoBtn) {
        resetDemoBtn.addEventListener('click', resetDemo);
    }
    
    // 重置高亮和错误状态
    function resetHighlights() {
        cells.forEach(cell => {
            cell.mesh.material = defaultMaterial;
            
            // 如果有添加的错误数字，移除它
            if (cell.digitDiv && cell.value !== demoValues[cells.indexOf(cell)]) {
                if (container.contains(cell.digitDiv)) {
                    container.removeChild(cell.digitDiv);
                }
                cell.digitDiv = null;
                cell.value = demoValues[cells.indexOf(cell)];
                
                // 如果是预设值，重新添加
                if (cell.value !== 0) {
                    const digitDiv = document.createElement('div');
                    digitDiv.textContent = cell.value;
                    digitDiv.style.position = 'absolute';
                    digitDiv.style.color = '#1e3a8a';
                    digitDiv.style.fontSize = '16px';
                    digitDiv.style.fontWeight = 'bold';
                    
                    updateCellPosition(digitDiv, cell);
                    
                    container.appendChild(digitDiv);
                    cell.digitDiv = digitDiv;
                }
            }
            
            // 重置位置
            cell.mesh.position.z = 0;
        });
    }
    
    // 完全重置演示
    function resetDemo() {
        resetHighlights();
        
        // 可以添加其他重置逻辑，如重置相机位置
        camera.position.set(0, 0, 15);
        if (typeof THREE.OrbitControls !== 'undefined' && controls) {
            controls.reset();
        }
    }
}

/**
 * 设置技巧示例按钮
 * 点击按钮显示对应的解题技巧动态示例
 */
function setupTechniqueButtons() {
    const techniqueButtons = document.querySelectorAll('[data-technique]');
    
    techniqueButtons.forEach(button => {
        button.addEventListener('click', function() {
            const technique = this.getAttribute('data-technique');
            showTechniqueDemo(technique);
        });
    });
}

/**
 * 显示解题技巧动态示例
 * @param {string} technique - 技巧名称
 */
function showTechniqueDemo(technique) {
    // 这里可以实现各种技巧的动态演示
    // 简单起见，使用alert展示信息
    
    let message = '';
    
    switch (technique) {
        case 'sole-candidate':
            message = '唯一数法示例：在第3行中，数字4只能放在第8列，因为其他位置都被排除了。';
            break;
        case 'elimination':
            message = '排除法示例：这个格子只能是7，因为1-6和8-9都因为行、列或宫的限制被排除了。';
            break;
        case 'scanning':
            message = '扫描法示例：系统地检查第5行发现缺少数字2和7，进一步分析可确定它们的位置。';
            break;
        case 'x-wing':
            message = 'X-Wing示例：数字5在第1行和第5行都只能出现在第2列和第7列，因此可以排除其他行这两列中的数字5。';
            break;
        case 'unique-rectangle':
            message = '唯一矩形示例：如果这四个格子只包含2和7，会导致多解。因此第四个角一定不只包含2和7。';
            break;
        case 'y-wing':
            message = 'Y-Wing示例：中心格子有候选数2,5，左翼格子有候选数2,9，右翼格子有候选数5,9。因此，可以排除同时看到左右翼格子的单元格中的数字9。';
            break;
        default:
            message = '暂无此技巧的动态示例，敬请期待。';
    }
    
    alert(message);
    
    // 在实际应用中，应该使用更丰富的交互式演示
    // 例如，突出显示特定的网格单元格，动画显示解题过程
}

/**
 * 设置案例播放按钮
 * 实现分步演示解题过程
 */
function setupCasePlayback() {
    const playCase1Button = document.getElementById('play-case1');
    
    if (playCase1Button) {
        playCase1Button.addEventListener('click', function() {
            alert('案例一解题过程演示将在弹窗中依次显示解题步骤。点击确定开始。');
            
            // 使用setTimeout模拟动画步骤
            setTimeout(() => {
                alert('步骤1: 扫描整个数独盘面，发现第1行第3列的格子只能填入数字4。');
                
                setTimeout(() => {
                    alert('步骤2: 在左上角的3×3宫中，数字7只能填在第2行第2列的格子中。');
                    
                    setTimeout(() => {
                        alert('步骤3: 填入数字7后，发现第1列只剩下第9行可以填入数字3。');
                        
                        setTimeout(() => {
                            alert('步骤4: 通过不断应用唯一数法和排除法，逐步填满整个数独盘面。');
                            
                            setTimeout(() => {
                                alert('演示完成！在实际应用中，这将是一个交互式的、可视化的解题过程。');
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        });
    }
}

/**
 * 初始化导航折叠功能
 */
function initializeNavToggle() {
    // 获取所有章节标题
    const sectionTitles = document.querySelectorAll('.nav-section-title');
    
    // 为每个章节标题添加点击事件
    sectionTitles.forEach(title => {
        title.addEventListener('click', function() {
            // 获取当前章节的链接列表
            const navLinks = this.nextElementSibling;
            
            // 切换折叠状态
            if (this.classList.contains('collapsed')) {
                // 展开
                this.classList.remove('collapsed');
                navLinks.style.display = 'flex';
            } else {
                // 折叠
                this.classList.add('collapsed');
                navLinks.style.display = 'none';
            }
        });
    });
    
    // 为所有导航链接添加平滑滚动功能
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止默认跳转行为
            
            // 移除所有导航链接的active类
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // 为当前点击的链接添加active类
            this.classList.add('active');
            
            // 获取目标元素ID
            const targetId = this.getAttribute('href').substring(1);
            
            // 平滑滚动到目标位置
            scrollToSection(targetId);
        });
    });
}

/**
 * 根据目标ID滚动到对应区域
 * @param {string} targetId - 目标元素ID
 */
function scrollToSection(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        // 计算目标元素的位置，考虑页面头部高度
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        
        // 平滑滚动到目标元素
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // 添加URL锚点但不跳转
        history.pushState(null, null, `#${targetId}`);
    }
}

// 初始内容加载完毕后显示第一个章节
window.onload = function() {
    // 获取默认显示的章节
    const firstSection = document.querySelector('.nav-section');
    if (firstSection) {
        // 展开第一个章节
        const firstLinks = firstSection.querySelector('.nav-links');
        if (firstLinks) {
            firstLinks.style.display = 'flex';
        }
    }
    
    // 检查URL中是否有锚点
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        // 提取锚点ID
        const targetId = hash.substring(1);
        
        // 找到对应的导航链接
        const targetLink = document.querySelector(`.nav-link[href="${hash}"]`);
        if (targetLink) {
            // 激活对应的导航链接
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            targetLink.classList.add('active');
            
            // 确保导航链接所在的章节展开
            const navSection = targetLink.closest('.nav-section');
            if (navSection) {
                const navLinks = navSection.querySelector('.nav-links');
                const sectionTitle = navSection.querySelector('.nav-section-title');
                if (navLinks && sectionTitle) {
                    navLinks.style.display = 'flex';
                    sectionTitle.classList.remove('collapsed');
                }
            }
        }
        
        // 延迟滚动到目标位置，确保页面完全加载
        setTimeout(() => {
            scrollToSection(targetId);
        }, 300);
    }
}; 