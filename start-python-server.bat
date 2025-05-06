@echo off
echo 正在使用Python启动数独学堂服务器...
echo 请不要关闭此窗口，关闭窗口将停止服务器
echo 服务器启动后，请访问: http://localhost:8000
echo.

python -m http.server 8000

pause 