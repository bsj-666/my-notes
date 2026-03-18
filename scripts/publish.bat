@echo off
setlocal enabledelayedexpansion

set MSG=%~1

if "%MSG%"=="" (
  set MSG=docs: update notes
)

echo 生成侧边栏...
node scripts\generate-sidebar.mjs

echo 本地构建检查...
call npm run docs:build
if errorlevel 1 exit /b 1

git status --porcelain > temp_git_status.txt
set /p CHANGES=<temp_git_status.txt
del temp_git_status.txt

if "%CHANGES%"=="" (
  echo 没有检测到文件变更，无需提交。
  exit /b 0
)

echo 添加文件...
git add .

echo 提交变更...
git commit -m "%MSG%"

echo 推送到 GitHub...
git push origin main

echo 完成。GitHub Actions 会自动部署网站。