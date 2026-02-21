@echo off
set /p msg="Enter commit message: "
echo [Crossword Builder] Pushing changes to GitHub...
git add .
git commit -m "%msg%"
git push origin main
echo [Done] GitHub Actions will handle the deployment.
pause
