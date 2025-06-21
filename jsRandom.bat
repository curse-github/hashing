@echo off
powershell "./jsBuild.bat"
powershell "npm run testRandom"
pause