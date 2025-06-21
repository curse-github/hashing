@echo off
powershell "tsc"
powershell "tsc --module es2022 --target es6 --strict true --skipLibCheck true ./makeThing.ts"
powershell "npm run build"
powershell "npm run testAES"
pause