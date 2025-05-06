@echo off
chcp 65001 > nul
title 数独学堂 - 启动选项
color 0A

:MENU
cls
echo.
echo  ===================================
echo      欢迎使用数独学堂启动工具
echo  ===================================
echo.
echo  请选择启动方式:
echo.
echo  [1] 使用Node.js服务器启动 (推荐)
echo  [2] 使用Python服务器启动
echo  [3] 使用默认浏览器直接打开
echo  [4] 使用Chrome浏览器打开
echo  [5] 使用Edge浏览器打开
echo  [6] 查看启动帮助文档
echo  [0] 退出
echo.
echo  ===================================
echo.

set /p choice=请输入选项编号并按回车: 

if "%choice%"=="1" goto START_NODE
if "%choice%"=="2" goto START_PYTHON
if "%choice%"=="3" goto OPEN_DEFAULT
if "%choice%"=="4" goto OPEN_CHROME
if "%choice%"=="5" goto OPEN_EDGE
if "%choice%"=="6" goto HELP
if "%choice%"=="0" goto END

echo 输入无效，请重新选择!
timeout /t 2 >nul
goto MENU

:START_NODE
cls
echo 正在启动Node.js服务器...
echo 请不要关闭此窗口，关闭窗口将停止服务器
echo.
echo 服务器启动后，请访问: http://localhost:3000/
echo.
echo [提示] 按Ctrl+C可以停止服务器
echo.
node server.js
goto END

:START_PYTHON
cls
echo 正在启动Python服务器...
echo 请不要关闭此窗口，关闭窗口将停止服务器
echo.
echo 服务器启动后，请访问: http://localhost:8000/
echo.
echo [提示] 按Ctrl+C可以停止服务器
echo.
python -m http.server 8000
goto END

:OPEN_DEFAULT
echo 正在使用默认浏览器打开数独学堂...
start index.html
goto END

:OPEN_CHROME
echo 正在使用Chrome浏览器打开数独学堂...
start chrome "%CD%\index.html"
goto END

:OPEN_EDGE
echo 正在使用Edge浏览器打开数独学堂...
start msedge "%CD%\index.html"
goto END

:HELP
cls
echo.
echo  ===================================
echo          数独学堂启动帮助
echo  ===================================
echo.
echo  不同启动方式的说明:
echo.
echo  [1] Node.js服务器 - 需要安装Node.js，功能最完整
echo      适合大多数用户，提供完整的网站体验
echo.
echo  [2] Python服务器 - 需要安装Python
echo      如果无法使用Node.js，这是替代选项
echo.
echo  [3] 直接用浏览器打开 - 最简单但功能可能受限
echo      由于浏览器安全限制，部分功能可能不可用
echo.
echo  [4/5] 指定浏览器打开 - 使用特定浏览器
echo        适合测试不同浏览器的兼容性
echo.
echo  遇到问题?
echo  请查看"如何运行.md"文件获取更多帮助
echo.
echo  ===================================
echo.
pause
goto MENU

:END
exit 