@echo off
setlocal

chcp 65001 >nul

rem 切到脚本所在目录的上一级，也就是项目根目录
cd /d "%~dp0.."

set "MSG=%~1"
if "%MSG%"=="" set "MSG=docs: update notes"

echo 生成侧边栏...
node "%CD%\scripts\generate-sidebar.mjs"
if errorlevel 1 exit /b 1

echo 本地构建检查...
call npm run docs:build
if errorlevel 1 exit /b 1

rem 检查是否有变更
git diff --quiet
if not errorlevel 1 goto has_changes

git diff --cached --quiet
if not errorlevel 1 goto has_changes

echo 没有检测到文件变更，无需提交。
exit /b 0

:has_changes
echo 添加文件...
git add .
if errorlevel 1 exit /b 1

echo 提交变更...
git commit -m "%MSG%"
if errorlevel 1 exit /b 1

echo 推送到 GitHub...
git push origin main
if errorlevel 1 exit /b 1

echo 完成。GitHub Actions 会自动部署网站。
exit /b 0